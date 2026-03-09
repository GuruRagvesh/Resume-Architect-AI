import { Document, ImageRun, Packer, Paragraph } from "docx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function sanitizeFileName(input: string): string {
  return input.replace(/[^a-z0-9-\s_]/gi, "").trim().replace(/\s+/g, "-").toLowerCase() || "consultant-profile";
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
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFileName(profileName)}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
