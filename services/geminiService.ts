import { GoogleGenAI, Type } from "@google/genai";
import { StudentAnswers } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        value: {
            type: Type.STRING,
            description: `The detected answer. Can be "A", "B", "C", "D", "E", "N/A" (no answer), or "MULTIPLE" (multiple answers).`
        },
        coordinates: {
            type: Type.OBJECT,
            properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            },
            nullable: true,
            description: "The (x, y) coordinates of the center of the shaded bubble, relative to the top-left of the image. Null if no bubble is detected (e.g., for N/A or MULTIPLE)."
        }
    },
    required: ["value", "coordinates"]
};


const responseSchema = {
    type: Type.OBJECT,
    properties: {},
    required: [] as string[]
};

for (let i = 1; i <= 60; i++) {
    const key = i.toString();
    responseSchema.properties[key] = questionSchema;
    responseSchema.required.push(key);
}


export const gradeSheet = async (base64ImageData: string): Promise<StudentAnswers> => {
    const prompt = `
You are an expert AI assistant specializing in advanced optical mark recognition (OMR) for document scanning. Your task is to analyze an image, precisely locate a specific answer sheet within it, and extract the student's answers along with their exact locations.

**Answer Sheet Specifications:**
- Layout: 60 questions in total, arranged in a grid.
- Grid: 15 rows and 24 columns.
- Shading: Students use a pencil to shade circular bubbles. A bubble is "shaded" if it is at least 60% filled.

**Your Instructions:**
1.  **Detect and Isolate the Answer Sheet:** Like a document scanner, your first priority is to find the four corners of the answer sheet in the image. The sheet might be rotated, skewed, or have background elements. Perform a perspective transform to "crop" the sheet virtually. All subsequent analysis must be performed on this isolated sheet area.
2.  **Analyze the Grid and Map Coordinates:** On the isolated sheet, analyze the grid of bubbles. For each question from 1 to 60, identify which option (A, B, C, D, or E) is shaded.
3.  **Determine Coordinates:** CRITICAL: For each answer you identify, you must provide the precise (x, y) pixel coordinates of the center of the shaded bubble. These coordinates MUST be relative to the top-left corner of the ORIGINAL, full-sized input image.
4.  **Handle Ambiguity:**
    - If a question has **no** bubble shaded, the answer value is "N/A" and its coordinates should be null.
    - If a question has **multiple** bubbles shaded, the answer value is "MULTIPLE" and its coordinates should be null.
5.  **Format Output:** Return your findings strictly as a JSON object matching the provided schema. Each key must be a question number (e.g., "1"), and its value must be an object containing the answer 'value' and the 'coordinates' object.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64ImageData } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText) as StudentAnswers;
        return parsedJson;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to process the answer sheet with AI.");
    }
};