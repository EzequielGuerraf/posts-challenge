"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PostCard } from "@/components/postCard";

type ApiPost = {
  id: number;
  userId: number;
  title: string;
  body: string;
  user: {
    id: number;
    name: string;
  };
};

type ApiResponse = {
  posts: ApiPost[];
};

type ApiErrorResponse = {
  error?: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reseeding, setReseeding] = useState(false);
  const [reseedError, setReseedError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [postToDelete, setPostToDelete] = useState<ApiPost | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/posts", { method: "GET" });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as ApiErrorResponse | null;

        throw new Error(data?.error ?? "Couldn't load posts.");
      }

      const data = (await res.json()) as ApiResponse;
      setPosts(data.posts);
      setHasLoadedOnce(true);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Couldn't load posts. Check your connection and try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const openDeleteModal = useCallback((post: ApiPost) => {
    setPostToDelete(post);
    setDeleteError(null);
  }, []);

  const reseedPosts = useCallback(async () => {
    setReseeding(true);
    setReseedError(null);

    try {
      const res = await fetch("/api/posts/reseed", { method: "POST" });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as ApiErrorResponse | null;
        throw new Error(data?.error ?? "Couldn't re-seed posts.");
      }

      await loadPosts();
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Couldn't re-seed posts. Check your connection and try again.";

      setReseedError(message);
    } finally {
      setReseeding(false);
    }
  }, [loadPosts]);

  const closeDeleteModal = useCallback(() => {
    if (deletingId !== null) return;

    setPostToDelete(null);
    setDeleteError(null);
  }, [deletingId]);

  const confirmDeletePost = useCallback(async () => {
    if (!postToDelete) return;

    const id = postToDelete.id;
    setDeletingId(id);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as ApiErrorResponse | null;
        throw new Error(data?.error ?? "Couldn't delete post.");
      }

      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id));
      setPostToDelete(null);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Couldn't delete post. Check your connection and try again.";

      setDeleteError(message);
    } finally {
      setDeletingId(null);
    }
  }, [postToDelete]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const totalPosts = posts.length;

  const uniqueAuthorsCount = useMemo(
    () => new Set(posts.map((post) => post.user.id)).size,
    [posts],
  );

  const userIdOptions = useMemo(
    () =>
      Array.from(new Set(posts.map((post) => post.userId))).sort((a, b) => a - b),
    [posts],
  );

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesUserId =
        selectedUserId === "all" || post.userId === Number(selectedUserId);

      if (!matchesUserId) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      const titleMatches = post.title.toLowerCase().includes(normalizedSearchTerm);
      const bodyMatches = post.body.toLowerCase().includes(normalizedSearchTerm);
      return titleMatches || bodyMatches;
    });
  }, [normalizedSearchTerm, posts, selectedUserId]);

  const hasActiveFilters =
    selectedUserId !== "all" || normalizedSearchTerm.length > 0;
  const visiblePostsCount = filteredPosts.length;

  useEffect(() => {
    if (
      selectedUserId !== "all" &&
      !userIdOptions.some((userId) => String(userId) === selectedUserId)
    ) {
      setSelectedUserId("all");
    }
  }, [selectedUserId, userIdOptions]);

  const content = useMemo(() => {
    if (loading && !hasLoadedOnce) {
      return (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={`post-skeleton-${index}`}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-sm"
            >
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-neutral-200" />
                    <div className="space-y-2">
                      <div className="h-3.5 w-28 rounded-full bg-neutral-200" />
                      <div className="h-3 w-16 rounded-full bg-neutral-100" />
                    </div>
                  </div>
                  <div className="h-6 w-20 rounded-full bg-neutral-100" />
                </div>

                <div className="space-y-2">
                  <div className="h-5 w-4/5 rounded bg-neutral-200" />
                  <div className="h-4 w-full rounded bg-neutral-100" />
                  <div className="h-4 w-5/6 rounded bg-neutral-100" />
                </div>
              </div>
            </article>
          ))}
        </div>
      );
    }

    if (!loading && error && !hasLoadedOnce) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
              !
            </span>
            <div>
              <p className="text-sm font-semibold text-red-900">
                Couldn&apos;t load posts.
              </p>
              <p className="mt-1 text-sm text-red-800/90">
                Check your connection and try again.
              </p>
              <button
                className="mt-4 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                onClick={() => void loadPosts()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!loading && posts.length === 0) {
      return (
        <div className="rounded-2xl border border-neutral-200 bg-white/90 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
            +
          </div>
          <p className="text-base font-semibold text-neutral-900">No posts found</p>
          <p className="mt-1 text-sm text-neutral-600">
            Your database is empty right now. Create posts to see them here.
          </p>
        </div>
      );
    }

    if (!loading && filteredPosts.length === 0) {
      return (
        <div className="rounded-2xl border border-neutral-200 bg-white/90 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
            ?
          </div>
          <p className="text-base font-semibold text-neutral-900">
            No matches for your filters
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Try a different user or a shorter keyword.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:gap-5">
        {filteredPosts.map((p) => {
          const isDeletingPost = deletingId === p.id;

          return (
            <div
              key={p.id}
              className="transition-transform duration-300 hover:translate-y-[-2px]"
            >
              <PostCard
                title={p.title}
                body={p.body}
                authorName={p.user.name}
                userId={p.userId}
                onDeleteClick={() => openDeleteModal(p)}
                isDeleting={isDeletingPost}
              />
            </div>
          );
        })}
      </div>
    );
  }, [
    deletingId,
    error,
    filteredPosts,
    hasLoadedOnce,
    loadPosts,
    loading,
    openDeleteModal,
    posts.length,
  ]);

  const isDeletingPostInModal =
    postToDelete !== null && deletingId === postToDelete.id;

  return (
    <main className="relative isolate mx-auto min-h-screen w-full max-w-5xl bg-gradient-to-b from-neutral-100 via-neutral-50 to-neutral-100 px-4 py-8 md:py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-neutral-100 via-neutral-50 to-transparent" />
      <div className="pointer-events-none absolute -left-28 top-10 -z-10 h-64 w-64 rounded-full bg-neutral-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-24 -z-10 h-72 w-72 rounded-full bg-slate-200/40 blur-3xl" />

      <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white/95 p-6 shadow-xl shadow-neutral-200/70 backdrop-blur-sm md:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-neutral-500 via-slate-400 to-zinc-500" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">
              Content Dashboard
            </span>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                Posts Overview
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Monitor and manage the posts stored in your local database with
                a cleaner, faster and more readable interface.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Total posts
                </p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {totalPosts}
                </p>
              </article>

              <article className="rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Authors
                </p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {uniqueAuthorsCount}
                </p>
              </article>

              <article className="rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Showing
                </p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {visiblePostsCount}
                </p>
              </article>
            </div>
          </div>

          <div className="flex shrink-0 items-stretch gap-2 sm:items-center">
            <button
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              onClick={() => void loadPosts()}
              disabled={loading || reseeding}
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              >
                <path
                  fill="currentColor"
                  d="M10 3a7 7 0 1 0 6.7 9h-2.1a5 5 0 1 1-1.1-4.9l-1.5 1.5H17V3.9l-1.9 1.9A6.98 6.98 0 0 0 10 3Z"
                />
              </svg>
              {loading ? "Refreshing..." : "Refresh posts"}
            </button>

            <button
              className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              onClick={() => void reseedPosts()}
              disabled={loading || reseeding}
            >
              {reseeding ? (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sky-300 border-t-sky-800"
                />
              ) : null}
              {reseeding ? "Re-seeding..." : "Re-seed"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 md:grid-cols-[1fr_auto_auto]">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Search text
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Filter by words in title or body"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              User ID
            </span>
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 md:min-w-40"
            >
              <option value="all">All users</option>
              {userIdOptions.map((userId) => (
                <option key={userId} value={String(userId)}>
                  User #{userId}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedUserId("all");
              }}
              disabled={!hasActiveFilters}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-55 md:w-auto"
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      {hasLoadedOnce && error ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
          <p className="text-sm font-medium text-amber-900">
            {error}{" "}
            <button
              className="font-semibold underline underline-offset-2"
              onClick={() => void loadPosts()}
            >
              Retry now
            </button>
          </p>
        </div>
      ) : null}

      {reseedError ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-sm">
          <p className="text-sm font-medium text-red-900">
            {reseedError}{" "}
            <button
              className="font-semibold underline underline-offset-2"
              onClick={() => void reseedPosts()}
            >
              Retry re-seed
            </button>
          </p>
        </div>
      ) : null}

      <section aria-live="polite" aria-busy={loading} className="mt-6">
        {content}
      </section>

      {postToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close delete confirmation modal"
            onClick={closeDeleteModal}
            disabled={isDeletingPostInModal}
            className="absolute inset-0 bg-neutral-200/75 backdrop-blur-sm"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-post-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl shadow-neutral-900/30"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-lg font-semibold text-red-700">
              !
            </div>

            <h2
              id="delete-post-title"
              className="text-xl font-semibold text-neutral-900"
            >
              Delete post?
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              You are about to delete{" "}
              <span className="font-medium text-neutral-900">
                &quot;{postToDelete.title}&quot;
              </span>
              .
            </p>
            <p className="mt-2 text-xs font-medium text-neutral-500">
              This action cannot be undone.
            </p>

            {deleteError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeletingPostInModal}
                className="rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeletePost()}
                disabled={isDeletingPostInModal}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isDeletingPostInModal ? (
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  />
                ) : null}
                {isDeletingPostInModal ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
