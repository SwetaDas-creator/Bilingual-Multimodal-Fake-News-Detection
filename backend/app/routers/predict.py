import logging
from typing import Annotated
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from starlette.concurrency import run_in_threadpool
from app.schemas.prediction import DetectionMode, DetectionResponse, Language
from app.services.english_bert import ModelNotReadyError, predict_english
from app.services.bangla_bert import BanglaBertError, predict_bangla
from app.services.english_multimodal import EnglishMultimodalError, predict_english_multimodal
from app.services.bengali_multimodal import BanglaMultimodalError, predict_bangla_multimodal

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/predict", response_model=DetectionResponse)
async def predict(request: Request, mode: Annotated[DetectionMode, Form()], language: Annotated[Language, Form()], text: Annotated[str | None, Form()] = None, image: Annotated[UploadFile | None, File()] = None) -> DetectionResponse:
    if mode == "image-only":
        raise HTTPException(status_code=501, detail="Image-only detection is not implemented.")
    if mode == "multimodal":
        raise HTTPException(status_code=422, detail="Select English or Bengali for multimodal analysis.")
    if mode in ("english-text", "bangla-text"):
        expected_language = "English" if mode == "english-text" else "Bengali"
        if language != expected_language:
            raise HTTPException(status_code=422, detail=f"Mode '{mode}' requires language='{expected_language}'.")
        if not text or not text.strip():
            raise HTTPException(status_code=422, detail="Non-empty text is required for text detection.")
        if mode == "english-text": key, fn, model_name = "english_bert", predict_english, "BERT"
        else: key, fn, model_name = "bangla_bert", predict_bangla, "BanglaBERT"
        classifier = getattr(request.app.state, key, None)
        if classifier is None: raise HTTPException(status_code=503, detail=getattr(request.app.state, f"{key}_error", f"{model_name} is unavailable."))
        try: verdict, confidence, explanation = await run_in_threadpool(fn, text.strip(), classifier)
        except (ModelNotReadyError, BanglaBertError, ValueError) as exc: raise HTTPException(status_code=422 if isinstance(exc, ValueError) else 503, detail=str(exc)) from exc
        except Exception as exc:
            logger.exception("%s inference failed", model_name)
            raise HTTPException(status_code=500, detail=f"{model_name} inference failed.") from exc
    elif mode in ("english-multimodal", "bangla-multimodal"):
        expected_language = "English" if mode == "english-multimodal" else "Bengali"
        if language != expected_language:
            raise HTTPException(status_code=422, detail=f"Mode '{mode}' requires language='{expected_language}'.")
        if not text or not text.strip(): raise HTTPException(status_code=422, detail="Non-empty text is required for multimodal analysis.")
        if image is None: raise HTTPException(status_code=422, detail="An image is required for multimodal analysis.")
        image_bytes = await image.read()
        if not image_bytes: raise HTTPException(status_code=422, detail="The uploaded image is empty.")
        if len(image_bytes) > 5 * 1024 * 1024: raise HTTPException(status_code=413, detail="Image exceeds the 5 MB limit.")
        if mode == "english-multimodal": key, fn, model_name = "english_multimodal", predict_english_multimodal, "English BERT + ResNet-50"
        else: key, fn, model_name = "bangla_multimodal", predict_bangla_multimodal, "BanglaBERT + ResNet-50"
        classifier = getattr(request.app.state, key, None)
        if classifier is None: raise HTTPException(status_code=503, detail=getattr(request.app.state, f"{key}_error", f"{model_name} is unavailable."))
        try: verdict, confidence, explanation = await run_in_threadpool(fn, text.strip(), image_bytes, classifier)
        except (EnglishMultimodalError, BanglaMultimodalError, ValueError) as exc: raise HTTPException(status_code=422 if isinstance(exc, ValueError) else 503, detail=str(exc)) from exc
        except Exception as exc:
            logger.exception("%s inference failed", model_name)
            raise HTTPException(status_code=500, detail=f"{model_name} inference failed.") from exc
    else:
        raise HTTPException(status_code=501, detail=f"Detection mode '{mode}' is not implemented.")
    return DetectionResponse(verdict=verdict, confidence=confidence, mode=mode, language=language, model=model_name, explanation=explanation)
