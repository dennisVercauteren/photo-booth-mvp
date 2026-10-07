import { useState } from "react";
import { saveSettings } from "../api/client";
import type { BoothSettingsResponse } from "../types";

interface SettingsMenuProps {
  current: BoothSettingsResponse;
  onSaved: (next: BoothSettingsResponse) => void;
  onClose: () => void;
}

/** Operator menu. Opened by holding the gear on the start screen. */
export function SettingsMenu({ current, onSaved, onClose }: SettingsMenuProps) {
  const [imageCount, setImageCount] = useState(current.settings.imageCount);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const counts = Array.from({ length: current.limits.maxImageCount }, (_, index) => index + 1);

  async function save(): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      onSaved(await saveSettings({ imageCount }));
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save settings.");
      setSaving(false);
    }
  }

  return (
    <div className="settings-backdrop" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <section className="settings-card">
        <p className="eyebrow">Staff only</p>
        <h2 id="settings-title">Booth settings</h2>
        <div className="settings-field">
          <p className="settings-label">Pictures per photo</p>
          <p className="settings-hint">Each picture is one Gemini image, so fewer pictures cost less.</p>
          <div className="settings-options" role="radiogroup" aria-label="Pictures per photo">
            {counts.map((count) => (
              <button
                key={count}
                type="button"
                role="radio"
                aria-checked={count === imageCount}
                className={count === imageCount ? "settings-option selected" : "settings-option"}
                onClick={() => setImageCount(count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        <div className="action-row two">
          <button type="button" className="button button-primary" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" className="button button-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
