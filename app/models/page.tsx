import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Models" };

const MODELS = [
  {
    name: "BanglaBERT",
    role: "Bengali text encoder",
    body: "A transformer language model pre-trained on a large Bengali corpus. It is fine-tuned here to classify Bengali posts as fake or real.",
  },
  {
    name: "BERT",
    role: "English text encoder",
    body: "A bidirectional transformer encoder pre-trained on English text. It is fine-tuned here for English fake news classification.",
  },
  {
    name: "ResNet / ViT",
    role: "Image encoder",
    body: "ResNet is a convolutional network with residual connections; ViT (Vision Transformer) splits an image into patches and processes them with a transformer. One or both are evaluated for the image pipeline.",
  },
  {
    name: "Multimodal fusion",
    role: "Joint text + image classifier",
    body: "Text and image feature vectors are combined (for example by concatenation) and passed to a classifier so predictions use both modalities.",
  },
];

// Dataset details are placeholders until the final dataset is fixed.
const DATASET_FIELDS = [
  { label: "Dataset name", value: "To be added" },
  { label: "Languages", value: "Bengali, English" },
  { label: "Source", value: "To be added" },
  { label: "Total samples", value: "To be added" },
  { label: "Class labels", value: "Fake / Real" },
  { label: "Train / validation / test split", value: "To be added" },
];

export default function ModelsPage() {
  return (
    <>
      <PageHeader
        title="Models & Dataset"
        subtitle="The data and the machine-learning models behind each detection mode."
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Dataset</h2>
          <dl className="mt-4 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
            {DATASET_FIELDS.map((f) => (
              <div key={f.label} className="bg-white p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {f.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Models</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {MODELS.map((m) => (
              <article
                key={m.name}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {m.name}
                </h3>
                <p className="text-sm font-medium text-teal-700">{m.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {m.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
