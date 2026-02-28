import ProfileHeader from '../components/ProfileHeader.jsx';
import FeedbackHistory from '../components/FeedbackHistory.jsx';
import { getFeedbackStats, loadFeedbackForViewer } from '../services/api.js';

export default function AdminDashboard({ session, onLogout }) {
  const stats = getFeedbackStats();
  const records = loadFeedbackForViewer('admin').slice(0, 12);

  return (
    <main className="app-shell stack">
      <ProfileHeader session={session} onLogout={onLogout} greeting={session.role === 'staff' ? 'Hi, Staff!' : 'Hi, Admin!'} />
      <section className="card stack">
        <h3 style={{ margin: 0 }}>Platform Snapshot</h3>
        <p style={{ margin: 0 }}>Total feedback records: <b>{stats.total}</b></p>
        <p style={{ margin: 0 }}>Students with feedback: <b>{stats.studentsWithFeedback}</b></p>
      </section>
      <FeedbackHistory records={records} title="Recent Feedback" />
    </main>
  );
}
