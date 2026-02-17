
# 🚗 Roadtrip Master CZ

Chytrý plánovač roadtripů s podporou AI (Google Gemini). Aplikace navrhuje itineráře na míru, doporučuje památky, restaurace a ubytování.

## ✨ Funkce
- **AI Plánování:** Generování itineráře na základě cíle, počtu dní a stylu cesty.
- **Logistika pro Hyundai i30:** Specifický výpočet spotřeby a času na cestě pro model i30 Fastback 1.5 T-GDi MHEV.
- **Google Grounding:** Odkazy na reálné weby a Google Mapy přímo v itineráři.
- **Geolokace:** Možnost plánovat cesty z vaší aktuální polohy.

## 🛠️ Technologie
- React 19
- Google Gemini API (@google/genai)
- Tailwind CSS
- TypeScript

## 🚀 Jak spustit
1. Naklonujte repozitář.
2. Nastavte environmentální proměnnou `API_KEY` s vaším klíčem z Google AI Studio.
3. Spusťte pomocí libovolného lokálního serveru (např. Vite nebo Live Server).

## 📝 Poznámka k nasazení
Aplikace využívá `process.env.API_KEY`. Pro správné fungování na GitHub Pages je nutné klíč bezpečně injektovat nebo využít proxy server, aby nedošlo k jeho úniku do klientského kódu.
