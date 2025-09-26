
import { GoogleGenAI, Type } from "@google/genai";
import type { DevelopmentPlan } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    projectName: { type: Type.STRING },
    projectDescription: { type: Type.STRING },
    developmentPhases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phaseName: { type: Type.STRING },
          description: { type: Type.STRING },
          modules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                moduleName: { type: Type.STRING },
                features: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      feature: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['feature', 'description'],
                  },
                },
                ui_ux_notes: { type: Type.STRING },
              },
              required: ['moduleName', 'features', 'ui_ux_notes'],
            },
          },
        },
        required: ['phaseName', 'description', 'modules'],
      },
    },
  },
  required: ['projectName', 'projectDescription', 'developmentPhases'],
};

export async function generateHrPlan(userInput: string): Promise<DevelopmentPlan> {
  const systemInstruction = `Eres un arquitecto de sistemas de RRHH de clase mundial y un director de proyectos tecnológicos. Tu tarea es tomar la visión de un usuario y convertirla en un plan de desarrollo estructural detallado y por fases para un sistema de RRHH moderno. Debes producir exclusivamente una respuesta en formato JSON que se ajuste al esquema proporcionado. El plan debe ser completo, profesional y seguir las mejores prácticas de la industria.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userInput,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedPlan: DevelopmentPlan = JSON.parse(jsonText);
    return parsedPlan;
  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    throw new Error("Failed to generate development plan.");
  }
}
