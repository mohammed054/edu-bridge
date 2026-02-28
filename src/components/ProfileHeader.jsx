export default function ProfileHeader({ session, onLogout, greeting = 'Hi, Teacher!' }) {
  return (
    <header className="card stack" style={{ marginBottom: '0.75rem' }}>
      <div className="row-between">
        <div className="row">
          <img
            src={session.avatarUrl}
            alt="Profile"
            style={{ width: 46, height: 46, borderRadius: '999px', border: '1px solid var(--line)' }}
          />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{greeting}</h2>
            <p className="muted" style={{ margin: 0 }}>{session.identifier}</p>
          </div>
        </div>
        <button className="btn btn-danger" onClick={onLogout} type="button">
          Logout
        </button>
      </div>
    </header>
  );
}
