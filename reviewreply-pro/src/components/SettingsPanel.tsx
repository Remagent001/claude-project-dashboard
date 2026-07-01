"use client";

import {
  LOCATIONS,
  SERVICE_TYPES,
  STAR_RATINGS,
  TONES,
} from "@/lib/constants";
import type { GenerateRequest } from "@/lib/types";

interface Props {
  value: GenerateRequest;
  onChange: (patch: Partial<GenerateRequest>) => void;
  onGenerate: () => void;
  loading: boolean;
}

export default function SettingsPanel({
  value,
  onChange,
  onGenerate,
  loading,
}: Props) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-charcoal">
        Review & Settings
      </h2>

      <label className="label" htmlFor="reviewText">
        Customer review
      </label>
      <textarea
        id="reviewText"
        className="input min-h-[130px] resize-y"
        placeholder="Paste the Google review here…"
        value={value.reviewText}
        onChange={(e) => onChange({ reviewText: e.target.value })}
      />

      <div className="mt-4">
        <span className="label">Star rating</span>
        <div className="flex gap-1.5">
          {STAR_RATINGS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ starRating: s })}
              className={`h-9 w-9 rounded-xl border text-sm font-semibold transition ${
                value.starRating === s
                  ? "border-bronze bg-bronze text-white"
                  : "border-surface-border bg-surface text-charcoal-soft hover:bg-surface-sunken"
              }`}
              aria-pressed={value.starRating === s}
            >
              {s}★
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="location">
            Location
          </label>
          <select
            id="location"
            className="input"
            value={value.location}
            onChange={(e) => onChange({ location: e.target.value })}
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="serviceType">
            Service type
          </label>
          <select
            id="serviceType"
            className="input"
            value={value.serviceType}
            onChange={(e) => onChange({ serviceType: e.target.value })}
          >
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="staffName">
            Staff / barber <span className="normal-case text-charcoal-muted">(optional)</span>
          </label>
          <input
            id="staffName"
            className="input"
            placeholder="e.g. Marcus"
            value={value.staffName}
            onChange={(e) => onChange({ staffName: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="customerName">
            Customer <span className="normal-case text-charcoal-muted">(optional)</span>
          </label>
          <input
            id="customerName"
            className="input"
            placeholder="e.g. James"
            value={value.customerName}
            onChange={(e) => onChange({ customerName: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="label" htmlFor="tone">
          Response tone
        </label>
        <select
          id="tone"
          className="input"
          value={value.tone}
          onChange={(e) => onChange({ tone: e.target.value })}
        >
          {TONES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn-primary mt-5 w-full py-2.5"
        onClick={onGenerate}
        disabled={loading || !value.reviewText.trim()}
      >
        {loading ? "Generating…" : "Generate 3 responses"}
      </button>
    </div>
  );
}
