"use client";

import { useState } from "react";
import { LENGTH_BOUNDS } from "@/lib/constants";
import type { ScoredOption } from "@/lib/types";

interface Props {
  option: ScoredOption;
  onCopied: () => void;
  onSaved: () => void;
}

export default function ResponseCard({ option, onCopied, onSaved }: Props) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const bounds = LENGTH_BOUNDS[option.lengthType];
  const withinRange =
    option.wordCount >= bounds.min && option.wordCount <= bounds.max;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(option.text);
    } catch {
      /* clipboard may be blocked; still mark as copied server-side */
    }
    setCopied(true);
    onCopied();
    setTimeout(() => setCopied(false), 1600);
  }

  function handleSave() {
    setSaved(true);
    onSaved();
  }

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="chip capitalize">{bounds.label}</span>
          <span
            className={`text-xs ${
              withinRange ? "text-charcoal-muted" : "text-amber-600"
            }`}
          >
            {option.wordCount} words
            {!withinRange && ` (target ${bounds.min}–${bounds.max})`}
          </span>
        </div>
        {option.similarWarning && (
          <span
            className="chip border-amber-300 bg-amber-50 text-amber-700"
            title={
              option.closestMatch
                ? `Closest prior: ${option.closestMatch}`
                : undefined
            }
          >
            ⚠ Similar to a past response
          </span>
        )}
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-charcoal-soft">
        {option.text}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button className="btn-ghost" onClick={handleCopy}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <button className="btn-primary" onClick={handleSave} disabled={saved}>
          {saved ? "✓ Saved" : "Save to history"}
        </button>
      </div>
    </div>
  );
}
