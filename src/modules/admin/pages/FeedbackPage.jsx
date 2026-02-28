import { useEffect, useMemo, useState } from 'react';
import {
  exportTicketWorkflow,
  fetchFeedbackList,
  fetchTicketWorkflow,
  updateTicketWorkflow,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const STATUS_OPTIONS = ['open', 'pending', 'resolved'];
const PRIORITY_OPTIONS = ['p1', 'p2', 'p3'];

const ticketStyle = {
  p1: 'border-danger/35 bg-danger/10 text-danger',
  p2: 'border-warning/35 bg-warning/10 text-warning',
  p3: 'border-primary/35 bg-primary/10 text-primary',
};

const downloadCsv = (csvText, filename) => {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

export default function FeedbackPage() {
  const { token } = useAuth();

  const [rows, setRows] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [ticketStatus, setTicketStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const [ticketPayload, feedbackPayload] = await Promise.all([
        fetchTicketWorkflow(token, { ticketStatus, priority }),
        fetchFeedbackList(token, { limit: 400 }),
      ]);
      setRows(ticketPayload.rows || []);
      setThreads(feedbackPayload.feedbacks || []);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load ticket workflow.');
      setRows([]);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, ticketStatus, priority]);

  const metrics = useMemo(() => {
    const backlog = rows.filter((item) => item.ticketStatus !== 'resolved').length;
    const escalated = rows.filter((item) => item.workflowStatus === 'escalated').length;
    const slaBreached = rows.filter((item) => item.slaBreached).length;
    return { backlog, escalated, slaBreached };
  }, [rows]);

  const selectedTicket = useMemo(
    () => rows.find((item) => item.id === selectedTicketId) || null,
    [rows, selectedTicketId]
  );

  const selectedThread = useMemo(() => {
    if (!selectedTicket) return null;
    return threads.find((item) => String(item._id || item.id) === String(selectedTicket.id)) || null;
  }, [threads, selectedTicket]);

  const patchTicket = async (ticketId, body, message) => {
    try {
      setSavingId(ticketId);
      setError('');
      setSuccess('');
      await updateTicketWorkflow(token, ticketId, body);
      setSuccess(message || 'Ticket updated.');
      await loadTickets();
    } catch (saveError) {
      setError(saveError.message || 'Failed to update ticket.');
    } finally {
      setSavingId('');
    }
  };

  const handleExport = async () => {
    try {
      setError('');
      const csv = await exportTicketWorkflow(token);
      downloadCsv(csv, `ticket-workflow-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (saveError) {
      setError(saveError.message || 'Failed to export ticket workflow.');
    }
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="Feedback Ticket Management"
        subtitle="Ticket lifecycle states, SLA tracking, escalation controls, and analytics-oriented triage."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card">
        <div className="grid gap-3 md:grid-cols-5">
          <select
            value={ticketStatus}
            onChange={(event) => setTicketStatus(event.target.value)}
            className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-text-secondary">
            Backlog: {metrics.backlog}
          </p>
          <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-text-secondary">
            Escalated: {metrics.escalated}
          </p>
          <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-text-secondary">
            SLA Breached: {metrics.slaBreached}
          </p>
        </div>
        <button type="button" className="action-btn mt-3" onClick={handleExport}>
          Export Ticket Workflow CSV
        </button>
      </section>

      <section className="panel-card">
        {loading ? (
          <div className="grid gap-2">
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
          </div>
        ) : (
          <div className="space-y-3">
            {!rows.length ? <p className="text-sm text-text-secondary">No tickets found for current filters.</p> : null}
            {rows.map((row) => (
              <article
                key={row.id}
                className={`rounded-sm border p-3 ${
                  row.slaBreached ? 'border-danger/40 bg-danger/5' : 'border-border bg-background'
                }`}
              >
                <div className="grid gap-2 lg:grid-cols-[1.2fr_auto_auto_auto_auto_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-text-primary">{row.ticketId || 'Ticket'}</h2>
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${
                          ticketStyle[row.priority] || 'border-border bg-background text-text-secondary'
                        }`}
                      >
                        {row.priority || 'p3'}
                      </span>
                      {row.slaBreached ? (
                        <span className="rounded-full border border-danger/30 bg-danger/10 px-2 py-1 text-[11px] font-semibold text-danger">
                          SLA breached
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">
                      {row.studentName || '-'} | {row.className || '-'} | {row.subject || '-'}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      status: {row.ticketStatus} | workflow: {row.workflowStatus || '-'} | due: {row.slaDueAt ? new Date(row.slaDueAt).toLocaleString('en-US') : '-'}
                    </p>
                  </div>

                  <select
                    value={row.ticketStatus || 'open'}
                    onChange={(event) =>
                      patchTicket(
                        row.id,
                        { ticketStatus: event.target.value },
                        `Ticket status moved to ${event.target.value}.`
                      )
                    }
                    className="focus-ring rounded-sm border border-border bg-white px-2 py-2 text-xs"
                    disabled={savingId === row.id}
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={`${row.id}-status-${item}`} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <select
                    value={row.priority || 'p3'}
                    onChange={(event) =>
                      patchTicket(
                        row.id,
                        { priority: event.target.value },
                        `Ticket priority set to ${event.target.value}.`
                      )
                    }
                    className="focus-ring rounded-sm border border-border bg-white px-2 py-2 text-xs"
                    disabled={savingId === row.id}
                  >
                    {PRIORITY_OPTIONS.map((item) => (
                      <option key={`${row.id}-priority-${item}`} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="action-btn px-2 py-1 text-[11px]"
                    disabled={savingId === row.id}
                    onClick={() =>
                      patchTicket(row.id, { firstResponse: true }, 'First response timestamp recorded.')
                    }
                  >
                    First Response
                  </button>

                  <button
                    type="button"
                    className="action-btn px-2 py-1 text-[11px]"
                    disabled={savingId === row.id}
                    onClick={() => patchTicket(row.id, { escalate: true }, 'Ticket escalated.')}
                  >
                    Escalate
                  </button>

                  <button
                    type="button"
                    className="action-btn px-2 py-1 text-[11px]"
                    onClick={() => setSelectedTicketId(row.id)}
                  >
                    Thread
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedTicket ? (
        <section className="panel-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Ticket Thread</h2>
            <button type="button" className="action-btn" onClick={() => setSelectedTicketId('')}>
              Close
            </button>
          </div>
          <article className="rounded-sm border border-border bg-background p-3 text-sm">
            <p className="font-semibold text-text-primary">{selectedTicket.ticketId}</p>
            <p className="mt-1 text-xs text-text-secondary">
              Student: {selectedTicket.studentName || '-'} | Class: {selectedTicket.className || '-'} | Subject: {selectedTicket.subject || '-'}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Status: {selectedTicket.ticketStatus} | Priority: {selectedTicket.priority}
            </p>
          </article>

          <div className="space-y-2">
            {(selectedThread?.replies || []).map((reply, index) => (
              <article key={`${reply.createdAt}-${index}`} className="rounded-sm border border-border bg-background p-3 text-xs">
                <p className="font-semibold text-text-primary">{reply.senderType || 'sender'}</p>
                <p className="mt-1 text-text-secondary">{reply.text || '-'}</p>
                <p className="mt-1 text-text-secondary">{reply.createdAt ? new Date(reply.createdAt).toLocaleString('en-US') : '-'}</p>
              </article>
            ))}
            {!selectedThread?.replies?.length ? (
              <p className="text-sm text-text-secondary">
                No threaded replies available for this ticket yet.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
