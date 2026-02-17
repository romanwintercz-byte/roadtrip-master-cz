
import { GoogleGenAI } from "@google/genai";
import { TripPlanRequest, TripPlanResponse } from "../types";

export const generateTripPlan = async (
  request: TripPlanRequest,
  userLocation?: { latitude: number; longitude: number }
): Promise<TripPlanResponse> => {
  // Inicializace přesně podle instrukcí - SDK si samo poradí s injekcí klíče v podporovaných prostředích
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Jsi expert na roadtripy a automobily. Navrhni detailní plán dovolené.
    Cíl: ${request.destination}
    Délka: ${request.days} dní
    Styl: ${request.style}
    Cestovatelé: ${request.travelers}
    Zájmy: ${request.interests.join(", ")}
    Vozidlo: Hyundai i30 Fastback 1.5 T-GDi mild-hybrid (MHEV), reálná spotřeba cca 6.2l/100km.
    
    STRUKTURA ODPOVĚDI (používej Markdown a emoji):
    1. Úvodní slovo o trase.
    2. Itinerář den po dni (Dopoledne: památky/hrady, Oběd, Odpoledne: turistika/města, Večer: ubytování).
    3. Tabulka "Logistika trasy": Sloupce: Den, Trasa, Km, Čas, Odhadovaná spotřeba (litry).
    4. Tipy pro řidiče (kde tankovat, parkování u památek).
    
    Odpovídej v češtině, buď konkrétní a doporučuj reálná místa.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: userLocation ? {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude
            } : undefined
          }
        }
      },
    });

    if (!response.text) throw new Error("AI nevrátila žádný obsah.");

    return {
      content: response.text,
      groundingLinks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
      id: Math.random().toString(36).substring(2, 11),
      createdAt: Date.now(),
      request
    };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Pokud je chyba v API klíči, platforma obvykle vrací 403 nebo 401
    throw new Error(error.message || "Chyba při generování itineráře. Ověřte nastavení API_KEY na Vercelu.");
  }
};
