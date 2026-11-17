import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "How It Works" };

const NLP_STEPS = [
  {
    title: "Input & language selection",
    body: "The user submits a Bengali or English post. The text is validated for length and script before it is sent to the backend.",
  },
  {
    title: "Preprocessing",
    body: "Whitespace and noise (URLs, repeated symbols) are cleaned. Text is normalised in a language-appropriate way.",
  },
  {
    title: "Tokenisation",
    body: "A model-specific tokenizer converts text into sub-word tokens: the BanglaBERT tokenizer for Bengali, the BERT tokenizer for English.",
  },
  {
    title: "Contextual encoding",
    body: "The transformer encoder produces a contextual representation of the post.",
  },
  {
    title: "Classification",
    body: "A classification head maps the representation to class probabilities (fake vs. real).",
  },
];

const CV_STEPS = [
  {
    title: "Image upload & validation",
    body: "The image is checked for format (JPG, PNG, WebP) and size before upload.",
  },
  {
    title: "Preprocessing",
    body: "The image is resized and normalised to the input size expected by the vision backbone.",
  },
  {
    title: "Feature extraction",
    body: "A convolutional (ResNet) or transformer-based (ViT) backbone extracts visual features.",
  },
  {
    title: "Classification",
    body: "A classification head predicts class probabilities from the visual features.",
  },
];

const FUSION_STEPS = [
  {
    title: "Encode both modalities",
    body: "The text encoder and the image encoder each produce a feature vector for the same post.",
  },
  {
    title: "Fuse features",
    body: "The vectors are combined (for example by concatenation) so the model can use both signals jointly.",
  },
  {
    title: "Joint prediction",
    body: "A fusion classifier outputs the final class probabilities.",
  },
  {
    title: "Result presentation",
    body: "The predicted class, confidence, model used and a short explanation are returned to the interface.",
  },
];

function Pipeline({
  heading,
  intro,
  steps,
}: {
  heading: string;
  intro: string;
  steps: { title: string; body: string }[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-semibold text-slate-900">{heading}</h2>
      <p className="mt-1 text-sm text-slate-600">{intro}</p>
      <ol className="mt-6 space-y-5">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-teal-300">
              {i + 1}
            </span>
            <div>
              <h3 className="font-medium text-slate-900">{s.title}</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        title="How It Works"
        subtitle="The step-by-step workflow of the text (NLP), image (computer vision) and multimodal pipelines."
      />
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <Pipeline
          heading="Text pipeline (NLP)"
          intro="Used in Bengali Text and English Text modes."
          steps={NLP_STEPS}
        />
        <Pipeline
          heading="Image pipeline (Computer Vision)"
          intro="Used in Image Only mode."
          steps={CV_STEPS}
        />
        <Pipeline
          heading="Multimodal pipeline"
          intro="Used in Text + Image mode."
          steps={FUSION_STEPS}
        />
      </div>
    </>
  );
}
