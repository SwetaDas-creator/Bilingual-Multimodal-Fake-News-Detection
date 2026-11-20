from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Any

import torch
import torch.nn as nn
from PIL import Image, UnidentifiedImageError
from torchvision import models, transforms
from transformers import AutoConfig, AutoModel, AutoTokenizer

from app.schemas.prediction import Verdict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = BACKEND_ROOT / "models" / "english_multimodal"
TEXT_MODEL_DIR = BACKEND_ROOT / "models" / "english_bert"

class EnglishMultimodalError(RuntimeError):
    """English multimodal checkpoint or inference is unavailable."""

class EnglishMultimodalModel(nn.Module):
    def __init__(self, config: Any):
        super().__init__()
        self.text_encoder = AutoModel.from_config(config)
        self.img_encoder = models.resnet50(weights=None)
        self.img_encoder.fc = nn.Identity()
        self.classifier = nn.Sequential(nn.Linear(768 + 2048, 512), nn.ReLU(), nn.Dropout(0.3), nn.Linear(512, 2))

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor, image: torch.Tensor) -> torch.Tensor:
        text_feat = self.text_encoder(input_ids=input_ids, attention_mask=attention_mask).last_hidden_state[:, 0, :]
        img_feat = self.img_encoder(image)
        return self.classifier(torch.cat((text_feat, img_feat), dim=1))

@dataclass
class EnglishMultimodalClassifier:
    tokenizer: Any
    model: EnglishMultimodalModel
    transform: Any

def load_english_multimodal() -> EnglishMultimodalClassifier:
    if not (MODEL_DIR / "model.pt").is_file():
        raise EnglishMultimodalError(f"Checkpoint missing: {MODEL_DIR / 'model.pt'}")
    try:
        config = AutoConfig.from_pretrained(str(TEXT_MODEL_DIR), local_files_only=True)
        tokenizer = AutoTokenizer.from_pretrained(str(TEXT_MODEL_DIR), local_files_only=True)
        model = EnglishMultimodalModel(config)
        state = torch.load(MODEL_DIR / "model.pt", map_location="cpu", weights_only=True)
        model.load_state_dict(state, strict=True)
        model.to(torch.device("cpu")); model.eval()
        transform = transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor(), transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])])
        return EnglishMultimodalClassifier(tokenizer, model, transform)
    except Exception as exc:
        raise EnglishMultimodalError(f"Could not load the English multimodal model from {MODEL_DIR}: {exc}") from exc

def predict_english_multimodal(text: str, image_bytes: bytes, classifier: EnglishMultimodalClassifier) -> tuple[Verdict, float, str]:
    if not text or not text.strip(): raise ValueError("Non-empty English text is required.")
    if not image_bytes: raise ValueError("A non-empty image is required.")
    try:
        encoded = classifier.tokenizer(text.strip(), truncation=True, padding="max_length", max_length=128, return_tensors="pt")
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        image_tensor = classifier.transform(image).unsqueeze(0)
        with torch.inference_mode():
            logits = classifier.model(encoded["input_ids"], encoded["attention_mask"], image_tensor).squeeze(0)
            if logits.ndim != 1 or logits.shape[0] != 2: raise EnglishMultimodalError("Expected two output logits.")
            probs = torch.softmax(logits, dim=0); idx = int(torch.argmax(probs).item()); confidence = float(probs[idx].item())
    except EnglishMultimodalError: raise
    except (UnidentifiedImageError, OSError) as exc: raise ValueError("The uploaded file is not a valid image.") from exc
    except Exception as exc: raise RuntimeError("English multimodal inference failed.") from exc
    label = "FAKE" if idx == 1 else "REAL"
    verdict: Verdict = "likely_fake" if idx == 1 else "likely_real"
    return verdict, confidence, f"English multimodal model assigned {label} with {confidence:.1%} confidence."
