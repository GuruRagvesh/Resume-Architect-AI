# Resume Conversion AI Demo (Public)

This is a clean, public-facing demo project you can publish on GitHub without exposing your internal codebase.

## What it does

- Upload resume as PDF/JPG/PNG or paste raw text
- Convert PDF pages into images for visual extraction
- Send content to Gemini and receive structured consultant profile JSON
- Render a polished consultant profile preview
- Export profile to `.docx`
- Print profile

## Stack

- React + TypeScript + Vite
- Google Gemini (`@google/genai`)
- `pdfjs-dist` for PDF page rendering
- `docx` for Word export

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` from `.env.local.example` and set:
   ```bash
   VITE_GEMINI_API_KEY=your_key
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

## Publish to GitHub

```bash
git init
git add .
git commit -m "Initial public demo"
git branch -M main
git remote add origin <your_repo_url>
git push -u origin main
```

## Notes

- Keep `.env.local` private and never commit API keys.
- This repo is designed as a demo template and can be branded for your client.
