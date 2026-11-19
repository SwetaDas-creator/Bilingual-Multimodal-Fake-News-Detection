"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Image as ImageIcon,
  Languages,
  Layers,
  Type,
} from "lucide-react";
import ImageUploader from "@/components/detect/ImageUploader";
import ResultCard from "@/components/detect/ResultCard";
import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import { detectNews } from "@/lib/api";
import { saveLatestDetectionResult } from "@/lib/detectionStorage";
import { MAX_TEXT_LENGTH, validateImage, validateText } from "@/lib/validation";
import type {
  DetectionMode,
  DetectionResponse,
  Language,
} from "@/types/detection";

/* ---------- Mode configuration ---------- */
const MODES: {
  id: DetectionMode;
  label: string;
  description: string;
  icon: React.ElementType;
  needsText: boolean;
  needsImage: boolean;
  available: boolean;
}[] = [
  {
    id: "bangla-text",
    label: "Bengali Text",
    description: "BanglaBERT · Model connected and ready",
    icon: Languages,
    needsText: true,
    needsImage: false,
    available: true,
  },
  {
    id: "english-text",
    label: "English Text",
    description: "English BERT · Model connected and ready",
    icon: Type,
    needsText: true,
    needsImage: false,
    available: true,
  },
  {
    id: "image-only",
    label: "Image Only",
    description: "Not implemented yet",
    icon: ImageIcon,
    needsText: false,
    needsImage: true,
    available: false,
  },
  {
    id: "multimodal",
    label: "Text + Image",
    description: "Not implemented yet",
    icon: Layers,
    needsText: true,
    needsImage: true,
    available: false,
  },
];

type Status = "idle" | "loading" | "success" | "error";

export default function DetectPage() {
  /* ---------- State ---------- */
  const [mode, setMode] = useState<DetectionMode>("english-text");
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  // Language only needs choosing in multimodal mode; other modes imply it
  const [multimodalLang, setMultimodalLang] = useState<"Bengali" | "English">(
    "Bengali"
  );

  const [status, setStatus] = useState<Status>("idle");
  const [textError, setTextError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResponse | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const config = MODES.find((m) => m.id === mode)!;
  const loading = status === "loading";

  // Cancel any in-flight request on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  // Scroll to the result when it appears (helps on mobile)
  useEffect(() => {
    if (status === "success")
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [status]);

  /** Resolve the language implied by the current mode. */
  const resolveLanguage = (): Language => {
    if (mode === "bangla-text") return "Bengali";
    if (mode === "english-text") return "English";
    if (mode === "multimodal") return multimodalLang;
    return "Not applicable";
  };

  const clearFeedback = () => {
    setTextError(null);
    setImageError(null);
    setApiError(null);
    setResult(null);
    setStatus("idle");
  };

  const handleModeChange = (next: DetectionMode) => {
    if (loading || next === mode) return;
    abortRef.current?.abort();
    clearFeedback();
    setMode(next);
  };

  /* ---------- Validation ---------- */
  const validate = (): boolean => {
    let ok = true;
    const lang = resolveLanguage();

    if (config.needsText && lang !== "Not applicable") {
      const err = validateText(text, lang);
      setTextError(err);
      if (err) ok = false;
    } else setTextError(null);

    if (config.needsImage) {
      const err = validateImage(image);
      setImageError(err);
      if (err) ok = false;
    } else setImageError(null);

    return ok;
  };

  /* ---------- Submit ---------- */
  const submit = async () => {
    if (loading) return;

    setApiError(null);
    setResult(null);
    if (!validate()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");

    try {
      const response = await detectNews(
        {
          mode,
          language: resolveLanguage(),
          text: config.needsText ? text : undefined,
          image: config.needsImage ? image ?? undefined : undefined,
        },
        controller.signal
      );
      saveLatestDetectionResult(response);
      setResult(response);
      setStatus("success");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setApiError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setStatus("error");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit();
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setText("");
    setImage(null);
    clearFeedback();
  };

  const isBengaliInput =
    mode === "bangla-text" ||
    (mode === "multimodal" && multimodalLang === "Bengali");

  /* ---------- Render ---------- */
  return (
    <>
      <PageHeader
        title="Detection Dashboard"
        subtitle="Choose an input mode, provide the content, and receive an AI-generated credibility assessment."
      />

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {/* Mode selector */}
          <fieldset disabled={loading}>
            <legend className="mb-3 text-sm font-semibold text-slate-800">
              1. Select detection mode
            </legend>
            <div
              role="radiogroup"
              aria-label="Detection mode"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              {MODES.map((m) => {
                const Icon = m.icon;
                const selected = m.id === mode;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    disabled={loading || !m.available}
                    aria-checked={selected}
                    onClick={() => handleModeChange(m.id)}
                    className={`flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors disabled:cursor-not-allowed ${
                      selected
                        ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        selected ? "text-teal-700" : "text-slate-500"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-slate-900">
                      {m.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {m.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Input area */}
          <div className="space-y-5">
            <h2 className="text-sm font-semibold text-slate-800">
              2. Provide input
            </h2>

            {/* Language toggle (multimodal only) */}
            {mode === "multimodal" && (
              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Text language
                </span>
                <div
                  className="inline-flex overflow-hidden rounded-md border border-slate-300"
                  role="radiogroup"
                  aria-label="Text language"
                >
                  {(["Bengali", "English"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      role="radio"
                      aria-checked={multimodalLang === l}
                      disabled={loading}
                      onClick={() => {
                        setMultimodalLang(l);
                        setTextError(null);
                      }}
                      className={`px-4 py-1.5 text-sm ${
                        multimodalLang === l
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text area */}
            {config.needsText && (
              <div>
                <label
                  htmlFor="news-text"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {isBengaliInput ? "Bengali text" : "English text"}
                </label>
                <textarea
                  id="news-text"
                  rows={8}
                  value={text}
                  disabled={loading}
                  maxLength={MAX_TEXT_LENGTH}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (textError) setTextError(null);
                  }}
                  placeholder={
                    isBengaliInput
                      ? "এখানে খবর বা ফেসবুক পোস্টের লেখা পেস্ট করুন…"
                      : "Paste the news article or Facebook post text here…"
                  }
                  aria-invalid={!!textError}
                  aria-describedby={textError ? "text-error" : "text-hint"}
                  style={
                    isBengaliInput
                      ? { fontFamily: "var(--font-bengali), sans-serif" }
                      : undefined
                  }
                  className={`w-full resize-y rounded-lg border bg-white p-3 text-base text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 ${
                    textError ? "border-red-400" : "border-slate-300"
                  }`}
                />
                <div className="mt-1 flex justify-between text-xs">
                  {textError ? (
                    <p
                      id="text-error"
                      role="alert"
                      className="text-sm text-red-600"
                    >
                      {textError}
                    </p>
                  ) : (
                    <p id="text-hint" className="text-slate-500">
                      Minimum 20 characters.
                    </p>
                  )}
                  <span className="text-slate-500">
                    {text.length}/{MAX_TEXT_LENGTH}
                  </span>
                </div>
              </div>
            )}

            {/* Image uploader */}
            {config.needsImage && (
              <ImageUploader
                file={image}
                disabled={loading}
                error={imageError}
                onFileChange={(f) => {
                  setImage(f);
                  // Validate immediately so format errors show on drop/select
                  setImageError(f ? validateImage(f) : null);
                }}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading && <Spinner />}
              {loading ? "Analysing…" : "Analyse"}
            </button>
          </div>
        </form>

        {/* Live region: announces loading / errors to assistive tech */}
        <div aria-live="polite" ref={resultRef} className="scroll-mt-24">
          {loading && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
              <Spinner className="h-6 w-6 text-teal-600" />
              Running the model. This usually takes a few seconds…
            </div>
          )}

          {status === "error" && apiError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 flex-none"
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="font-semibold">Analysis failed</p>
                <p className="text-sm">{apiError}</p>
              </div>
              <button
                type="button"
                onClick={() => void submit()}
                className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          )}

          {status === "success" && result && <ResultCard result={result} />}
        </div>
      </div>
    </>
  );
}
