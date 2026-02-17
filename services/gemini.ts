
import { GoogleGenAI } from "@google/genai";
import { TripPlanRequest, TripPlanResponse } from "../types";

export const generateTripPlan = async (
  request: TripPlanRequest,
  userLocation?: { latitude: number; longitude: number }
): Promise<TripPlanResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Navrhni detailní roadtripový itinerář pro lokalitu: ${request.destination}.
    Délka: ${request.days} dní.
    Styl cesty: ${request.style}.
    Cestovatelé: ${request.travelers} (konkrétně 2 dospělé osoby naložené standardním vybavením na 14 dní v hotelu).
    Zájmy: ${request.interests.join(", ")}.
    Vozidlo: Hyundai i30 Fastback 1.5 T-GDi mild-hybrid (MHEV).
    
    Pro každý den uveď:
    1. Dopolední program (památky, hrady, zajímavá místa).
    2. Doporučení na oběd (restaurace v dané lokalitě).
    3. Odpolední program (pěší výlety, příroda nebo kultura).
    4. Tip na ubytování a večeři.
    
    NA KONEC ODPOVĚDI PŘIDEJ PŘEHLEDNOU TABULKU s názvem "Logistika a spotřeba":
    Sloupce: Den, Trasa, Vzdálenost (km), Čas za volantem, Odhadovaná spotřeba (l/100km).
    Vezmi v úvahu, že Hyundai i30 1.5 T-GDi MHEV má reálnou kombinovanou spotřebu kolem 5.8-6.5 l/100km při tomto zatížení, ale v horách nebo městě to bude více.
    
    Použij české názvy míst a buď konkrétní. Uveď i přibližné časy přesunů autem.
    Odpověď formátuj v přehledném Markdownu s nadpisy pro jednotlivé dny. Tabulka musí být ve standardním Markdown formátu.`;

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

    return {
      content: response.text || "Omlouváme se, plán se nepodařilo vygenerovat.",
      groundingLinks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
