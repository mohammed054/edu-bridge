import { useEffect, useMemo, useState } from 'react';
import { fetchNotificationWorkflow, updateNotificationWorkflow } from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const STATUS_OPTIONS = ['open', 'pending', 'resolved', 'escalated'];
const CATEGORY_OPTIONS = ['feedback', 'broadcast', 'schedule', 'incident', 'system', 'ticket', 'risk', 'capacity', 'survey'];
const ROLE_OPTIONS = ['admin', 'teacher', 'student', 'parent'];

const statusStyle = {
  open: 'border-warning/30 bg-warning/10 text-warning',
  pending: 'border-primary/30 bg-primary/10 text-primary',
  resolved: 'border-success/30 bg-success/10 text-success',
  escalated: 'border-danger/30 bg-danger/10 text-danger',
};

export default function NotificationsPage() {
  const { token } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [workflowStatus, setWorkflowStatus] = useState('');
  const [category, setCategory] = useState('');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await fetchNotificationWorkflow(token, {
        workflowStatus,
        category,
        limit: 500,
      });
      setRows(payload.rows || []);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load notification workflow.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, workflowStatus, category]);

  const queueMetrics = useMemo(() => {
    const open = rows.filter((item) => item.workflowStatus === 'open').length;
    const pending = rows.filter((item) => item.workflowStatus === 'pending').length;
    const escalated = rows.filter((item) => item.workflowStatus === 'escalated').length;
    const ackRequired = rows.filter((item) => item.requiresAcknowledgement === true).length;
    return { open, pending, escalated, ackRequired };
  }, [rows]);

  const patchWorkflow = async (notificationId, body, message) => {
    try {
      setSavingId(notificationId);
      setError('');
      setSuccess('');
      await updateNotificationWorkflow(token, notificationId, body);
      setSuccess(message || 'Notification updated.');
      await loadNotifications();
    } catch (saveError) {
      setError(saveError.message || 'Failed to update notification workflow.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="Notification Workflow"
        subtitle="Actionable notification queue with assignment, escalation, and acknowledgment controls."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card">
        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={workflowStatus}
            onChange={(event) => setWorkflowStatus(event.target.value)}
            className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All workflow states</option>
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-text-secondary">
            Open: {queueMetrics.open} | Pending: {queueMetrics.pending}
          </p>
          <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-text-secondary">
            Escalated: {queueMetrics.escalated} | Ack Required: {queueMetrics.ackRequired}
          </p>
        </div>
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
            {!rows.length ? <p className="text-sm text-text-secondary">No notifications in current filter.</p> : null}

            {rows.map((row) => (
              <article key={row.id} className="rounded-sm border border-border bg-background p-3">
                <div className="grid gap-2 lg:grid-cols-[1.2fr_auto_auto_auto_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-text-primary">{row.title || 'Notification'}</h2>
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${
                          statusStyle[row.workflowStatus] || 'border-border bg-background text-text-secondary'
                        }`}
                      >
                        {row.workflowStatus}
                      </span>
                      <span className="rounded-full border border-border px-2 py-1 text-[11px] text-text-secondary">
                        {row.category || 'system'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">
                      recipient role: {row.recipientRole || '-'} | urgency: {row.urgency || '-'} | priority: {Number(row.priorityWeight || 1)}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      assignedTo: {row.assignedToId || '-'} | escalation level: {Number(row.escalationLevel || 0)} | due: {row.dueAt ? new Date(row.dueAt).toLocaleString('en-US') : '-'}
                    </p>
                  </div>

                  <select
                    value={row.workflowStatus || 'open'}
                    onChange={(event) =>
                      patchWorkflow(
                        row.id,
                        { workflowStatus: event.target.value },
                        `Status moved to ${event.target.value}.`
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
                    value={String(row.priorityWeight || 1)}
                    onChange={(event) =>
                      patchWorkflow(
                        row.id,
                        { priorityWeight: Number(event.target.value) },
                        `Priority updated to ${event.target.value}.`
                      )
                    }
                    className="focus-ring rounded-sm border border-border bg-white px-2 py-2 text-xs"
                    disabled={savingId === row.id}
                  >
                    {[1, 2, 3, 4, 5].map((item) => (
                      <option key={`${row.id}-priority-${item}`} value={item}>
                        P{item}
                      </option>
                    ))}
                  </select>

                  <select
                    value={row.assignedToRole || ''}
                    onChange={(event) =>
                      patchWorkflow(
                        row.id,
                        { assignedToRole: event.target.value || null },
                        `Assigned role updated to ${event.target.value || 'none'}.`
                      )
                    }
                    className="focus-ring rounded-sm border border-border bg-white px-2 py-2 text-xs"
                    disabled={savingId === row.id}
                  >
                    <option value="">Unassigned</option>
                    {ROLE_OPTIONS.map((item) => (
                      <option key={`${row.id}-role-${item}`} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="action-btn px-2 py-1 text-[11px]"
                      disabled={savingId === row.id}
                      onClick={() =>
                        patchWorkflow(row.id, { acknowledge: true }, 'Notification acknowledged.')
                      }
                    >
                      Acknowledge
                    </button>
                    <button
                      type="button"
                      className="action-btn px-2 py-1 text-[11px]"
                      disabled={savingId === row.id}
                      onClick={() =>
                        patchWorkflow(row.id, { escalate: true }, 'Notification escalated.')
                      }
                    >
                      Escalate
                    </button>
                    <button
                      type="button"
                      className="action-btn px-2 py-1 text-[11px]"
                      disabled={savingId === row.id}
                      onClick={() =>
                        patchWorkflow(
                          row.id,
                          { requiresAcknowledgement: !(row.requiresAcknowledgement === true) },
                          `Acknowledgement requirement ${row.requiresAcknowledgement ? 'removed' : 'enabled'}.`
                        )
                      }
                    >
                      {row.requiresAcknowledgement ? 'Unset Ack Req' : 'Set Ack Req'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
