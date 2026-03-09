import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from "docx";
import { ConsultantProfile } from "./types";

export async function exportProfileToWord(profile: ConsultantProfile): Promise<void> {
  const sectionHeader = (text: string) =>
    new Paragraph({
      children: [new TextRun({ text, bold: true, size: 24, color: "0F172A" })],
      border: { bottom: { style: BorderStyle.SINGLE, color: "CBD5E1", size: 4 } },
      spacing: { before: 280, after: 120 }
    });

  const list = (items: string[]) =>
    items.map(
      (item) =>
        new Paragraph({
          text: `- ${item}`,
          spacing: { before: 80 }
        })
    );

  const projectRows = profile.projects.map(
    (project) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(project.client)] }),
          new TableCell({ children: [new Paragraph(project.domain)] }),
          new TableCell({ children: [new Paragraph(project.role)] }),
          new TableCell({ children: [new Paragraph(project.duration)] })
        ]
      })
  );

  const document = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Consultant Profile", bold: true, size: 36, color: "1D4ED8" })],
            spacing: { after: 220 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: profile.name, bold: true, size: 30 }),
              new TextRun({ text: `\n${profile.title}`, size: 24, color: "334155" })
            ]
          }),
          sectionHeader("Professional Summary"),
          new Paragraph(profile.summary),

          sectionHeader("Core Expertise"),
          ...list(profile.expertise),

          sectionHeader("Technical Skills"),
          new Paragraph(`Primary: ${profile.skills.primary.join(", ")}`),
          new Paragraph(`Secondary: ${profile.skills.secondary.join(", ")}`),
          new Paragraph(`Tools: ${profile.skills.tools.join(", ")}`),

          sectionHeader("Professional Experience"),
          ...list(profile.experience),

          sectionHeader("Key Projects"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: ["Client", "Domain", "Role", "Duration"].map(
                  (h) =>
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })]
                    })
                )
              }),
              ...projectRows
            ]
          }),

          sectionHeader("Certifications"),
          ...list(profile.certifications),

          sectionHeader("Languages"),
          ...list(profile.languages),

          ...(profile.awards.length
            ? [sectionHeader("Awards"), ...list(profile.awards)]
            : []),

          sectionHeader("Education"),
          ...profile.education.map(
            (item) => new Paragraph(`${item.degree} | ${item.institution} (${item.year})`)
          ),

          ...profile.customSections.flatMap((section) => [
            sectionHeader(section.title),
            new Paragraph(section.content)
          ])
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(document);
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = `consultant-profile-${profile.name.replace(/\s+/g, "-").toLowerCase()}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
