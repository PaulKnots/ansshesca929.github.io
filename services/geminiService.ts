
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
    text: `Analyze the provided image of a 60-question multiple-choice answer sheet.
    The sheet is structured in 4 blocks of 15 questions. Each question has 5 options (labeled ก/A, ข/B, ค/C, ง/D, จ/E).
    For each question from 1 to 60, identify which option is shaded. A cell is shaded if it's significantly darker than empty cells.
    Return the results as a JSON object where keys are question numbers (1-60) and values are the chosen letter ('A', 'B', 'C', 'D', 'E'). If no option is shaded, the value should be null.`
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
