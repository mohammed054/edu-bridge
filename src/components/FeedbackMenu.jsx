import { useState } from 'react';
import MessageGenerator from './MessageGenerator.jsx';

const feedbackTags = [
  'participates well',
  'talks a lot',
  'academic level increased',
  'sleeps in class',
  'needs homework follow-up',
  'shows leadership',
];

export default function FeedbackMenu({ student, onSave, onClose }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [notes, setNotes] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');

  const toggleTag = (tag) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  const handleSave = () => {
    if (!generatedMessage.trim()) return;
    onSave({
      student,
      tags: selectedTags,
      notes,
      message: generatedMessage,
      sourceRole: 'teacher',
    });
    onClose();
  };

  return (
    <div className="stack">
      <div className="row-between">
        <h3 style={{ margin: 0 }}>Feedback Menu</h3>
        <button type="button" className="btn btn-soft" onClick={onClose}>Close</button>
      </div>
      <p className="muted" style={{ margin: 0 }}>Student: {student.name}</p>

      <div className="tag-grid">
        {feedbackTags.map((tag) => (
          <button
            key={tag}
            className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
            onClick={() => toggleTag(tag)}
            type="button"
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="stack">
        <label htmlFor="teacherNotes">Optional notes</label>
        <textarea
          id="teacherNotes"
          className="textarea"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add optional context"
        />
      </div>

      <MessageGenerator
        studentName={student.name}
        tags={selectedTags}
        notes={notes}
        onMessage={setGeneratedMessage}
      />

      <textarea
        className="textarea"
        value={generatedMessage}
        onChange={(event) => setGeneratedMessage(event.target.value)}
        placeholder="Generated message appears here"
      />

      <button className="btn btn-primary" type="button" onClick={handleSave}>
        Save Feedback
      </button>
    </div>
  );
}
