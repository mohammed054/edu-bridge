import { useEffect, useMemo, useState } from 'react';
import {
  fetchObservabilitySnapshot,
  fetchPermissionMatrix,
  fetchSystemContext,
  updatePermissionMatrix,
  updateSystemContext,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const toPrettyJson = (value) => {
  try {
    return JSON.stringify(value ?? [], null, 2);
  } catch {
    return '[]';
  }
};

const parseJsonOrFallback = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch {
    return fallback;
  }
};

export default function SettingsPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [contextForm, setContextForm] = useState({
    institutionId: '',
    institutionName: '',
    currentAcademicYear: '',
    defaultTimezone: '',
    defaultLocale: '',
    campusesJson: '[]',
    academicYearsJson: '[]',
  });

  const [matrixForm, setMatrixForm] = useState({
    matrix: {},
    actorProfile: '',
    effectivePermissions: [],
  });

  const [observability, setObservability] = useState(null);

  const matrixKeys = useMemo(() => Object.keys(matrixForm.matrix || {}).sort(), [matrixForm.matrix]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const [contextPayload, matrixPayload, observabilityPayload] = await Promise.all([
        fetchSystemContext(token),
        fetchPermissionMatrix(token),
        fetchObservabilitySnapshot(token),
      ]);

      setContextForm({
        institutionId: contextPayload.institutionId || '',
        institutionName: contextPayload.institutionName || '',
        currentAcademicYear: contextPayload.currentAcademicYear || '',
        defaultTimezone: contextPayload.defaultTimezone || '',
        defaultLocale: contextPayload.defaultLocale || '',
        campusesJson: toPrettyJson(contextPayload.campuses || []),
        academicYearsJson: toPrettyJson(contextPayload.academicYears || []),
      });

      setMatrixForm({
        matrix: matrixPayload.matrix || {},
        actorProfile: matrixPayload.actorProfile || '',
        effectivePermissions: matrixPayload.effectivePermissions || [],
      });

      setObservability(observabilityPayload || null);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load enterprise settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSaveContext = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await updateSystemContext(token, {
        institutionName: contextForm.institutionName,
        currentAcademicYear: contextForm.currentAcademicYear,
        defaultTimezone: contextForm.defaultTimezone,
        defaultLocale: contextForm.defaultLocale,
        campuses: parseJsonOrFallback(contextForm.campusesJson, []),
        academicYears: parseJsonOrFallback(contextForm.academicYearsJson, []),
      });

      setSuccess('System context updated.');
      await loadSettings();
    } catch (saveError) {
      setError(saveError.message || 'Failed to update system context. Validate JSON fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMatrix = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await updatePermissionMatrix(token, {
        matrix: matrixForm.matrix,
      });
      setSuccess('Permission matrix updated.');
      await loadSettings();
    } catch (saveError) {
      setError(saveError.message || 'Failed to update permission matrix. Super Admin access may be required.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="Enterprise System Settings"
        subtitle="Institution context, permission matrix, multi-campus readiness, localization, timezone, and observability."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card space-y-4">
        <h2 className="text-base font-semibold text-text-primary">System Context</h2>
        {loading ? (
          <div className="grid gap-2">
            <div className="skeleton h-10" />
            <div className="skeleton h-10" />
            <div className="skeleton h-10" />
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <input value={contextForm.institutionId} readOnly className="rounded-sm border border-border bg-background px-3 py-2 text-sm" />
              <input value={contextForm.institutionName} onChange={(event) => setContextForm((current) => ({ ...current, institutionName: event.target.value }))} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Institution name" />
              <input value={contextForm.currentAcademicYear} onChange={(event) => setContextForm((current) => ({ ...current, currentAcademicYear: event.target.value }))} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Current academic year" />
              <input value={contextForm.defaultTimezone} onChange={(event) => setContextForm((current) => ({ ...current, defaultTimezone: event.target.value }))} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Default timezone" />
              <input value={contextForm.defaultLocale} onChange={(event) => setContextForm((current) => ({ ...current, defaultLocale: event.target.value }))} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Default locale" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-text-secondary">Campuses JSON</span>
                <textarea value={contextForm.campusesJson} onChange={(event) => setContextForm((current) => ({ ...current, campusesJson: event.target.value }))} className="focus-ring min-h-[160px] w-full rounded-sm border border-border px-3 py-2 text-xs" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-text-secondary">Academic Years JSON</span>
                <textarea value={contextForm.academicYearsJson} onChange={(event) => setContextForm((current) => ({ ...current, academicYearsJson: event.target.value }))} className="focus-ring min-h-[160px] w-full rounded-sm border border-border px-3 py-2 text-xs" />
              </label>
            </div>

            <button type="button" className="action-btn-primary" onClick={handleSaveContext} disabled={saving}>
              Save System Context
            </button>
          </>
        )}
      </section>

      <section className="panel-card space-y-4">
        <h2 className="text-base font-semibold text-text-primary">Permission Matrix (RBAC)</h2>
        {loading ? (
          <div className="grid gap-2">
            <div className="skeleton h-10" />
            <div className="skeleton h-10" />
          </div>
        ) : (
          <>
            <p className="text-xs text-text-secondary">
              Your admin profile: {matrixForm.actorProfile || 'none'} | Effective permissions: {matrixForm.effectivePermissions.length}
            </p>

            <div className="space-y-2">
              {matrixKeys.map((key) => (
                <article key={key} className="rounded-sm border border-border bg-background p-3">
                  <p className="text-sm font-semibold text-text-primary">{key}</p>
                  <textarea
                    value={(matrixForm.matrix[key] || []).join('\n')}
                    onChange={(event) =>
                      setMatrixForm((current) => ({
                        ...current,
                        matrix: {
                          ...current.matrix,
                          [key]: event.target.value
                            .split('\n')
                            .map((item) => item.trim())
                            .filter(Boolean),
                        },
                      }))
                    }
                    className="focus-ring mt-2 min-h-[120px] w-full rounded-sm border border-border px-3 py-2 text-xs"
                  />
                </article>
              ))}
            </div>

            <button type="button" className="action-btn-primary" onClick={handleSaveMatrix} disabled={saving}>
              Save Permission Matrix
            </button>
          </>
        )}
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-base font-semibold text-text-primary">Observability Snapshot</h2>
        {loading ? (
          <div className="grid gap-2">
            <div className="skeleton h-10" />
            <div className="skeleton h-10" />
          </div>
        ) : observability ? (
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-sm border border-border bg-background p-3 text-sm">
              <p className="font-semibold text-text-primary">Entities</p>
              <p className="mt-1 text-xs text-text-secondary">Students: {Number(observability.entities?.students || 0)}</p>
              <p className="text-xs text-text-secondary">Teachers: {Number(observability.entities?.teachers || 0)}</p>
              <p className="text-xs text-text-secondary">Classes: {Number(observability.entities?.classes || 0)}</p>
              <p className="text-xs text-text-secondary">Schedule entries: {Number(observability.entities?.scheduleEntries || 0)}</p>
            </article>
            <article className="rounded-sm border border-border bg-background p-3 text-sm">
              <p className="font-semibold text-text-primary">Health</p>
              <p className="mt-1 text-xs text-text-secondary">Workload: {observability.health?.workload || '-'}</p>
              <p className="text-xs text-text-secondary">{observability.health?.recommendation || '-'}</p>
            </article>
            <article className="rounded-sm border border-border bg-background p-3 text-sm">
              <p className="font-semibold text-text-primary">Generated At</p>
              <p className="mt-1 text-xs text-text-secondary">{observability.generatedAt ? new Date(observability.generatedAt).toLocaleString('en-US') : '-'}</p>
            </article>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">No observability data available.</p>
        )}
      </section>
    </div>
  );
}
