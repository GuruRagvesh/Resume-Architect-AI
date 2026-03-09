import { GoogleGenAI, Part, Type } from "@google/genai";
import { ConsultantProfile, UploadedAsset } from "./types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const profileSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
    languages: { type: Type.ARRAY, items: { type: Type.STRING } },
    expertise: { type: Type.ARRAY, items: { type: Type.STRING } },
    skills: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.ARRAY, items: { type: Type.STRING } },
        secondary: { type: Type.ARRAY, items: { type: Type.STRING } },
        tools: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["primary", "secondary", "tools"]
    },
    experience: { type: Type.ARRAY, items: { type: Type.STRING } },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          client: { type: Type.STRING },
          domain: { type: Type.STRING },
          duration: { type: Type.STRING },
          role: { type: Type.STRING },
          impact: { type: Type.STRING },
          stack: { type: Type.STRING }
        },
        required: ["client", "domain", "duration", "role", "impact", "stack"]
      }
    },
    awards: { type: Type.ARRAY, items: { type: Type.STRING } },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          institution: { type: Type.STRING },
          year: { type: Type.STRING }
        },
        required: ["degree", "institution", "year"]
      }
    },
    customSections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["title", "content"]
      }
    },
    photoBox: { type: Type.ARRAY, items: { type: Type.NUMBER } },
    photoPageIndex: { type: Type.INTEGER },
    badgeBoxes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          box2d: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          pageIndex: { type: Type.INTEGER }
        },
        required: ["label", "box2d", "pageIndex"]
      }
    }
  },
  required: [
    "name",
    "title",
    "summary",
    "certifications",
    "languages",
    "expertise",
    "skills",
    "experience",
    "projects",
    "awards",
    "education",
    "customSections"
  ]
};

export async function transformResume(input: string | UploadedAsset[]): Promise<ConsultantProfile> {
  if (!apiKey) {
    throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY in .env.local.");
  }

  const parts: Part[] = [];

  if (typeof input === "string") {
    parts.push({
      text: `Convert this resume text into structured consultant profile JSON. Preserve all important professional details. Exclude phone number, rates, and commercial terms. Resume text:\n${input}`
    });
  } else {
    input.forEach((asset) => {
      parts.push({ inlineData: { data: asset.data, mimeType: asset.mimeType } });
    });
    parts.push({
      text: "Extract complete consultant profile details from these resume pages. Detect profile photo and certification badges if visible. Exclude phone number, rates, and commercial terms."
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ parts }],
    config: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: profileSchema,
      systemInstruction:
        "You are a resume-to-profile conversion engine. Return only valid JSON matching schema. Preserve facts and chronology."
    }
  });

  const output = response.text;
  if (!output) {
    throw new Error("Model returned an empty response.");
  }

  return JSON.parse(output) as ConsultantProfile;
}
