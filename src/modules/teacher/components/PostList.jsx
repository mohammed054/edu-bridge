import EmptyState from './EmptyState';
import { formatEnglishDateTime } from '../utils/format';

export default function PostList({ posts = [], onCreate, onEdit, onDelete }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[20px] font-semibold text-[var(--ht-neutral-900)]">المنشورات</h3>
        <button
          type="button"
          onClick={onCreate}
          className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ht-border-focus)] focus-visible:ring-offset-2"
        >
          + نشر إعلان
        </button>
      </div>

      {!posts.length ? (
        <EmptyState message="لا توجد بيانات حالياً" />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <article key={post.id} className="ht-surface p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-[16px] font-semibold text-[var(--ht-neutral-900)]">{post.title}</h4>
                <span className="text-[12px] text-[var(--ht-neutral-400)]">{formatEnglishDateTime(post.createdAt)}</span>
              </div>
              <p className="text-[14px] leading-[1.9] text-[var(--ht-neutral-700)]">{post.body || '-'}</p>
              {post.attachmentName ? (
                <p className="mt-3 text-[13px] text-[var(--ht-neutral-500)]">المرفق: {post.attachmentName}</p>
              ) : null}

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(post)}
                  className="ht-interactive rounded-[4px] border border-[var(--ht-border-default)] px-3 py-1.5 text-[12px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none"
                >
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(post)}
                  className="ht-interactive rounded-[4px] border border-[var(--ht-border-default)] px-3 py-1.5 text-[12px] text-[var(--ht-danger-600)] hover:bg-[var(--ht-danger-100)] active:scale-[0.98] focus-visible:outline-none"
                >
                  حذف
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
