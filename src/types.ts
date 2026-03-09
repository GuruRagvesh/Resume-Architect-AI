export interface ResumeProject {
  client: string;
  domain: string;
  duration: string;
  role: string;
  impact: string;
  stack: string;
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface CustomSection {
  title: string;
  content: string;
}

export interface BadgeBox {
  label: string;
  box2d: [number, number, number, number];
  pageIndex: number;
}

export interface ConsultantProfile {
  name: string;
  title: string;
  summary: string;
  certifications: string[];
  languages: string[];
  expertise: string[];
  skills: {
    primary: string[];
    secondary: string[];
    tools: string[];
  };
  experience: string[];
  projects: ResumeProject[];
  awards: string[];
  education: ResumeEducation[];
  customSections: CustomSection[];
  photoBox?: [number, number, number, number];
  photoPageIndex?: number;
  badgeBoxes?: BadgeBox[];
}

export interface UploadedAsset {
  data: string;
  mimeType: string;
  name: string;
}
