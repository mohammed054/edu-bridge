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

export const adminNavItems = [
  { key: 'dashboard', label: 'لوحة التحكم', to: '/admin', icon: DashboardIcon },
  { key: 'students', label: 'الطلاب', to: '/admin/students', icon: StudentsIcon },
  { key: 'teachers', label: 'المعلمون', to: '/admin/teachers', icon: TeacherIcon },
  { key: 'classes', label: 'الصفوف', to: '/admin/classes', icon: ClassIcon },
  { key: 'subjects', label: 'المواد', to: '/admin/subjects', icon: SubjectIcon },
  { key: 'feedback', label: 'التغذية الراجعة', to: '/admin/feedback', icon: FeedbackIcon },
  { key: 'import-users', label: 'استيراد المستخدمين', to: '/admin/import-users', icon: ImportIcon },
  { key: 'surveys', label: 'الاستبيانات', to: '/admin/surveys', icon: SurveyIcon },
  { key: 'schedule', label: 'الجدول الأكاديمي', to: '/admin/schedule', icon: ScheduleIcon },
  { key: 'notifications', label: 'الإشعارات', to: '/admin/notifications', icon: NotificationIcon },
  { key: 'reports', label: 'التقارير', to: '/admin/reports', icon: ReportIcon },
  { key: 'settings', label: 'الإعدادات', to: '/admin/settings', icon: SettingsIcon },
];
