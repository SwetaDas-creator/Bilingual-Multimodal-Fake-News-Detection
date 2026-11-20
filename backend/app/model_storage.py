"""Local and private-S3 model asset preparation for the FastAPI service."""
from __future__ import annotations

import os
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
S3_CONFIGURATION = (
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "S3_BUCKET_NAME",
    "S3_MODEL_PREFIX",
)
REQUIRED_MODEL_FILES = {
    "english_bert": ("config.json", "tokenizer.json", "tokenizer_config.json", "model.safetensors"),
    "banglabert": ("config.json", "tokenizer.json", "tokenizer_config.json", "model.safetensors"),
    "english_multimodal": ("model.pt",),
    "bangla_multimodal": ("model.pt",),
}


class ModelStorageError(RuntimeError):
    """Model assets could not be prepared or validated."""


def get_model_base_path() -> Path:
    configured = os.environ.get("MODEL_BASE_PATH")
    return Path(configured).expanduser().resolve() if configured else (BACKEND_ROOT / "models").resolve()


def _validate_required_files(base_path: Path) -> None:
    missing = []
    for subdirectory, filenames in REQUIRED_MODEL_FILES.items():
        for filename in filenames:
            path = base_path / subdirectory / filename
            if not path.is_file() or path.stat().st_size == 0:
                missing.append(str(path))
    if missing:
        raise ModelStorageError("Required model files are missing or empty: " + ", ".join(missing))


def _configured_s3_values() -> dict[str, str] | None:
    values = {key: os.environ.get(key, "").strip() for key in S3_CONFIGURATION}
    if not any(values.values()):
        return None
    missing = [key for key, value in values.items() if not value]
    if missing:
        raise ModelStorageError("Incomplete S3 configuration; set these environment variables: " + ", ".join(missing))
    return values


def _download_s3_models(base_path: Path, config: dict[str, str]) -> None:
    try:
        import boto3

        client = boto3.client(
            "s3",
            aws_access_key_id=config["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=config["AWS_SECRET_ACCESS_KEY"],
            region_name=config["AWS_REGION"],
        )
        bucket = config["S3_BUCKET_NAME"]
        prefix = config["S3_MODEL_PREFIX"].strip("/")
        prefix = f"{prefix}/" if prefix else ""
        model_prefixes = {
            name: f"{prefix}{name}/"
            for name in REQUIRED_MODEL_FILES
        }
        base_path.mkdir(parents=True, exist_ok=True)
        paginator = client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
            for item in page.get("Contents", []):
                key = item.get("Key", "")
                size = int(item.get("Size", 0))
                match = next(((name, root) for name, root in model_prefixes.items() if key.startswith(root)), None)
                if match is None or key.endswith("/"):
                    continue
                name, key_prefix = match
                parts = key[len(key_prefix):].split("/")
                if not parts or any(part in ("", ".", "..") for part in parts):
                    raise ModelStorageError("The S3 model prefix contains an unsafe object key.")
                destination = (base_path / name).joinpath(*parts)
                if not destination.resolve().is_relative_to(base_path.resolve()):
                    raise ModelStorageError("An S3 model object resolves outside MODEL_BASE_PATH.")
                if destination.is_file() and size > 0 and destination.stat().st_size == size:
                    continue
                destination.parent.mkdir(parents=True, exist_ok=True)
                client.download_file(bucket, key, str(destination))
    except ModelStorageError:
        raise
    except Exception as exc:
        # Only log the exception type; SDK details can contain credential identifiers.
        raise ModelStorageError(f"Could not download model assets from the configured private S3 bucket ({type(exc).__name__}).") from None


def prepare_model_files() -> Path:
    """Download missing or size-mismatched S3 assets, then validate all required files."""
    base_path = get_model_base_path()
    config = _configured_s3_values()
    if config is not None:
        _download_s3_models(base_path, config)
    _validate_required_files(base_path)
    return base_path