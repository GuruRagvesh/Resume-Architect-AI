import React, { useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { transformResume } from "./geminiService";
import ProfileCard from "./components/ProfileCard";
import { ConsultantProfile, UploadedAsset } from "./types";
import { exportProfileToPdfFromView, exportProfileToWordFromView } from "./wordService";
import ThemeStudioPanel from "./themeStudio/ThemeStudioPanel";
import { DEFAULT_THEME, ResumeTheme } from "./themeStudio/themeTypes";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

async function pdfToImageDataUrls(base64: string, maxPages = 10): Promise<string[]> {
  const loadingTask = pdfjsLib.getDocument({ data: atob(base64) });
  const pdf = await loadingTask.promise;
  const pages = Math.min(pdf.numPages, maxPages);
  const output: string[] = [];

  for (let i = 1; i <= pages; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;
    output.push(canvas.toDataURL("image/jpeg", 0.85));
  }

  return output;
}

const App: React.FC = () => {
  const [rawResume, setRawResume] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedAsset[] | null>(null);
  const [sourceImages, setSourceImages] = useState<string[] | null>(null);
  const [profile, setProfile] = useState<ConsultantProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "word" | null>(null);
  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState(false);
  const [theme, setTheme] = useState<ResumeTheme>(DEFAULT_THEME);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canBuild = useMemo(() => Boolean(rawResume.trim()) || Boolean(uploadedFiles?.length), [rawResume, uploadedFiles]);

  const profileThemeStyle = {
    "--profile-font-ui": `"${theme.fonts.body}", sans-serif`,
    "--profile-font-display": `"${theme.fonts.display}", serif`,
    "--profile-base-font": `${theme.baseFontSize}px`,
    "--profile-primary": theme.primaryColor,
    "--profile-text": theme.textColor,
    "--profile-muted": theme.mutedColor,
    "--profile-paper": theme.paperColor,
    "--profile-border": theme.borderColor,
    "--profile-chip-bg": theme.chipBackground,
    "--profile-chip-text": theme.chipText
  } as React.CSSProperties;

  const onSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setError(null);
    setProfile(null);
    setSourceImages(null);

    if (selected.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    try {
      const base64 = await fileToBase64(selected);

      if (selected.type === "application/pdf") {
        const imagePages = await pdfToImageDataUrls(base64, 10);
        setSourceImages(imagePages);
        setUploadedFiles(
          imagePages.map((dataUrl) => ({
            data: dataUrl.split(",")[1],
            mimeType: "image/jpeg",
            name: selected.name
          }))
        );
      } else if (selected.type.startsWith("image/")) {
        const fullUrl = `data:${selected.type};base64,${base64}`;
        setSourceImages([fullUrl]);
        setUploadedFiles([{ data: base64, mimeType: selected.type, name: selected.name }]);
      } else {
        setError("Unsupported file type. Upload a PDF, JPG, or PNG file.");
      }

      setRawResume("");
    } catch {
      setError("Could not process the selected file.");
    }
  };

  const onBuild = async () => {
    if (!canBuild) {
      setError("Upload a resume file or paste resume text first.");
      return;
    }

    if (!uploadedFiles && rawResume.trim().length < 50) {
      setError("Pasted text is too short to be treated as a resume.");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const input = uploadedFiles ? uploadedFiles : rawResume;
      const output = await transformResume(input);
      setProfile(output);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Conversion failed. Try again.";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDownloadPdf = async () => {
    if (!profile) return;
    setError(null);
    setIsExporting("pdf");
    try {
      await exportProfileToPdfFromView("profile-card", profile.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to export PDF.";
      setError(message);
    } finally {
      setIsExporting(null);
    }
  };

  const onDownloadWord = async () => {
    if (!profile) return;
    setError(null);
    setIsExporting("word");
    try {
      await exportProfileToWordFromView("profile-card", profile.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to export Word file.";
      setError(message);
    } finally {
      setIsExporting(null);
    }
  };

  const clearFile = () => {
    setUploadedFiles(null);
    setSourceImages(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="app-shell">
      <div className="background-orb orb-a" />
      <div className="background-orb orb-b" />

      <aside className="sidebar no-print">
        <div className="brand-block">
          <p className="eyebrow">Client Demo Tool</p>
          <h1>Resume Architect Studio</h1>
          <p className="tagline">Transform unstructured resumes into polished consultant profiles in seconds.</p>
          <div className="meta-pills">
            <span>AI Extraction</span>
            <span>PDF Download</span>
            <span>Word Download</span>
          </div>
        </div>

        <div className="card elevated">
          <h2>Input Resume</h2>
          <p className="helper">Upload PDF/JPG/PNG or paste text below.</p>

          <button type="button" onClick={() => fileInputRef.current?.click()} className="button button-upload">
            Upload PDF / Image
          </button>

          <input ref={fileInputRef} type="file" accept=".pdf,image/*" onChange={onSelectFile} hidden />

          {uploadedFiles ? (
            <div className="inline-row">
              <span>{uploadedFiles[0].name}</span>
              <button className="link-button" onClick={clearFile} type="button">
                Remove
              </button>
            </div>
          ) : null}

          <label htmlFor="raw-resume">Raw resume text</label>
          <textarea
            id="raw-resume"
            value={rawResume}
            onChange={(e) => setRawResume(e.target.value)}
            rows={11}
            placeholder="Paste full resume text here for text-only conversion"
          />

          {error ? <div className="error-box">{error}</div> : null}

          <button className="button button-primary" onClick={onBuild} disabled={!canBuild || isProcessing} type="button">
            {isProcessing ? "Building profile..." : "Build Profile"}
          </button>
        </div>

        {profile ? (
          <div className="card actions elevated">
            <button className="button button-secondary" type="button" onClick={() => setIsThemeStudioOpen(true)} disabled={Boolean(isExporting)}>
              Open Theme Studio
            </button>
            <button className="button button-secondary" type="button" onClick={onDownloadPdf} disabled={Boolean(isExporting)}>
              {isExporting === "pdf" ? "Preparing PDF..." : "Download PDF"}
            </button>
            <button className="button button-secondary" type="button" onClick={onDownloadWord} disabled={Boolean(isExporting)}>
              {isExporting === "word" ? "Preparing Word..." : "Download Word"}
            </button>
            <button className="button button-secondary" type="button" onClick={() => window.print()} disabled={Boolean(isExporting)}>
              Print Profile
            </button>
          </div>
        ) : null}
      </aside>

      <main className="main-panel">
        {profile ? (
          <div className="profile-theme-scope" style={profileThemeStyle}>
            <ProfileCard profile={profile} sourceImages={sourceImages} />
          </div>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">Preview</p>
            <h2>Profile canvas is ready</h2>
            <p>Upload a resume and click Build Profile to generate the consultant-ready layout.</p>
          </div>
        )}
      </main>

      <ThemeStudioPanel
        isOpen={isThemeStudioOpen}
        theme={theme}
        onChange={setTheme}
        onClose={() => setIsThemeStudioOpen(false)}
      />
    </div>
  );
};

export default App;
