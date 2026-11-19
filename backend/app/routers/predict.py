import logging
from typing import Annotated
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from starlette.concurrency import run_in_threadpool
from app.schemas.prediction import DetectionMode, DetectionResponse, Language
from app.services.english_bert import ModelNotReadyError, predict_english
from app.services.bangla_bert import BanglaBertError, predict_bangla

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/predict", response_model=DetectionResponse)
async def predict(request: Request, mode: Annotated[DetectionMode, Form()], language: Annotated[Language, Form()], text: Annotated[str | None, Form()] = None, image: Annotated[UploadFile | None, File()] = None) -> DetectionResponse:
    _ = image
    if mode in ("image-only", "multimodal"):
        raise HTTPException(status_code=501, detail=f"Detection mode '{mode}' is not implemented by this backend.")
    if not text or not text.strip():
        raise HTTPException(status_code=422, detail="Non-empty text is required for text detection.")
    if mode == "english-text" and language == "English":
        key, predict_fn, expected_model = "english_bert", predict_english, "BERT"
    elif mode == "bangla-text" and language == "Bengali":
        key, predict_fn, expected_model = "bangla_bert", predict_bangla, "BanglaBERT"
    else:
        raise HTTPException(status_code=422, detail="The selected mode and language do not match.")
    classifier = getattr(request.app.state, key, None)
    if classifier is None:
        detail = getattr(request.app.state, f"{key}_error", f"{expected_model} is unavailable.")
        raise HTTPException(status_code=503, detail=detail)
    try:
        verdict, confidence, explanation = await run_in_threadpool(predict_fn, text.strip(), classifier)
    except (ModelNotReadyError, BanglaBertError, ValueError) as exc:
        raise HTTPException(status_code=422 if isinstance(exc, ValueError) else 503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("%s inference failed", expected_model)
        raise HTTPException(status_code=500, detail=f"{expected_model} inference failed.") from exc
    return DetectionResponse(verdict=verdict, confidence=confidence, mode=mode, language=language, model=expected_model, explanation=explanation)
