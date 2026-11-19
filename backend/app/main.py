import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from app.routers.predict import router as predict_router
from app.services.english_bert import ModelNotReadyError, load_english_model
from app.services.bangla_bert import BanglaBertError, load_bangla_model

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    try:
        app.state.english_bert = await run_in_threadpool(load_english_model)
        app.state.english_bert_error = None
        logger.info("English BERT loaded locally on CPU.")
    except ModelNotReadyError as exc:
        app.state.english_bert = None
        app.state.english_bert_error = str(exc)
        logger.exception("English BERT failed to load.")
    try:
        app.state.bangla_bert = await run_in_threadpool(load_bangla_model)
        app.state.bangla_bert_error = None
        logger.info("BanglaBERT loaded from %s on CPU.", "backend/models/banglabert")
    except BanglaBertError as exc:
        app.state.bangla_bert = None
        app.state.bangla_bert_error = str(exc)
        logger.exception("BanglaBERT failed to load.")
    yield

app = FastAPI(title="Bilingual Fake News Detection API", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["*"])
app.include_router(predict_router, prefix="/api", tags=["prediction"])

@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
