import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import LatestResult from "@/components/detect/LatestResult";

export const metadata: Metadata = { title: "Results" };

const METRICS = ["Accuracy", "Precision", "Recall", "F1-score"];

// Rows are placeholders: replace "—" with real values once experiments finish.
const ROWS = [
  { model: "BanglaBERT", input: "Bengali text" },
  { model: "BERT", input: "English text" },
  { model: "ResNet / ViT", input: "Image" },
  { model: "Multimodal fusion", input: "Text + image" },
];

export default function ResultsPage() {
  return (
    <>
      <PageHeader
        title="Experimental Results"
        subtitle="Evaluation metrics for each model on the held-out test set."
      />
      <LatestResult />
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Final results will be added after the experiments are complete.
          Values shown as “—” are placeholders.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Performance comparison
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Model
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Input
                  </th>
                  {METRICS.map((m) => (
                    <th key={m} scope="col" className="px-4 py-3 font-semibold">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ROWS.map((r) => (
                  <tr key={r.model}>
                    <th
                      scope="row"
                      className="px-4 py-3 font-medium text-slate-900"
                    >
                      {r.model}
                    </th>
                    <td className="px-4 py-3 text-slate-600">{r.input}</td>
                    {METRICS.map((m) => (
                      <td key={m} className="px-4 py-3 text-slate-400">
                        —
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2">
          {["Confusion matrices", "Training curves"].map((t) => (
            <div
              key={t}
              className="flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-center"
            >
              <h3 className="font-medium text-slate-700">{t}</h3>
              <p className="mt-1 text-sm text-slate-500">To be added</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
