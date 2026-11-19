"use client";

import { useEffect, useState } from "react";
import ResultCard from "@/components/detect/ResultCard";
import { loadLatestDetectionResult } from "@/lib/detectionStorage";
import type { DetectionResponse } from "@/types/detection";

export default function LatestResult() {
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setResult(loadLatestDetectionResult());
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <section
      aria-labelledby="latest-api-result-heading"
      className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8"
    >
      <h2
        id="latest-api-result-heading"
        className="mb-4 text-2xl font-semibold text-slate-900"
      >
        Latest API prediction
      </h2>
      {result ? (
        <ResultCard result={result} />
      ) : (
        <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
          No successful live API prediction is saved yet. Run an English BERT
          analysis from the Detection page to see its result here.
        </p>
      )}
    </section>
  );
}