
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

  // Načtení historie a zpracování sdíleného odkazu při startu
  useEffect(() => {
    const savedHistory = localStorage.getItem('trip_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Zpracování sdíleného odkazu z URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(sharedData)));
        setPlan({
          content: decoded.content,
          groundingLinks: decoded.links || [],
          id: 'shared-' + Date.now(),
          createdAt: Date.now()
        });
        // Odstranění parametru z URL bez reloadu
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Chyba při dekódování sdíleného plánu", e);
      }
    }

    // Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => console.log('Geolocation denied')
      );
    }
  }, []);

  const handlePlanSubmit = async (data: TripPlanRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTripPlan(data, userLocation);
      setPlan(result);
      
      // Uložení do historie
      const newHistory = [result, ...history].slice(0, 10); // Posledních 10 cest
      setHistory(newHistory);
      localStorage.setItem('trip_history', JSON.stringify(newHistory));

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Chyba při generování.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('trip_history', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow">
        <div className="relative bg-slate-900 py-16 sm:py-24">
          <img
            src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop"
            alt="Roadtrip background"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">Plánovač Roadtripů</h1>
            <p className="text-slate-300 text-lg max-w-2xl">Váš osobní asistent pro cesty vozem Hyundai i30. Naplánujte, uložte a sdílejte své zážitky.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Levý sloupec: Formulář a Historie */}
            <div className="lg:col-span-5 space-y-8">
              <TripForm onSubmit={handlePlanSubmit} isLoading={isLoading} />
              
              {history.length > 0 && (
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    🕒 Moje uložené cesty
                  </h3>
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                        <button 
                          onClick={() => {
                            setPlan(item);
                            document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="flex-grow text-left"
                        >
                          <p className="font-semibold text-slate-700 truncate">
                            {item.request?.destination || 'Sdílená cesta'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(item.createdAt || 0).toLocaleDateString('cs-CZ')} • {item.request?.days || '?'} dní
                          </p>
                        </button>
                        <button 
                          onClick={() => deleteFromHistory(item.id!)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pravý sloupec: Výsledky */}
            <div id="results" className="lg:col-span-7 min-h-[500px]">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl mb-6 flex gap-4 items-center">
                  <div className="bg-red-100 p-2 rounded-full">⚠️</div>
                  <div>
                    <p className="font-bold">Něco se nepovedlo</p>
                    <p className="text-sm opacity-90">{error}</p>
                  </div>
                </div>
              )}

              {plan ? (
                <Itinerary plan={plan} />
              ) : !isLoading && (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 backdrop-blur-sm">
                  <div className="text-6xl mb-4">🚗</div>
                  <h3 className="text-xl font-bold text-slate-700">Kam vyrazíme?</h3>
                  <p className="text-slate-500 max-w-xs mt-2 text-sm">
                    Vyplňte cíl cesty a AI připraví itinerář, který si můžete uložit i do mobilu.
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="flex flex-col items-center justify-center p-12 space-y-6">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-700">Generujeme vaši cestu...</p>
                    <p className="text-sm text-slate-400">Hledáme nejlepší hrady, restaurace a trasy pro vaši i30.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs sm:text-sm">
            Roadtrip Master CZ • Hyundai i30 Fastback Edition • Data jsou ukládána lokálně ve vašem prohlížeči.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
