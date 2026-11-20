from dataclasses import dataclass
from pathlib import Path
from typing import Any

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from app.schemas.prediction import Verdict
from app.model_storage import get_model_base_path

MODEL_DIR = get_model_base_path() / "banglabert"

class BanglaBertError(RuntimeError):
    """Local BanglaBERT model is unavailable or inference failed."""

@dataclass
class BanglaBertClassifier:
    tokenizer: Any
    model: Any

def load_bangla_model() -> BanglaBertClassifier:
    if not MODEL_DIR.is_dir():
        raise BanglaBertError(f"BanglaBERT files not found at {MODEL_DIR}")
    try:
        tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR), local_files_only=True)
        model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_DIR), local_files_only=True)
        if model.config.num_labels != 2:
            raise BanglaBertError("BanglaBERT must have two output labels (FAKE, REAL).")
        model.to(torch.device("cpu"))
        model.eval()
        return BanglaBertClassifier(tokenizer=tokenizer, model=model)
    except BanglaBertError:
        raise
    except Exception as exc:
        raise BanglaBertError(f"Could not load local BanglaBERT from {MODEL_DIR}") from exc

def predict_bangla(text: str, classifier: BanglaBertClassifier) -> tuple[Verdict, float, str]:
    if not text or not text.strip():
        raise ValueError("Non-empty Bengali text is required.")
    try:
        inputs = classifier.tokenizer(text.strip(), return_tensors="pt", truncation=True, max_length=256)
        with torch.inference_mode():
            logits = classifier.model(**inputs).logits.squeeze(0)
            if logits.ndim != 1 or logits.shape[0] != 2:
                raise BanglaBertError("BanglaBERT must return exactly two class scores.")
            probabilities = torch.softmax(logits, dim=-1)
            idx = int(torch.argmax(probabilities).item())
            confidence = float(probabilities[idx].item())
    except BanglaBertError:
        raise
    except Exception as exc:
        raise RuntimeError("BanglaBERT inference failed.") from exc
    label = "FAKE" if idx == 0 else "REAL"
    verdict: Verdict = "likely_fake" if idx == 0 else "likely_real"
    return verdict, confidence, f"BanglaBERT assigned label {label} with {confidence:.1%} model confidence."
