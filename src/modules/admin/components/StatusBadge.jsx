const STATUS_STYLES = {
  منتظم:  'bg-green-50 text-green-700 border-green-100',
  متفوق:  'bg-blue-50 text-blue-700 border-blue-100',
  متابعة: 'bg-amber-50 text-amber-700 border-amber-100',
  نشط:    'bg-green-50 text-green-700 border-green-100',
  تطوير:  'bg-amber-50 text-amber-700 border-amber-100',
  تحذير:  'bg-red-50 text-red-600 border-red-100',
};

const DEFAULT_STYLE = 'bg-gray-50 text-gray-500 border-gray-200';

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
        STATUS_STYLES[status] || DEFAULT_STYLE
      }`}
    >
      {status}
    </span>
  );
}
