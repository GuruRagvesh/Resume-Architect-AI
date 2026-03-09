export type ThemeFonts = {
  body: string;
  display: string;
};

export type ResumeTheme = {
  id: string;
  name: string;
  fonts: ThemeFonts;
  baseFontSize: number;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  paperColor: string;
  borderColor: string;
  chipBackground: string;
  chipText: string;
};

export const DEFAULT_THEME: ResumeTheme = {
  id: "default",
  name: "Default Studio",
  fonts: {
    body: "Manrope",
    display: "Fraunces"
  },
  baseFontSize: 16,
  primaryColor: "#0f766e",
  textColor: "#232a34",
  mutedColor: "#4e5664",
  paperColor: "#fefcf7",
  borderColor: "#d5ccbb",
  chipBackground: "#ebfbf7",
  chipText: "#0f766e"
};

export const FONT_OPTIONS = [
  "Manrope",
  "Inter",
  "Poppins",
  "Montserrat",
  "Open Sans",
  "Roboto",
  "Lora",
  "Merriweather"
];

export const COMPANY_THEME_PRESETS: ResumeTheme[] = [
  {
    id: "enterprise-blue",
    name: "Enterprise Blue",
    fonts: { body: "Inter", display: "Merriweather" },
    baseFontSize: 16,
    primaryColor: "#0052cc",
    textColor: "#172b4d",
    mutedColor: "#42526e",
    paperColor: "#f7faff",
    borderColor: "#c1d5ff",
    chipBackground: "#e9f0ff",
    chipText: "#003399"
  },
  {
    id: "consulting-charcoal",
    name: "Consulting Charcoal",
    fonts: { body: "Manrope", display: "Lora" },
    baseFontSize: 16,
    primaryColor: "#1f2937",
    textColor: "#111827",
    mutedColor: "#4b5563",
    paperColor: "#fbfaf8",
    borderColor: "#d1d5db",
    chipBackground: "#f3f4f6",
    chipText: "#1f2937"
  },
  {
    id: "fintech-teal",
    name: "Fintech Teal",
    fonts: { body: "Poppins", display: "Montserrat" },
    baseFontSize: 16,
    primaryColor: "#0f766e",
    textColor: "#102a2a",
    mutedColor: "#3f5f60",
    paperColor: "#f5fffd",
    borderColor: "#bde7e3",
    chipBackground: "#ddfaf4",
    chipText: "#0f766e"
  },
  {
    id: "luxury-burgundy",
    name: "Luxury Burgundy",
    fonts: { body: "Lora", display: "Merriweather" },
    baseFontSize: 17,
    primaryColor: "#7f1d3d",
    textColor: "#3a0f22",
    mutedColor: "#6d2e46",
    paperColor: "#fff8fb",
    borderColor: "#f1c5d6",
    chipBackground: "#fdebf2",
    chipText: "#7f1d3d"
  }
];
