import type {
  DetectionMode,
  DetectionResponse,
  Language,
  Verdict,
} from "@/types/detection";

const STORAGE_KEY = "bilingual-fake-news.latest-api-result";
const MODES: DetectionMode[] = [
  "bangla-text",
  "english-text",
  "image-only",
  "multimodal",
  "english-multimodal",
  "bangla-multimodal",
];
const LANGUAGES: Language[] = ["Bengali", "English", "Not applicable"];
const VERDICTS: Verdict[] = ["likely_fake", "likely_real", "uncertain"];

function isDetectionResponse(value: unknown): value is DetectionResponse {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.verdict === "string" &&
    VERDICTS.includes(item.verdict as Verdict) &&
    typeof item.confidence === "number" &&
    Number.isFinite(item.confidence) &&
    item.confidence >= 0 &&
    item.confidence <= 1 &&
    typeof item.mode === "string" &&
    MODES.includes(item.mode as DetectionMode) &&
    typeof item.language === "string" &&
    LANGUAGES.includes(item.language as Language) &&
    typeof item.model === "string" &&
    typeof item.explanation === "string" &&
    item.isMock !== true
  );
}

export function saveLatestDetectionResult(result: DetectionResponse): void {
  if (typeof window === "undefined" || result.isMock === true) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Keep the live result usable if browser storage is unavailable.
  }
}

export function loadLatestDetectionResult(): DetectionResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return isDetectionResponse(value) ? value : null;
  } catch {
    return null;
  }
}

