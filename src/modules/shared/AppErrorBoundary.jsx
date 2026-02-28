import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected application error.' };
  }

  componentDidCatch() {
    // No-op: UI fallback is sufficient for this app shell.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background p-6">
          <div className="mx-auto max-w-xl rounded-md border border-danger/30 bg-white p-6">
            <h1 className="text-lg font-bold text-danger">Application Error</h1>
            <p className="mt-2 text-sm text-text-secondary">{this.state.message}</p>
            <button
              type="button"
              className="action-btn-primary mt-4"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
