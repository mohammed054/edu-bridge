import { useState } from 'react';

export default function ImportExportModal({
  open,
  loading,
  importSummary,
  onClose,
  onImport,
  onExport,
}) {
  const [jsonText, setJsonText] = useState('');
  const [localError, setLocalError] = useState('');

  if (!open) {
    return null;
  }

  const handleFileLoad = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      setJsonText(text);
      setLocalError('');
    } catch {
      setLocalError('تعذر قراءة الملف.');
    }
  };

  const handleImportClick = async () => {
    try {
      const parsed = JSON.parse(jsonText || '{}');
      setLocalError('');
      await onImport(parsed);
    } catch {
      setLocalError('صيغة JSON غير صالحة.');
    }
  };

  const handleExportClick = async () => {
    const payload = await onExport();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `edu-bridge-users-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card animated-rise stack" onClick={(event) => event.stopPropagation()}>
        <h3 className="section-title">استيراد/تصدير المستخدمين</h3>
        <p className="hint-text">
          صيغة الاستيراد: {'{"teachers":[{"email","name","password","classes":[]}],"students":[...]}'}.
        </p>
        <p className="hint-text">في وضع الاختبار يمكن استخدام أي بريد إلكتروني صالح طالما أنه غير مكرر.</p>

        <label className="field-label" htmlFor="import-file">
          رفع ملف JSON
        </label>
        <input id="import-file" type="file" accept="application/json" onChange={handleFileLoad} />

        <textarea
          className="input textarea"
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          placeholder='{"teachers": [], "students": []}'
        />

        {localError ? <p className="error-text">{localError}</p> : null}

        {importSummary ? (
          <div className="admin-summary">
            <p>تمت الإضافة: {importSummary.addedCount}</p>
            <p>المكرر المتجاوز: {importSummary.skippedDuplicates}</p>
            <p>عدد الأخطاء: {importSummary.errors?.length || 0}</p>
          </div>
        ) : null}

        <div className="row wrap">
          <button className="btn btn-primary" onClick={handleImportClick} disabled={loading}>
            {loading ? 'جارٍ الاستيراد...' : 'استيراد'}
          </button>
          <button className="btn btn-soft" onClick={handleExportClick} disabled={loading}>
            تصدير JSON
          </button>
          <button className="btn btn-soft" onClick={onClose} disabled={loading}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
