"use client";

import { useCallback, useEffect, useState } from "react";

interface ResponseRow {
  id: string;
  responseText: string;
  lengthType: string;
  tone: string;
  saved: boolean;
  copied: boolean;
  similarityScore: number;
}
interface ReviewRow {
  id: string;
  reviewText: string;
  starRating: number;
  customerName: string | null;
  location: string | null;
  serviceType: string | null;
  staffName: string | null;
  createdAt: string;
  responses: ResponseRow[];
}

export default function History({ refreshKey }: { refreshKey: number }) {
  const [q, setQ] = useState("");
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/history?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Debounced search.
  useEffect(() => {
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function deleteReview(id: string) {
    await fetch(`/api/history?id=${id}`, { method: "DELETE" });
    load(q);
  }

  async function clearAll() {
    if (!confirm("Delete ALL saved history and response memory? This cannot be undone.")) return;
    await fetch(`/api/history?all=true`, { method: "DELETE" });
    load(q);
  }

  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-charcoal">
          Response History
        </h2>
        <div className="flex items-center gap-2">
          <input
            className="input w-56"
            placeholder="Search past responses…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <a className="btn-ghost" href="/api/history?format=csv">
            Export CSV
          </a>
          <button className="btn-ghost text-red-600" onClick={clearAll}>
            Clear all
          </button>
        </div>
      </div>

      {loading && reviews.length === 0 ? (
        <p className="text-sm text-charcoal-muted">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-charcoal-muted">
          No saved responses yet. Generate a response and click “Save to history”.
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-surface-border p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="text-xs text-charcoal-muted">
                  <span className="font-semibold text-charcoal-soft">
                    {"★".repeat(r.starRating)}
                    {"☆".repeat(5 - r.starRating)}
                  </span>{" "}
                  · {new Date(r.createdAt).toLocaleDateString()}
                  {r.location && r.location !== "Unknown" && ` · ${r.location}`}
                  {r.serviceType && r.serviceType !== "Unknown" && ` · ${r.serviceType}`}
                  {r.customerName && ` · ${r.customerName}`}
                </div>
                <button
                  className="text-xs text-red-600 hover:underline"
                  onClick={() => deleteReview(r.id)}
                >
                  Delete
                </button>
              </div>
              <p className="mb-2 line-clamp-2 text-xs italic text-charcoal-muted">
                “{r.reviewText}”
              </p>
              <ul className="space-y-2">
                {r.responses.map((resp) => (
                  <li
                    key={resp.id}
                    className="rounded-lg bg-surface-sunken p-2.5 text-sm text-charcoal-soft"
                  >
                    <span className="chip mb-1 mr-2 capitalize">{resp.lengthType}</span>
                    {resp.copied && <span className="chip mb-1 mr-2">copied</span>}
                    {resp.saved && <span className="chip mb-1">saved</span>}
                    <span className="mt-1 block">{resp.responseText}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
