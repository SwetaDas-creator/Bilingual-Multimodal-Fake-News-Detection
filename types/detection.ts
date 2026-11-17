export type DetectionMode =
  | "bengali-text"
  | "english-text"
  | "image-only"
  | "multimodal";

export type Language = "Bengali" | "English" | "Not applicable";

export type Verdict = "likely_fake" | "likely_real" | "uncertain";

/** What the frontend sends to the backend. */
export interface DetectionRequest {
  mode: DetectionMode;
  language: Language;
  text?: string;
  image?: File;
}

/** What the backend (FastAPI) is expected to return. */
export interface DetectionResponse {
  verdict: Verdict;
  confidence: number; // 0..1
  mode: DetectionMode;
  language: Language;
  model: string; // e.g. "BanglaBERT", "ResNet-50", "BanglaBERT + ResNet-50 (late fusion)"
  explanation: string;
  isMock?: boolean; // true when produced by the mock API
}
