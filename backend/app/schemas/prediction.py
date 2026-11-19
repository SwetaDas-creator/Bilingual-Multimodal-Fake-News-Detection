from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

DetectionMode = Literal[
    "bangla-text",
    "english-text",
    "image-only",
    "multimodal",
]
Language = Literal["Bengali", "English", "Not applicable"]
Verdict = Literal["likely_fake", "likely_real", "uncertain"]


class DetectionResponse(BaseModel):
    """Response fields match the existing frontend DetectionResponse contract."""

    model_config = ConfigDict(extra="forbid")

    verdict: Verdict
    confidence: float = Field(ge=0.0, le=1.0)
    mode: DetectionMode
    language: Language
    model: str
    explanation: str
