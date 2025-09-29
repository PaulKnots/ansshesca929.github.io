
import { GoogleGenAI, Type } from "@google/genai";
import { StudentAnswers } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {},
    required: [] as string[]
};

for (let i = 1; i <= 60; i++) {
    const key = i.toString();
    responseSchema.properties[key] = {
        type: Type.STRING,
        description: `The answer for question ${i}. Can be "A", "B", "C", "D", "E", "N/A", or "MULTIPLE".`
    };
    responseSchema.required.push(key);
}


export const gradeSheet = async (base64ImageData: string): Promise<StudentAnswers> => {
    const prompt = `
You are an expert AI assistant specializing in optical mark recognition (OMR). Your task is to analyze an image of an answer sheet and extract the student's answers.

**Answer Sheet Specifications:**
- Layout: 60 questions in total, arranged in a grid.
- Grid: 15 rows and 24 columns.
- Columns Structure:
  - Columns 1, 7, 13, 19: Question numbers (1-15, 16-30, 31-45, 46-60 respectively).
  - Columns 2-6: Options A, B, C, D, E for questions 1-15.
  - Columns 8-12: Options A, B, C, D, E for questions 16-30.
  - Columns 14-18: Options A, B, C, D, E for questions 31-45.
  - Columns 20-24: Options A, B, C, D, E for questions 46-60.
- Shading: Students use a pencil to shade circular bubbles. A bubble is considered "shaded" if it is at least 60% filled, especially in the center.

**Your Instructions:**
1.  **Isolate the Answer Sheet:** First, accurately locate the rectangular answer sheet within the provided image, even if it's rotated or skewed. Crop out everything else.
2.  **Analyze the Grid:** On the cropped image, analyze the grid of bubbles based on the specifications above.
3.  **Determine Answers:** For each question from 1 to 60, identify which option (A, B, C, D, or E) is shaded.
4.  **Handle Ambiguity:**
    - If a question has **no** bubble shaded, the answer is "N/A".
    - If a question has **multiple** bubbles shaded, the answer is "MULTIPLE".
5.  **Format Output:** Return your findings strictly as a JSON object matching the provided schema. The keys must be the question numbers as strings (from "1" to "60"), and the values must be the corresponding letter answer ("A", "B", "C", "D", "E"), "N/A", or "MULTIPLE".
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
