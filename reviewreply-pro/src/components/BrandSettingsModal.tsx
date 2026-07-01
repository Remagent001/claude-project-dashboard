"use client";

import { useEffect, useState } from "react";
import type { BrandSettingsDTO } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BrandSettingsModal({ open, onClose }: Props) {
  const [settings, setSettings] = useState<BrandSettingsDTO | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, [open]);

  if (!open) return null;

  function update<K extends keyof BrandSettingsDTO>(
    key: K,
    val: BrandSettingsDTO[K],
  ) {
    setSettings((s) => (s ? { ...s, [key]: val } : s));
  }

  // Multi-line list fields are edited as newline-separated text.
  function listField(key: "forbiddenPhrases" | "preferredPhrases" | "seoKeywords", label: string) {
    return (
      <div>
        <label className="label">{label}</label>
        <textarea
          className="input min-h-[80px] resize-y font-mono text-xs"
          value={settings ? settings[key].join("\n") : ""}
          onChange={(e) =>
            update(
              key,
              e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
            )
          }
        />
        <p className="mt-1 text-xs text-charcoal-muted">One per line.</p>
      </div>
    );
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal/40 p-6">
      <div className="card w-full max-w-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal">Brand Voice Settings</h2>
          <button className="text-charcoal-muted hover:text-charcoal" onClick={onClose}>
            ✕
          </button>
        </div>

        {!settings ? (
          <p className="text-sm text-charcoal-muted">Loading…</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Business name</label>
              <input
                className="input"
                value={settings.businessName}
                onChange={(e) => update("businessName", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Brand voice</label>
              <textarea
                className="input min-h-[100px] resize-y"
                value={settings.brandVoice}
                onChange={(e) => update("brandVoice", e.target.value)}
              />
            </div>
            {listField("forbiddenPhrases", "Forbidden / overused phrases to avoid")}
            {listField("preferredPhrases", "Preferred phrases")}
            {listField("seoKeywords", "SEO keywords")}

            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save settings"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
