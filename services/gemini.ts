
import { GoogleGenAI } from "@google/genai";
import { TripPlanRequest, TripPlanResponse } from "../types";

export const generateTripPlan = async (
  request: TripPlanRequest,
  userLocation?: { latitude: number; longitude: number }
): Promise<TripPlanResponse> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY není definován. Ujistěte se, že je nastaven v environmentálních proměnných.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Navrhni detailní roadtripový itinerář pro lokalitu: ${request.destination}.
    Délka: ${request.days} dní.
    Styl cesty: ${request.style}.
    Cestovatelé: ${request.travelers}.
    Zájmy: ${request.interests.join(", ")}.
    Vozidlo: Hyundai i30 Fastback 1.5 T-GDi mild-hybrid (MHEV).
    
    Pro každý den uveď:
    1. Dopolední program (konkrétní památky, hrady s názvy).
    2. Doporučení na oběd (konkrétní restaurace nebo typ jídla v místě).
    3. Odpolední program (pěší výlety, příroda).
    4. Tip na ubytování a večeři.
    
    NA KONEC ODPOVĚDI PŘIDEJ TABULKU "Logistika a spotřeba":
    Sloupce: Den | Trasa | Vzdálenost (km) | Čas za volantem | Odhadovaná spotřeba (l/100km).
    Vezmi v úvahu specifika Hyundai i30 1.5 T-GDi.
    
    Odpověď formátuj v Markdownu s použitím emoji pro lepší čitelnost. Používej češtinu.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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

    const text = response.text;
    if (!text) throw new Error("Model nevrátil žádný obsah.");

    return {
      content: text,
      groundingLinks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      request
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Chyba při komunikaci s AI.");
  }
};
