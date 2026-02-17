
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TripForm from './components/TripForm';
import Itinerary from './components/Itinerary';
import { TripPlanRequest, TripPlanResponse } from './types';
import { generateTripPlan } from './services/gemini';

const App: React.FC = () => {
  const [plan, setPlan] = useState<TripPlanResponse | null>(null);
  const [history, setHistory] = useState<TripPlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();

  useEffect(() => {
    // 1. Načtení historie
    const saved = localStorage.getItem('rt_history');
    if (saved) setHistory(JSON.parse(saved));

    // 2. Zpracování sdíleného odkazu (např. z mobilu)
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('plan');
    if (shared) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(shared)));
        setPlan(decoded);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        console.error("Chyba při načítání sdíleného plánu");
      }
    }

    // 3. Lokalita pro lepší Mapy grounding
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        () => console.log("Lokalita nepovolena")
      );
    }
  }, []);

  const handleSubmit = async (data: TripPlanRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTripPlan(data, userLocation);
      setPlan(result);
      
      const newHistory = [result, ...history].slice(0, 15);
      setHistory(newHistory);
      localStorage.setItem('rt_history', JSON.stringify(newHistory));
      
      document.getElementById('itinerary-view')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Opravdu chcete smazat celou historii cest?")) {
      setHistory([]);
      localStorage.removeItem('rt_history');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Levý panel: Nastavení a Historie */}
          <div className="lg:col-span-4 space-y-6">
            <TripForm onSubmit={handleSubmit} isLoading={isLoading} />
            
            {history.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                    📂 Moje garáž
                  </h3>
                  <button onClick={clearHistory} className="text-xs text-red-500 hover:underline">Smazat vše</button>
                </div>
                <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setPlan(item)}
                      className={`w-full text-left p-4 hover:bg-indigo-50 transition-colors group ${plan?.id === item.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-800 truncate block pr-2">
                          {item.request?.destination || "Sdílená cesta"}
                        </span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                          {item.request?.days} dny
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block italic">
                        {new Date(item.createdAt || 0).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pravý panel: Výsledek */}
          <div className="lg:col-span-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                <h4 className="text-red-800 font-bold mb-1">Chyba při komunikaci</h4>
                <p className="text-red-600 text-sm leading-relaxed">{error}</p>
                <p className="text-xs text-red-400 mt-4 italic">
                  Tip: Pokud jste na Vercelu, ujistěte se, že jste po přidání API_KEY v Settings provedli nový "Redeploy".
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-800">Startujeme Hyundai i30...</h3>
                <p className="text-slate-500 mt-2">AI právě mapuje hrady, zámky a nejlepší trasy.</p>
              </div>
            ) : plan ? (
              <div id="itinerary-view">
                <Itinerary plan={plan} />
              </div>
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                <div className="text-6xl mb-4 opacity-20">🗺️</div>
                <h3 className="text-xl font-bold text-slate-400 italic">Zatím žádný plán k zobrazení</h3>
                <p className="text-slate-400 max-w-xs mt-2 text-sm">Zadejte detaily vlevo a naplánujeme vaši příští jízdu.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs">
          Roadtrip Master CZ • Hyundai i30 Edition • Data uložena lokálně • AI Gemini 3 Flash
        </div>
      </footer>
    </div>
  );
};

export default App;
