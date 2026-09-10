export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card p-5 sm:p-6 ${className ?? ""}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-neutral-dark">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-neutral-gray">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
