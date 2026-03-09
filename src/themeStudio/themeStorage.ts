import { ResumeTheme } from "./themeTypes";

const STORAGE_KEY = "resume_theme_studio_presets_v1";

export function loadSavedThemes(): ResumeTheme[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ResumeTheme[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveThemePreset(theme: ResumeTheme): ResumeTheme[] {
  const existing = loadSavedThemes();
  const next = [theme, ...existing.filter((item) => item.id !== theme.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteThemePreset(id: string): ResumeTheme[] {
  const next = loadSavedThemes().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
