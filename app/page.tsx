import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Languages,
  Layers,
} from "lucide-react";

const FEATURES = [
  {
    icon: Languages,
    title: "Bilingual text analysis",
    body: "Separate language-specific transformer models for Bengali and English posts and headlines.",
  },
  {
    icon: ImageIcon,
    title: "Image analysis",
    body: "A computer-vision model examines the visual content that accompanies a news post.",
  },
  {
    icon: Layers,
    title: "Multimodal fusion",
    body: "Text and image features are combined so the model can reason over both signals together.",
  },
  {
    icon: FileText,
    title: "Transparent output",
    body: "Every result shows the predicted class, a confidence score, the model used and a short explanation.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="home-hero">
        <svg
          className="hero-doodle"
          viewBox="0 0 240 210"
          fill="none"
          aria-hidden="true"
        >
          <path d="m42 27 111-4 5 113-111 5-5-114Z" />
          <path d="m58 47 55-2m-54 14 78-3m-77 14 48-2" />
          <path d="m58 88 35-1 2 32-35 1-2-32Zm45 2 34-1m-33 10 32-1m-32 10 27-1" />
          <circle cx="151" cy="126" r="30" />
          <path d="m172 148 29 31m-136-40-13 18m18-153 12-13" />
          <path d="m188 54 9-8m-2 18 13-2" />
        </svg>
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <h1 className="editorial-underline mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Bilingual Multimodal Fake News Detection for Facebook
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            An AI research prototype that assesses the credibility of Facebook
            posts written in Bengali or English, using text, images, or both.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/detect"
              className="sketch-button inline-flex items-center justify-center gap-2 rounded-md bg-teal-500 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Open detection dashboard
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/how-it-works"
              className="sketch-button inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="editorial-underline text-3xl font-semibold text-slate-900">Overview</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
          Misinformation on social media increasingly combines misleading text
          with out-of-context or manipulated images, and much of it is posted
          in regional languages that general-purpose tools handle poorly. This
          project studies how language-specific text encoders and image
          encoders, used alone and in combination, can help flag posts that
          are likely to be fake.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="paper-card rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Icon className="h-6 w-6 text-teal-600" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer / CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className="max-w-xl text-sm text-slate-600">
            Results are AI-generated assessments, not definitive fact
            verification. Always check important claims against trusted
            sources.
          </p>
          <Link
            href="/detect"
            className="sketch-button inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Try the detector
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
