import { GoogleGenAI, Type } from "@google/genai";
import { StudentAnswers } from '../types';

const API_KEY = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {},
    required: [] as string[],
};

for (let i = 1; i <= 60; i++) {
    (responseSchema.properties as any)[i.toString()] = {
        type: Type.STRING,
        description: `The selected answer for question ${i}. Should be 'A', 'B', 'C', 'D', 'E', or null if unanswered.`,
        nullable: true,
    };
    responseSchema.required.push(i.toString());
}


export const scanAnswerSheet = async (imageBase64: string): Promise<StudentAnswers> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: imageBase64,
    },
  };

  const textPart = {
    text: `Analyze the provided image of a 60-question multiple-choice answer sheet. Here is a detailed specification of the sheet layout:
    - Physical Size: 152mm width x 154mm length.
    - Answer Grid Position: The main answer area starts 43mm from the top edge and 3mm from the left edge.
    - Grid Structure: 24 columns and 15 rows.
    - Cell Dimensions: Cell height is approximately 6mm.
    - Column Widths: The columns for question numbers (1st, 7th, 13th, 19th) are 7mm wide. The columns for answer options (A-E) are 6mm wide.
    - Question Numbering Layout:
        - Questions 1-15 are in the first block (columns 1-6).
        - Questions 16-30 are in the second block (columns 7-12).
        - Questions 31-45 are in the third block (columns 13-18).
        - Questions 46-60 are in the fourth block (columns 19-24).
    
    Task:
    Use these precise physical dimensions as a primary guide to locate the answer grid and correctly map each cell. For each question from 1 to 60, identify which option (A, B, C, D, or E) is shaded.
    
    Shading Detection Rules:
    - Focus on relative darkness. Identify the darkest cell within each question's row of options (A-E), rather than relying on an absolute darkness threshold. This is critical to compensate for variations in photo lighting (over/under exposure) and shadows.
    - Prioritize dark spots. A cell is considered "shaded" if it contains a concentrated dark area (a "dark spot"), which represents the student's pencil mark. The entire cell does not need to be uniformly filled.
    - Lenient Threshold: Consider a cell shaded if it's the most clearly marked in its row and appears to be at least 50% filled with a dark spot.
    - Ignore smudges and light marks. Differentiate between intentional, dark pencil marks and accidental smudges or very light pencil strokes.
    
    Output:
    Return a single JSON object where keys are the question numbers (as strings from "1" to "60") and values are the corresponding letter of the shaded option ('A', 'B', 'C', 'D', 'E'). If no option is shaded for a question, the value must be null.`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    const parsedJson = JSON.parse(text);

    // Validate and normalize the response
    const validatedAnswers: StudentAnswers = {};
    for (let i = 1; i <= 60; i++) {
        const key = i.toString();
        const answer = parsedJson[key];
        if (['A', 'B', 'C', 'D', 'E'].includes(answer)) {
            validatedAnswers[i] = answer;
        } else {
            validatedAnswers[i] = null;
        }
    }
    return validatedAnswers;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to parse answer sheet. The AI model returned an error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI model.");
  }
};