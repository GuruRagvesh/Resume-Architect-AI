import {
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from "docx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ConsultantProfile } from "./types";
import { ResumeTheme } from "./themeStudio/themeTypes";

function sanitizeFileName(input: string): string {
  return input.replace(/[^a-z0-9-\s_]/gi, "").trim().replace(/\s+/g, "-").toLowerCase() || "consultant-profile";
}

function colorHex(input: string): string {
  return input.replace("#", "");
}

async function captureElement(elementId: string): Promise<HTMLCanvasElement> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Profile preview not found.");
  }

  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function splitCanvas(canvas: HTMLCanvasElement, sliceHeight: number): HTMLCanvasElement[] {
  const pages: HTMLCanvasElement[] = [];
  let offsetY = 0;

  while (offsetY < canvas.height) {
    const remaining = canvas.height - offsetY;
    const currentHeight = Math.min(sliceHeight, remaining);
    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = currentHeight;
    const ctx = temp.getContext("2d");
    if (!ctx) break;

    ctx.drawImage(canvas, 0, offsetY, canvas.width, currentHeight, 0, 0, canvas.width, currentHeight);
    pages.push(temp);
    offsetY += currentHeight;
  }

  return pages;
}

function heading(text: string, theme: ResumeTheme): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text,
        bold: true,
        color: colorHex(theme.primaryColor),
        size: 28
      })
    ],
    spacing: { before: 260, after: 120 }
  });
}

function bulletList(items: string[], baseSize: number): Paragraph[] {
  return items.map(
    (item) =>
      new Paragraph({
        children: [new TextRun({ text: item, size: baseSize })],
        bullet: { level: 0 },
        spacing: { after: 80 }
      })
  );
}

export async function exportProfileToEditableWord(profile: ConsultantProfile, theme: ResumeTheme): Promise<void> {
  const baseSize = Math.max(20, Math.round(theme.baseFontSize * 2));

  const projectTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: ["Client", "Domain", "Duration", "Role", "Stack"].map(
          (label) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: label, bold: true, size: baseSize })]
                })
              ]
            })
        )
      }),
      ...profile.projects.map(
        (project) =>
          new TableRow({
            children: [project.client, project.domain, project.duration, project.role, project.stack].map(
              (value) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: value, size: baseSize })] })]
                })
            )
          })
      )
    ]
  });

  const projectImpactParagraphs = profile.projects.flatMap((project) => [
    new Paragraph({
      children: [new TextRun({ text: `${project.client} Impact`, bold: true, size: baseSize })],
      spacing: { before: 140, after: 50 }
    }),
    new Paragraph({
      children: [new TextRun({ text: project.impact, size: baseSize })],
      spacing: { after: 100 }
    })
  ]);

  const customSections = profile.customSections.flatMap((section) => {
    const lines = section.content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const paragraphs = lines.map((line) => {
      const isBullet = line.startsWith("-") || line.startsWith("*");
      const text = isBullet ? line.substring(1).trim() : line;
      return isBullet
        ? new Paragraph({ children: [new TextRun({ text, size: baseSize })], bullet: { level: 0 }, spacing: { after: 80 } })
        : new Paragraph({ children: [new TextRun({ text, size: baseSize })], spacing: { after: 80 } });
    });

    return [heading(section.title, theme), ...paragraphs];
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [new TextRun({ text: profile.name, bold: true, color: colorHex(theme.primaryColor), size: 44 })],
            spacing: { after: 80 }
          }),
          new Paragraph({
            children: [new TextRun({ text: profile.title, size: baseSize + 2, color: colorHex(theme.mutedColor) })],
            spacing: { after: 180 }
          }),

          heading("Professional Summary", theme),
          new Paragraph({ children: [new TextRun({ text: profile.summary, size: baseSize })] }),

          heading("Core Expertise", theme),
          ...bulletList(profile.expertise, baseSize),

          heading("Technical Skills", theme),
          new Paragraph({ children: [new TextRun({ text: `Primary: ${profile.skills.primary.join(", ")}`, size: baseSize })], spacing: { after: 70 } }),
          new Paragraph({ children: [new TextRun({ text: `Secondary: ${profile.skills.secondary.join(", ")}`, size: baseSize })], spacing: { after: 70 } }),
          new Paragraph({ children: [new TextRun({ text: `Tools: ${profile.skills.tools.join(", ")}`, size: baseSize })] }),

          heading("Professional Experience", theme),
          ...bulletList(profile.experience, baseSize),

          heading("Key Projects", theme),
          projectTable,
          ...projectImpactParagraphs,

          heading("Certifications", theme),
          ...bulletList(profile.certifications, baseSize),

          heading("Languages", theme),
          ...bulletList(profile.languages, baseSize),

          ...(profile.awards.length > 0 ? [heading("Awards", theme), ...bulletList(profile.awards, baseSize)] : []),

          heading("Education", theme),
          ...profile.education.map(
            (edu) =>
              new Paragraph({
                children: [new TextRun({ text: `${edu.degree} | ${edu.institution} (${edu.year})`, size: baseSize })],
                spacing: { after: 80 }
              })
          ),

          ...customSections
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFileName(profile.name)}-editable.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportProfileToPdfFromView(elementId: string, profileName: string): Promise<void> {
  const canvas = await captureElement(elementId);
  const image = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const renderWidth = pageWidth - margin * 2;
  const renderHeight = (canvas.height * renderWidth) / canvas.width;

  let yOffset = 0;
  pdf.addImage(image, "PNG", margin, margin + yOffset, renderWidth, renderHeight);

  while (margin + yOffset + renderHeight > pageHeight) {
    yOffset -= pageHeight - margin * 2;
    pdf.addPage();
    pdf.addImage(image, "PNG", margin, margin + yOffset, renderWidth, renderHeight);
  }

  pdf.save(`${sanitizeFileName(profileName)}.pdf`);
}

export async function exportProfileToWordFromView(elementId: string, profileName: string): Promise<void> {
  const canvas = await captureElement(elementId);
  const maxPagePixelHeight = Math.floor(canvas.width * 1.35);
  const pageCanvases = splitCanvas(canvas, maxPagePixelHeight);

  const children = pageCanvases.map((slice) => {
    const dataUrl = slice.toDataURL("image/png");
    const bytes = dataUrlToBytes(dataUrl);
    const width = 560;
    const height = Math.round((slice.height / slice.width) * width);

    return new Paragraph({
      children: [
        new ImageRun({
          data: bytes,
          type: "png",
          transformation: { width, height }
        })
      ],
      spacing: { after: 120 }
    });
  });

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFileName(profileName)}-snapshot.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

