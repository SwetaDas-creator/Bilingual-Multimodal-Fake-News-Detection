import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from app.routers.predict import router as predict_router
from app.services.english_bert import ModelNotReadyError, load_english_model
from app.services.bangla_bert import BanglaBertError, load_bangla_model
from app.services.english_multimodal import EnglishMultimodalError, load_english_multimodal
from app.services.bengali_multimodal import BanglaMultimodalError, load_bangla_multimodal

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    loaders = [
        ("english_bert", load_english_model, ModelNotReadyError, "English BERT"),
        ("bangla_bert", load_bangla_model, BanglaBertError, "BanglaBERT"),
        ("english_multimodal", load_english_multimodal, EnglishMultimodalError, "English multimodal"),
        ("bangla_multimodal", load_bangla_multimodal, BanglaMultimodalError, "Bengali multimodal"),
    ]
    for key, loader, error_type, label in loaders:
        try:
            setattr(app.state, key, await run_in_threadpool(loader))
            setattr(app.state, f"{key}_error", None)
            logger.info("%s model loaded locally on CPU.", label)
        except error_type as exc:
            setattr(app.state, key, None)
            setattr(app.state, f"{key}_error", str(exc))
            logger.exception("%s model failed to load.", label)
    yield

app = FastAPI(title="Bilingual Fake News Detection API", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["*"])
app.include_router(predict_router, prefix="/api", tags=["prediction"])

@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
