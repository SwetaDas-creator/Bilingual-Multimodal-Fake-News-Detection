import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from app.schemas.prediction import Verdict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = BACKEND_ROOT / "models" / "english_bert"
LABEL_MAPPING_FILE = MODEL_DIR / "label_mapping.json"


class ModelNotReadyError(RuntimeError):
    """Raised when local English BERT files or their saved label mapping are unavailable."""


def _label_to_id(mapping: Any) -> dict[str, int] | None:
    """Normalize a saved HF id2label or label2id mapping without guessing class order."""
    if not isinstance(mapping, dict) or not mapping:
        return None

    normalized: dict[str, int] = {}
    if all(str(key).isdigit() for key in mapping):
        for key, value in mapping.items():
            if not isinstance(value, str):
                return None
            normalized[value.strip().upper()] = int(key)
    else:
        for key, value in mapping.items():
            try:
                normalized[str(key).strip().upper()] = int(value)
            except (TypeError, ValueError):
                return None

    if set(normalized) != {"FAKE", "REAL"} or len(set(normalized.values())) != 2:
        return None
    return normalized


def _saved_label_to_id(config: Any) -> dict[str, int]:
    candidates = [
        getattr(config, "label2id", None),
        getattr(config, "id2label", None),
    ]

    if LABEL_MAPPING_FILE.is_file():
        try:
            saved_mapping = json.loads(LABEL_MAPPING_FILE.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise ModelNotReadyError(
                f"Could not read saved label mapping at {LABEL_MAPPING_FILE}."
            ) from exc

        if isinstance(saved_mapping, dict):
            candidates.extend(
                [
                    saved_mapping.get("label2id"),
                    saved_mapping.get("id2label"),
                    saved_mapping,
                ]
            )

    for candidate in candidates:
        result = _label_to_id(candidate)
        if result is not None:
            return result

    raise ModelNotReadyError(
        "The saved model must provide an FAKE/REAL label mapping in its "
        "Hugging Face config or models/english_bert/label_mapping.json."
    )


@dataclass
class EnglishBertClassifier:
    tokenizer: Any
    model: Any
    label_to_id: dict[str, int]


def load_english_model() -> EnglishBertClassifier:
    """Load local English BERT weights once for the application process on CPU."""
    if not MODEL_DIR.is_dir():
        raise ModelNotReadyError(
            f"English BERT model files are missing. Copy the saved tokenizer, "
            f"configuration, and weights into {MODEL_DIR}."
        )

    try:
        tokenizer = AutoTokenizer.from_pretrained(
            str(MODEL_DIR),
            local_files_only=True,
        )
        model = AutoModelForSequenceClassification.from_pretrained(
            str(MODEL_DIR),
            local_files_only=True,
        )
    except Exception as exc:
        raise ModelNotReadyError(
            f"Could not load the local English BERT model from {MODEL_DIR}. "
            "Check that its tokenizer, config, and weight files are valid and present."
        ) from exc

    label_to_id = _saved_label_to_id(model.config)
    if getattr(model.config, "num_labels", len(label_to_id)) != 2:
        raise ModelNotReadyError(
            "The English BERT model must have exactly two output labels: FAKE and REAL."
        )
    if set(label_to_id.values()) != {0, 1}:
        raise ModelNotReadyError(
            "The saved FAKE/REAL mapping must map the two classes to output indices 0 and 1."
        )

    model.eval()
    model.to(torch.device("cpu"))
    return EnglishBertClassifier(
        tokenizer=tokenizer,
        model=model,
        label_to_id=label_to_id,
    )


def _tokenizer_max_length(tokenizer: Any) -> int:
    value = getattr(tokenizer, "model_max_length", 512)
    if not isinstance(value, int) or value <= 0 or value > 4096:
        return 512
    return min(value, 512)


def predict_english(
    text: str,
    classifier: EnglishBertClassifier,
) -> tuple[Verdict, float, str]:
    """Run CPU inference using the model and saved FAKE/REAL class mapping."""
    try:
        inputs = classifier.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=_tokenizer_max_length(classifier.tokenizer),
        )
        with torch.inference_mode():
            logits = classifier.model(**inputs).logits.squeeze(0)
            if logits.ndim != 1 or logits.shape[0] != 2:
                raise ModelNotReadyError(
                    "The English BERT model must return exactly two class scores."
                )
            probabilities = torch.softmax(logits, dim=-1)
            predicted_id = int(torch.argmax(probabilities).item())
            confidence = float(probabilities[predicted_id].item())
    except ModelNotReadyError:
        raise
    except Exception as exc:
        raise RuntimeError("Model inference could not be completed.") from exc

    predicted_label = next(
        label
        for label, label_id in classifier.label_to_id.items()
        if label_id == predicted_id
    )
    verdict: Verdict = "likely_fake" if predicted_label == "FAKE" else "likely_real"
    explanation = (
        f"The saved English BERT classifier assigned the label {predicted_label} "
        f"with {confidence:.1%} model confidence."
    )
    return verdict, confidence, explanation
