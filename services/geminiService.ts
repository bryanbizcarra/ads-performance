
import { GoogleGenAI, Type } from "@google/genai";
import { Campaign, DashboardStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extrae datos estructurados de un PDF de Google Ads
 */
export const extractCampaignsFromPDF = async (base64Data: string): Promise<Campaign[]> => {
  const prompt = `
    Analiza este informe de Google Ads en PDF y extrae los datos EXACTOS de las tablas.
    
    INSTRUCCIONES CRÍTICAS:
    1. NO REDONDEES NINGÚN VALOR. Si el costo es 77625.43, extrae 77625.43.
    2. Identifica cada campaña individual.
    3. Extrae:
       - "name": Nombre exacto de la campaña.
       - "spend": El valor de la columna "Costo".
       - "results": El valor de la columna "Conversiones" (si no hay, usa "Interacciones").
       - "costPerResult": El valor de "Costo/conv.".
       - "reach": El valor de "Impresiones".
    4. IGNORA las filas que digan "Total", "Cuenta" o resúmenes. Solo queremos las filas de campañas individuales.
    5. Los números deben ser devueltos como tipos numéricos puros en el JSON, sin símbolos de moneda.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data
          }
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              spend: { type: Type.NUMBER },
              results: { type: Type.NUMBER },
              costPerResult: { type: Type.NUMBER },
              reach: { type: Type.NUMBER }
            },
            required: ["name", "spend", "results", "reach"]
          }
        }
      }
    });

    const data = JSON.parse(response.text);
    return data.map((item: any, idx: number) => ({
      ...item,
      id: `g-${idx}`,
      status: 'Active',
      // Recalcular para asegurar precisión si el campo venía vacío
      costPerResult: item.costPerResult || (item.results > 0 ? item.spend / item.results : 0),
      impressions: item.reach
    }));
  } catch (error) {
    console.error("Error extraiendo datos del PDF:", error);
    throw new Error("No se pudo procesar el PDF de Google Ads correctamente.");
  }
};

export const generateExecutiveSummary = async (stats: DashboardStats, campaigns: Campaign[]) => {
  const platformName = stats.platform === 'google' ? 'Google Ads' : 'Meta Ads';
  const metricName = stats.platform === 'google' ? 'Conversiones' : 'Resultados';

  const prompt = `
    Como analista experto en Marketing Digital y ${platformName}, genera un resumen ejecutivo profesional y accionable basado en estos datos de rendimiento REALES.
    
    ESTADÍSTICAS DEL PERIODO:
    - Inversión Total: ${stats.totalSpend}
    - ${metricName} Totales: ${stats.totalResults}
    - Costo Promedio por Conversión: ${stats.avgCostPerResult}
    
    CAMPAÑA LÍDER: ${stats.starCampaign?.name || 'N/A'}
    CAMPAÑAS CRÍTICAS: ${stats.underperformingCampaigns.map(c => c.name).join(', ') || 'Ninguna'}
    
    Estructura tu respuesta en JSON para un dashboard profesional en español.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["overview", "strengths", "weaknesses", "recommendations"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating summary:", error);
    return null;
  }
};
