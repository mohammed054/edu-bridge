const statusStyles = {
  منتظم: 'bg-success/10 text-success border-success/25',
  متفوق: 'bg-primary/10 text-primary border-primary/25',
  متابعة: 'bg-warning/10 text-warning border-warning/25',
  نشط: 'bg-success/10 text-success border-success/25',
  تطوير: 'bg-warning/10 text-warning border-warning/25',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || 'bg-background text-text-secondary border-border'
      }`}
    >
      {status}
    </span>
  );
}