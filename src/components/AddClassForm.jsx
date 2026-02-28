import { useState } from 'react';

export default function AddClassForm({ onSubmit, loading }) {
  const [className, setClassName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name: className.trim() });
    setClassName('');
  };

  return (
    <section className="card stack">
      <h3 className="section-title">إضافة صف</h3>
      <form className="stack" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="new-class-name">
          اسم الصف
        </label>
        <input
          id="new-class-name"
          className="input"
          value={className}
          onChange={(event) => setClassName(event.target.value)}
          placeholder="مثال: الصف 11 (1)"
          required
        />

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'جارٍ الإضافة...' : 'إضافة'}
        </button>
      </form>
    </section>
  );
}
