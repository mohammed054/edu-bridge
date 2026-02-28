export default function LoadingScreen({ label = 'Checking session...' }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="surface-card animate-fadeUp px-8 py-6">
        <p className="body-premium text-text-secondary">{label}</p>
      </div>
    </main>
  );
}
