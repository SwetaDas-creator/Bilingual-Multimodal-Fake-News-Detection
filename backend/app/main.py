import logging
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from app.model_storage import prepare_model_files
from app.routers.predict import router as predict_router
from app.services.english_bert import ModelNotReadyError, load_english_model
from app.services.bangla_bert import BanglaBertError, load_bangla_model
from app.services.english_multimodal import EnglishMultimodalError, load_english_multimodal
from app.services.bengali_multimodal import BanglaMultimodalError, load_bangla_multimodal

logger = logging.getLogger(__name__)
MODEL_LOADERS = [
    ("english_bert", load_english_model, ModelNotReadyError, "English BERT"),
    ("bangla_bert", load_bangla_model, BanglaBertError, "BanglaBERT"),
    ("english_multimodal", load_english_multimodal, EnglishMultimodalError, "English multimodal"),
    ("bangla_multimodal", load_bangla_multimodal, BanglaMultimodalError, "Bengali multimodal"),
]


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    try:
        model_base_path = await run_in_threadpool(prepare_model_files)
        logger.info("Required model files are ready under %s", model_base_path)
    except Exception as exc:
        logger.error("Model asset preparation failed: %s", exc)
        raise RuntimeError("Model asset preparation failed; check S3 configuration and model files.") from None

    for key, loader, _error_type, label in MODEL_LOADERS:
        try:
            setattr(app.state, key, await run_in_threadpool(loader))
            logger.info("%s model loaded on CPU.", label)
        except Exception:
            logger.error("%s model failed to load; refusing to start.", label)
            raise RuntimeError(f"Required model failed to load: {label}.") from None
    yield


app = FastAPI(title="Bilingual Fake News Detection API", version="0.1.0", lifespan=lifespan)
configured_origins = os.environ.get("FRONTEND_ORIGINS")
allowed_origins = (
    [origin.strip() for origin in configured_origins.split(",") if origin.strip()]
    if configured_origins is not None
    else ["http://localhost:3000"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(predict_router, prefix="/api", tags=["prediction"])


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready", tags=["health"])
async def readiness(request: Request) -> dict[str, object]:
    model_status = {
        key: getattr(request.app.state, key, None) is not None
        for key, _loader, _error_type, _label in MODEL_LOADERS
    }
    if not all(model_status.values()):
        raise HTTPException(status_code=503, detail={"status": "not_ready", "models": model_status})
    return {"status": "ready", "models": model_status}