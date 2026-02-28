export default function PageHeading({ title, subtitle, action }) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1">
        <h1 className="h2-premium">{title}</h1>
        {subtitle ? <p className="caption-premium">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}   