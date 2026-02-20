type PostCardProps = {
  title: string;
  body: string;
  authorName: string;
  userId: number;
  onDeleteClick?: () => void;
  isDeleting?: boolean;
};

function truncate(text: string, maxLen: number) {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trimEnd()}...`;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NA";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min read`;
}

export function PostCard({
  title,
  body,
  authorName,
  userId,
  onDeleteClick,
  isDeleting = false,
}: PostCardProps) {
  const initials = getInitials(authorName);
  const preview = truncate(body, 220);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-200/70">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-100/70 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-500" />

      <header className="relative mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-sm font-bold text-white shadow-sm">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {authorName}
            </p>
            <p className="text-xs text-neutral-500">User #{userId}</p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600">
          {getReadingTime(body)}
        </span>
      </header>

      <div className="relative">
        <h3 className="mb-2 text-lg font-semibold leading-tight text-neutral-900">
          {title}
        </h3>

        <p className="text-sm leading-6 text-neutral-700">{preview}</p>
      </div>

      <footer className="relative mt-4 flex items-center justify-between border-t border-neutral-200/80 pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Post preview
        </span>
        <div className="flex items-center gap-3">
          <span className="cursor-pointer text-xs font-semibold text-sky-700 group-hover:text-sky-800">
            Read more -{">"}
          </span>
          <button
            type="button"
            onClick={onDeleteClick}
            disabled={isDeleting || !onDeleteClick}
            className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </footer>
    </article>
  );
}
