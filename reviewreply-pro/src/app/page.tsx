"use client";

import { useState } from "react";
import SettingsPanel from "@/components/SettingsPanel";
import ResponseCard from "@/components/ResponseCard";
import History from "@/components/History";
import BrandSettingsModal from "@/components/BrandSettingsModal";
import type { GenerateRequest, GenerateResult } from "@/lib/types";

const EMPTY_FORM: GenerateRequest = {
  reviewText: "",
  starRating: 5,
  location: "Unknown",
  serviceType: "Unknown",
  staffName: "",
  customerName: "",
  tone: "Warm",
};

const RISK_STYLES: Record<string, string> = {
  low: "border-emerald-300 bg-emerald-50 text-emerald-700",
  medium: "border-amber-300 bg-amber-50 text-amber-700",
  high: "border-red-300 bg-red-50 text-red-700",
};

export default function Home() {
  const [form, setForm] = useState<GenerateRequest>(EMPTY_FORM);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  function patch(p: Partial<GenerateRequest>) {
    setForm((f) => ({ ...f, ...p }));
  }

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setResult(data as GenerateResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function markResponse(responseId: string, action: "copy" | "save") {
    await fetch("/api/responses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ responseId, action }),
    });
    if (action === "save") setHistoryKey((k) => k + 1);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">
            ReviewReply <span className="text-bronze">Pro</span>
          </h1>
          <p className="mt-1 text-sm text-charcoal-muted">
            Premium, brand-safe replies for Eighteen Eight Fine Men&apos;s Salon
          </p>
        </div>
        <button className="btn-ghost" onClick={() => setSettingsOpen(true)}>
          ⚙ Brand voice
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
        {/* Left: inputs */}
        <SettingsPanel
          value={form}
          onChange={patch}
          onGenerate={generate}
          loading={loading}
        />

        {/* Right: generated responses */}
        <div className="space-y-4">
          {error && (
            <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!result && !error && (
            <div className="card flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
              <p className="text-sm text-charcoal-muted">
                Paste a review and click{" "}
                <span className="font-semibold text-charcoal-soft">
                  Generate 3 responses
                </span>{" "}
                to see Short, Standard, and Personalized options here.
              </p>
            </div>
          )}

          {result && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`chip ${RISK_STYLES[result.duplicateRisk] ?? ""}`}
                >
                  Duplicate risk: {result.duplicateRisk}
                </span>
                <span className="chip">via {result.provider}</span>
                {result.seoKeywordsUsed.map((k) => (
                  <span key={k} className="chip">
                    #{k}
                  </span>
                ))}
              </div>

              {result.riskNotes && (
                <div className="card border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <strong>Risk notes:</strong> {result.riskNotes}
                </div>
              )}

              {result.options.map((opt) => (
                <ResponseCard
                  key={opt.responseId}
                  option={opt}
                  onCopied={() => markResponse(opt.responseId, "copy")}
                  onSaved={() => markResponse(opt.responseId, "save")}
                />
              ))}

              <div className="flex items-center justify-between">
                <p className="text-xs text-charcoal-muted">
                  Review before posting — responses are AI-assisted drafts.
                </p>
                <button
                  className="btn-ghost"
                  onClick={generate}
                  disabled={loading}
                >
                  ↻ Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom: history */}
      <div className="mt-8">
        <History refreshKey={historyKey} />
      </div>

      <BrandSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <footer className="mt-10 border-t border-surface-border pt-4 text-center text-xs text-charcoal-muted">
        Review responses should be reviewed before posting. ReviewReply Pro ·
        MVP
      </footer>
    </main>
  );
}
