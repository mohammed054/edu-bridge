export default function ConfirmDeleteModal({ open, title, message, loading, onCancel, onConfirm }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal card animated-rise" onClick={(event) => event.stopPropagation()}>
        <h3 className="section-title">{title}</h3>
        <p className="message-text">{message}</p>
        <div className="row">
          <button className="btn btn-soft" onClick={onCancel} disabled={loading}>
            إلغاء
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
          </button>
        </div>
      </div>
    </div>
  );
}
