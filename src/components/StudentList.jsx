export default function StudentList({ students, selectedId, onSelect }) {
  return (
    <section className="card stack">
      <h3 style={{ margin: 0 }}>Students</h3>
      <div className="student-list">
        {students.map((student) => (
          <button
            key={student.id}
            className={`student-item ${selectedId === student.id ? 'active' : ''}`}
            type="button"
            onClick={() => onSelect(student)}
          >
            <div className="row-between">
              <strong>{student.name}</strong>
              <span className="muted">Open feedback</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
