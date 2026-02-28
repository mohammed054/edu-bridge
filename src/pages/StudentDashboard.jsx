import { useMemo, useState } from 'react';
import ProfileHeader from '../components/ProfileHeader.jsx';
import FeedbackHistory from '../components/FeedbackHistory.jsx';
import Popup from '../components/Popup.jsx';
import MessageGenerator from '../components/MessageGenerator.jsx';
import { getStudentsByClass, loadFeedbackForViewer, saveFeedback } from '../services/api.js';

const teacherTargets = ['Ms. Fatima', 'Mr. Hamad'];
const viewerTags = ['clear explanation', 'supports students', 'needs slower pace', 'encouraging tone'];

function ViewerFeedbackForm({ session, onSaved }) {
  const [teacherName, setTeacherName] = useState(teacherTargets[0]);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [message, setMessage] = useState('');

  const toggle = (tag) => {
    setTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const save = () => {
    if (!message.trim()) return;
    const record = saveFeedback({
      studentId: 'teacher-feedback',
      teacherName,
      studentName: session.identifier,
      className: 'Grade 11 Adv 3',
      tags,
      notes,
      message,
      sourceRole: session.role,
      author: session.identifier,
    });
    onSaved(record);
    setNotes('');
    setTags([]);
    setMessage('');
  };

  return (
    <div className="stack">
      <h3 style={{ margin: 0 }}>Give Feedback to Teacher (Optional)</h3>
      <select className="select" value={teacherName} onChange={(event) => setTeacherName(event.target.value)}>
        {teacherTargets.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      <div className="tag-grid">
        {viewerTags.map((tag) => (
          <button type="button" key={tag} className={`tag-btn ${tags.includes(tag) ? 'active' : ''}`} onClick={() => toggle(tag)}>
            {tag}
          </button>
        ))}
      </div>
      <textarea className="textarea" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes" />
      <MessageGenerator studentName={teacherName} tags={tags} notes={notes} audience="teacher" onMessage={setMessage} />
      <textarea className="textarea" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="AI message" />
      <button className="btn btn-primary" type="button" onClick={save}>Save</button>
    </div>
  );
}

export default function StudentDashboard({ session, onLogout }) {
  const records = useMemo(() => loadFeedbackForViewer('student'), []);
  const students = getStudentsByClass('Grade 11 Adv 3');
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState(records.filter((item) => students.some((s) => s.name === item.studentName)));

  return (
    <main className="app-shell stack">
      <ProfileHeader session={session} onLogout={onLogout} greeting="Hi, Student!" />
      <FeedbackHistory records={history} title="Teacher Feedback" />
      <button className="btn btn-soft" type="button" onClick={() => setOpen(true)}>
        Optional: Give Feedback to Teacher
      </button>

      <Popup open={open}>
        <ViewerFeedbackForm
          session={session}
          onSaved={(record) => {
            setHistory((prev) => [record, ...prev]);
            setOpen(false);
          }}
        />
        <button className="btn btn-soft" type="button" onClick={() => setOpen(false)}>Close</button>
      </Popup>
    </main>
  );
}
