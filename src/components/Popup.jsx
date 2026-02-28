export default function Popup({ open, children }) {
  if (!open) return null;

  return (
    <div className="popup-overlay">
      <section className="card popup-card">{children}</section>
    </div>
  );
}
