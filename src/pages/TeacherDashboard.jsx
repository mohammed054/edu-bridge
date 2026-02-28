import { useMemo, useState } from 'react';
import ProfileHeader from '../components/ProfileHeader.jsx';
import ClassSelector from '../components/ClassSelector.jsx';
import StudentList from '../components/StudentList.jsx';
import FeedbackMenu from '../components/FeedbackMenu.jsx';
import FeedbackHistory from '../components/FeedbackHistory.jsx';
import Popup from '../components/Popup.jsx';
import { getClasses, getStudentsByClass, loadFeedbackByStudent, saveFeedback } from '../services/api.js';

export default function TeacherDashboard({ session, onLogout }) {
  const classes = getClasses();
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFeedback, setStudentFeedback] = useState([]);

  const students = useMemo(() => getStudentsByClass(selectedClass), [selectedClass]);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setStudentFeedback(loadFeedbackByStudent(student.id));
  };

  const handleSave = ({ student, tags, notes, message, sourceRole }) => {
    const record = saveFeedback({
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      tags,
      notes,
      message,
      sourceRole,
      author: session.identifier,
    });
    setStudentFeedback((prev) => [record, ...prev]);
  };

  return (
    <main className="app-shell">
      <ProfileHeader session={session} onLogout={onLogout} greeting="Hi, Teacher!" />
      <div className="teacher-layout">
        <div className="stack">
          <ClassSelector classOptions={classes} value={selectedClass} onChange={setSelectedClass} />
          <StudentList students={students} selectedId={selectedStudent?.id} onSelect={handleStudentSelect} />
        </div>
        <FeedbackHistory
          records={selectedStudent ? studentFeedback : []}
          title={selectedStudent ? `${selectedStudent.name} - Feedback History` : 'Feedback History'}
        />
      </div>

      <Popup open={!!selectedStudent}>
        {selectedStudent && (
          <FeedbackMenu
            student={selectedStudent}
            onSave={handleSave}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </Popup>
    </main>
  );
}
