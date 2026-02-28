import {
  ClassIcon,
  DashboardIcon,
  FeedbackIcon,
  ImportIcon,
  NotificationIcon,
  ReportIcon,
  ScheduleIcon,
  SettingsIcon,
  StudentsIcon,
  SubjectIcon,
  SurveyIcon,
  TeacherIcon,
} from '../components/AdminIcons';

export const adminNavGroups = [
  {
    key: 'main',
    label: null,
    items: [
      { key: 'dashboard', label: 'Dashboard', to: '/admin', icon: DashboardIcon },
    ],
  },
  {
    key: 'entities',
    label: 'Entity Modules',
    items: [
      { key: 'students', label: 'Students', to: '/admin/students', icon: StudentsIcon },
      { key: 'teachers', label: 'Teachers', to: '/admin/teachers', icon: TeacherIcon },
      { key: 'classes', label: 'Classes', to: '/admin/classes', icon: ClassIcon },
      { key: 'subjects', label: 'Subjects', to: '/admin/subjects', icon: SubjectIcon },
      { key: 'schedule', label: 'Scheduling Engine', to: '/admin/schedule', icon: ScheduleIcon },
    ],
  },
  {
    key: 'workflows',
    label: 'Workflow Modules',
    items: [
      { key: 'feedback', label: 'Ticket Workflow', to: '/admin/feedback', icon: FeedbackIcon },
      { key: 'surveys', label: 'Survey Lifecycle', to: '/admin/surveys', icon: SurveyIcon },
      { key: 'notifications', label: 'Notifications', to: '/admin/notifications', icon: NotificationIcon },
    ],
  },
  {
    key: 'system',
    label: 'System',
    items: [
      { key: 'import-users', label: 'Import Users', to: '/admin/import-users', icon: ImportIcon },
      { key: 'reports', label: 'Analytics Reports', to: '/admin/reports', icon: ReportIcon },
      { key: 'settings', label: 'Settings and RBAC', to: '/admin/settings', icon: SettingsIcon },
    ],
  },
];

export const adminNavItems = adminNavGroups.flatMap((group) => group.items);
