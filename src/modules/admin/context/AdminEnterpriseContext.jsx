import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchEnterpriseHierarchy } from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';

const AdminEnterpriseContext = createContext(null);

export function AdminEnterpriseProvider({ children }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hierarchy, setHierarchy] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await fetchEnterpriseHierarchy(token);
      setHierarchy(payload);

      const yearKeys = Object.keys(payload?.hierarchy || {});
      const initialYear = payload?.currentAcademicYear && yearKeys.includes(payload.currentAcademicYear)
        ? payload.currentAcademicYear
        : yearKeys[0] || '';
      const gradeKeys = Object.keys((payload?.hierarchy || {})[initialYear] || {});
      const initialGrade = gradeKeys[0] || '';
      const classRows = ((payload?.hierarchy || {})[initialYear] || {})[initialGrade] || [];
      const initialClass = classRows[0] || null;

      setSelectedYear(initialYear);
      setSelectedGrade(initialGrade);
      setSelectedClassId(initialClass?.id || '');
    } catch (loadError) {
      setError(loadError.message || 'Failed to load hierarchy context.');
      setHierarchy(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHierarchy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const availableYears = useMemo(() => Object.keys(hierarchy?.hierarchy || {}), [hierarchy]);
  const availableGrades = useMemo(
    () => Object.keys((hierarchy?.hierarchy || {})[selectedYear] || {}),
    [hierarchy, selectedYear]
  );
  const availableClasses = useMemo(
    () => ((hierarchy?.hierarchy || {})[selectedYear] || {})[selectedGrade] || [],
    [hierarchy, selectedYear, selectedGrade]
  );
  const selectedClass = useMemo(
    () => availableClasses.find((item) => item.id === selectedClassId) || availableClasses[0] || null,
    [availableClasses, selectedClassId]
  );

  const breadcrumbs = useMemo(
    () => [
      hierarchy?.institution?.name || 'Institution',
      selectedYear || 'Year',
      selectedGrade || 'Grade',
      selectedClass?.name || 'Class',
    ],
    [hierarchy, selectedYear, selectedGrade, selectedClass]
  );

  const value = useMemo(
    () => ({
      loading,
      error,
      hierarchy,
      availableYears,
      availableGrades,
      availableClasses,
      selectedYear,
      selectedGrade,
      selectedClassId,
      selectedClass,
      setSelectedYear,
      setSelectedGrade,
      setSelectedClassId,
      breadcrumbs,
      reloadHierarchy: loadHierarchy,
    }),
    [
      loading,
      error,
      hierarchy,
      availableYears,
      availableGrades,
      availableClasses,
      selectedYear,
      selectedGrade,
      selectedClassId,
      selectedClass,
      breadcrumbs,
    ]
  );

  return <AdminEnterpriseContext.Provider value={value}>{children}</AdminEnterpriseContext.Provider>;
}

export function useAdminEnterprise() {
  const context = useContext(AdminEnterpriseContext);
  if (!context) {
    return {
      loading: false,
      error: '',
      hierarchy: null,
      availableYears: [],
      availableGrades: [],
      availableClasses: [],
      selectedYear: '',
      selectedGrade: '',
      selectedClassId: '',
      selectedClass: null,
      setSelectedYear: () => {},
      setSelectedGrade: () => {},
      setSelectedClassId: () => {},
      breadcrumbs: ['Institution', 'Year', 'Grade', 'Class'],
      reloadHierarchy: async () => {},
    };
  }
  return context;
}
