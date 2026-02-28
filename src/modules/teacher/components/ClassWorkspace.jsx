import GradeTable from './GradeTable';
import HomeworkList from './HomeworkList';
import PostList from './PostList';
import SidebarSummary from './SidebarSummary';
import StudentTable from './StudentTable';
import Tabs from './Tabs';

const WORKSPACE_TABS = [
  { key: 'posts', label: 'المنشورات' },
  { key: 'homework', label: 'الواجبات' },
  { key: 'grades', label: 'الدرجات' },
  { key: 'students', label: 'الطلاب' },
];

export default function ClassWorkspace({
  className,
  studentCount,
  activeTab,
  onChangeTab,
  posts,
  homework,
  grades,
  students,
  summary,
  recentSubmissions,
  onCreatePost,
  onEditPost,
  onDeletePost,
  onCreateHomework,
  onEditHomework,
  onDeleteHomework,
  onOpenHomeworkDetail,
  onAddGrade,
  onImportGrade,
  onEditGrade,
  onViewStudent,
}) {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="ht-display text-[34px] font-semibold leading-[1.3] text-[var(--ht-neutral-900)]">{className}</h2>
        <p className="mt-1 text-[14px] text-[var(--ht-neutral-500)]">عدد الطلاب: {studentCount}</p>
      </header>

      <div className="border-t border-[var(--ht-border-subtle)]" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <section className="space-y-4">
          <Tabs tabs={WORKSPACE_TABS} activeKey={activeTab} onChange={onChangeTab} />

          {activeTab === 'posts' ? (
            <PostList posts={posts} onCreate={onCreatePost} onEdit={onEditPost} onDelete={onDeletePost} />
          ) : null}

          {activeTab === 'homework' ? (
            <HomeworkList
              items={homework}
              onCreate={onCreateHomework}
              onEdit={onEditHomework}
              onDelete={onDeleteHomework}
              onOpenDetail={onOpenHomeworkDetail}
            />
          ) : null}

          {activeTab === 'grades' ? (
            <GradeTable rows={grades} onAdd={onAddGrade} onImport={onImportGrade} onEdit={onEditGrade} />
          ) : null}

          {activeTab === 'students' ? <StudentTable rows={students} onViewProfile={onViewStudent} /> : null}
        </section>

        <SidebarSummary summary={summary} recentSubmissions={recentSubmissions} />
      </div>
    </section>
  );
}
