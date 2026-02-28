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
      { key: 'dashboard', label: 'لوحة التحكم', to: '/admin', icon: DashboardIcon },
    ],
  },
  {
    key: 'academic',
    label: 'الأكاديمي',
    items: [
      { key: 'students',  label: 'الطلاب',           to: '/admin/students',  icon: StudentsIcon },
      { key: 'teachers',  label: 'المعلمون',          to: '/admin/teachers',  icon: TeacherIcon  },
      { key: 'classes',   label: 'الصفوف',            to: '/admin/classes',   icon: ClassIcon    },
      { key: 'subjects',  label: 'المواد',            to: '/admin/subjects',  icon: SubjectIcon  },
      { key: 'schedule',  label: 'الجدول الأكاديمي',  to: '/admin/schedule',  icon: ScheduleIcon },
    ],
  },
  {
    key: 'tools',
    label: 'الأدوات',
    items: [
      { key: 'feedback',      label: 'التغذية الراجعة',    to: '/admin/feedback',      icon: FeedbackIcon     },
      { key: 'surveys',       label: 'الاستبيانات',         to: '/admin/surveys',       icon: SurveyIcon       },
      { key: 'notifications', label: 'الإشعارات',           to: '/admin/notifications', icon: NotificationIcon },
    ],
  },
  {
    key: 'system',
    label: 'النظام',
    items: [
      { key: 'import-users', label: 'استيراد المستخدمين', to: '/admin/import-users', icon: ImportIcon   },
      { key: 'reports',      label: 'التقارير',            to: '/admin/reports',      icon: ReportIcon   },
      { key: 'settings',     label: 'الإعدادات',           to: '/admin/settings',     icon: SettingsIcon },
    ],
  },
];

// Flat list kept for any legacy usage
export const adminNavItems = adminNavGroups.flatMap((g) => g.items);
