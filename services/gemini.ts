
import { GoogleGenAI } from "@google/genai";
import { TripPlanRequest, TripPlanResponse } from "../types";

export const generateTripPlan = async (
  request: TripPlanRequest,
  userLocation?: { latitude: number; longitude: number }
): Promise<TripPlanResponse> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY není definován v prostředí (process.env.API_KEY). Ujistěte se, že jste jej nastavili v ovládacím panelu Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
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
    
    Použij české názvy míst a buď konkrétní. Odpověď formátuj v přehledném Markdownu.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    if (!response.text) {
      throw new Error("Model vrátil prázdnou odpověď. Zkontrolujte nastavení bezpečnosti nebo kvóty.");
    }

    return {
      content: response.text,
      groundingLinks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error: any) {
    console.error("Detailní chyba Gemini API:", error);
    // Extrahuje srozumitelnou zprávu pro uživatele
    const message = error.message || "Neznámá chyba při komunikaci s AI.";
    throw new Error(message);
  }
};
