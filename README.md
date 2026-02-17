
# 🚗 Roadtrip Master CZ

Chytrý plánovač roadtripů s podporou AI (Google Gemini).

## 🚀 Jak vyřešit problém s API klíčem na Vercelu

Pokud aplikace po nasazení hlásí, že `API_KEY` není definován, i když jste jej v nastavení Vercelu přidali:

1. **Static vs. Build:** Tato aplikace je čistě klientská. Pokud ji Vercel nasadí jako statický web bez build kroku, proměnné se do prohlížeče nedostanou.
2. **Řešení:** 
   - Použijte framework jako **Vite** (pak v kódu přistupujte přes `import.meta.env.VITE_API_KEY`).
   - Nebo na Vercelu v sekci **Settings -> Build & Development Settings** nastavte build příkaz, který proměnné nahradí v kódu.
   - Po každé změně v 'Environment Variables' musíte provést **Redeploy**.

## ✨ Technologie
- Google Gemini 3 Flash
- React 19
- Tailwind CSS
