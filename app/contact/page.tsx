import type { Metadata } from "next";
import { Mail } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Contact" };

// TODO: replace the placeholders below with your real team details.
const TEAM = [
  { name: "Student Name 1", role: "Team member", detail: "Roll no. / ID" },
  { name: "Student Name 2", role: "Team member", detail: "Roll no. / ID" },
  { name: "Student Name 3", role: "Team member", detail: "Roll no. / ID" },
];

const SUPERVISOR = {
  name: "Supervisor Name",
  role: "Project guide",
  detail: "Department of Information Technology",
};

function PersonCard({
  name,
  role,
  detail,
}: {
  name: string;
  role: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900">{name}</h3>
      <p className="text-sm font-medium text-teal-700">{role}</p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact"
        subtitle="Project team and supervision."
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Team</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((p) => (
              <PersonCard key={p.name} {...p} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Supervisor</h2>
          <div className="mt-4 max-w-sm">
            <PersonCard {...SUPERVISOR} />
          </div>
        </section>

        <section className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <Mail className="h-5 w-5 text-teal-600" aria-hidden="true" />
          <p className="text-sm text-slate-700">
            Project email:{" "}
            <span className="font-medium text-slate-900">
              your-email@example.com
            </span>
          </p>
        </section>
      </div>
    </>
  );
}
