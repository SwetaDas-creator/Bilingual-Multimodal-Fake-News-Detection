/** Reusable editorial header used at the top of every inner page. */
export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="page-header border-b border-slate-200">
      <div className="page-header-inner relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="page-header-copy">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">{subtitle}</p>
          )}
        </div>
        <svg
          className="page-header-doodle"
          viewBox="0 0 160 120"
          fill="none"
          aria-hidden="true"
        >
          <path d="m27 22 76-3 3 76-76 3-3-76Z" />
          <path d="m40 39 47-2m-46 13 48-2m-47 13 31-1" />
          <path d="m94 83 35-34 10 10-35 34-13 4 3-14Z" />
          <path d="m125 52 10 10" />
          <path d="m17 35-8 1m10 9-6 5m102-39 6-7" />
        </svg>
      </div>
    </section>
  );
}
