import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "About" };

const OBJECTIVES = [
  "Build a fake news detection system that supports both Bengali and English.",
  "Evaluate text-only, image-only and combined (multimodal) approaches on Facebook-style posts.",
  "Compare language-specific transformer encoders with vision backbones and fusion strategies.",
  "Deliver a usable web interface that presents predictions with confidence and a short explanation.",
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About the Project"
        subtitle="Background, motivation and objectives."
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Background</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
            Social media platforms such as Facebook spread information quickly,
            including false or misleading content. Fake news often pairs
            persuasive text with images that are altered or taken out of
            context. Bengali is spoken by hundreds of millions of people, yet
            it has far fewer ready-made misinformation tools than English.
            This project explores a bilingual, multimodal approach to help
            address that gap.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Objectives</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            {OBJECTIVES.map((o) => (
              <li key={o} className="max-w-3xl leading-relaxed">
                {o}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Scope &amp; limitations
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
            This is an academic prototype. Predictions are probabilistic
            assessments produced by machine-learning models trained on a
            limited dataset. They are not definitive fact verification and
            should not replace professional fact-checking.
          </p>
        </section>
      </div>
    </>
  );
}
