import React, { useMemo, useState } from "react";
import { deleteThemePreset, loadSavedThemes, saveThemePreset } from "./themeStorage";
import { COMPANY_THEME_PRESETS, DEFAULT_THEME, FONT_OPTIONS, ResumeTheme } from "./themeTypes";

type Props = {
  isOpen: boolean;
  theme: ResumeTheme;
  onChange: (theme: ResumeTheme) => void;
  onClose: () => void;
};

function hex(value: string): string {
  return value.startsWith("#") ? value : `#${value}`;
}

function themeId(): string {
  return `theme-${Date.now()}`;
}

const ThemeStudioPanel: React.FC<Props> = ({ isOpen, theme, onChange, onClose }) => {
  const [presetName, setPresetName] = useState("");
  const [savedThemes, setSavedThemes] = useState<ResumeTheme[]>(() => loadSavedThemes());

  const presets = useMemo(() => [...COMPANY_THEME_PRESETS, ...savedThemes], [savedThemes]);

  if (!isOpen) return null;

  const patch = <K extends keyof ResumeTheme>(key: K, value: ResumeTheme[K]) => {
    onChange({ ...theme, [key]: value });
  };

  const patchFonts = (key: "body" | "display", value: string) => {
    onChange({ ...theme, fonts: { ...theme.fonts, [key]: value } });
  };

  const saveCurrent = () => {
    const name = presetName.trim() || `Custom ${new Date().toLocaleTimeString()}`;
    const saved = saveThemePreset({ ...theme, id: themeId(), name });
    setSavedThemes(saved);
    setPresetName("");
  };

  return (
    <div className="theme-panel-overlay no-print">
      <aside className="theme-panel">
        <div className="theme-panel-head">
          <h3>Internal Theme Controls</h3>
          <button type="button" className="link-button" onClick={onClose}>Close</button>
        </div>

        <p className="helper">Configure internal formatting presets. Save reusable TechnoEdge templates and apply instantly.</p>

        <label>Body Font</label>
        <select value={theme.fonts.body} onChange={(e) => patchFonts("body", e.target.value)}>
          {FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}
        </select>

        <label>Display Font</label>
        <select value={theme.fonts.display} onChange={(e) => patchFonts("display", e.target.value)}>
          {FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}
        </select>

        <label>Base Font Size: {theme.baseFontSize}px</label>
        <input
          type="range"
          min={13}
          max={20}
          step={1}
          value={theme.baseFontSize}
          onChange={(e) => patch("baseFontSize", Number(e.target.value))}
        />

        <div className="theme-color-grid">
          <div>
            <label>Primary</label>
            <input type="color" value={hex(theme.primaryColor)} onChange={(e) => patch("primaryColor", e.target.value)} />
          </div>
          <div>
            <label>Text</label>
            <input type="color" value={hex(theme.textColor)} onChange={(e) => patch("textColor", e.target.value)} />
          </div>
          <div>
            <label>Muted</label>
            <input type="color" value={hex(theme.mutedColor)} onChange={(e) => patch("mutedColor", e.target.value)} />
          </div>
          <div>
            <label>Paper</label>
            <input type="color" value={hex(theme.paperColor)} onChange={(e) => patch("paperColor", e.target.value)} />
          </div>
          <div>
            <label>Border</label>
            <input type="color" value={hex(theme.borderColor)} onChange={(e) => patch("borderColor", e.target.value)} />
          </div>
          <div>
            <label>Chip Bg</label>
            <input type="color" value={hex(theme.chipBackground)} onChange={(e) => patch("chipBackground", e.target.value)} />
          </div>
          <div>
            <label>Chip Text</label>
            <input type="color" value={hex(theme.chipText)} onChange={(e) => patch("chipText", e.target.value)} />
          </div>
        </div>

        <div className="theme-actions">
          <input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name (example: TCS style)"
          />
          <button type="button" className="button button-primary" onClick={saveCurrent}>Save Internal Template</button>
          <button type="button" className="button button-secondary" onClick={() => onChange(DEFAULT_THEME)}>Reset Default</button>
        </div>

        <h4>Template Library</h4>
        <div className="preset-list">
          {presets.map((preset) => (
            <div className="preset-item" key={preset.id}>
              <button type="button" onClick={() => onChange(preset)} className="preset-apply">{preset.name}</button>
              {savedThemes.some((x) => x.id === preset.id) ? (
                <button type="button" className="preset-delete" onClick={() => setSavedThemes(deleteThemePreset(preset.id))}>Delete</button>
              ) : null}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default ThemeStudioPanel;
