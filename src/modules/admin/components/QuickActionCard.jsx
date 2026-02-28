export default function QuickActionCard({ label, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="panel-card-hover pressable w-full text-right"
    >
      <p className="body-premium font-semibold">{label}</p>
      <p className="caption-premium mt-1">{description || 'تنفيذ سريع'}</p>
    </button>
  );
}
