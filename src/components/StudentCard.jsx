import '../styles/StudentList.css';

export default function StudentCard({ student, feedbackCount, onOpen }) {
  return (
    <button type="button" className="student-card" onClick={() => onOpen(student)}>
      <div>
        <h3>{student.name}</h3>
        <p>{student.grade}</p>
      </div>
      <span className="feedback-count">{feedbackCount} ملاحظة</span>
    </button>
  );
}
