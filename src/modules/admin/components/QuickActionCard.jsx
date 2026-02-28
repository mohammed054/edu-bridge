export default function QuickActionCard({ label, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl bg-white p-4 text-right premium-transition hover:bg-gray-50 pressable"
      style={{ border: '1px solid #E5E7EB' }}
    >
      <p className="text-[13px] font-semibold text-gray-800">{label}</p>
      <p className="mt-0.5 text-[12px] text-gray-400">{description || 'تنفيذ سريع'}</p>
    </button>
  );
}
