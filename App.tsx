
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TripForm from './components/TripForm';
import Itinerary from './components/Itinerary';
import { TripPlanRequest, TripPlanResponse } from './types';
import { generateTripPlan } from './services/gemini';

const App: React.FC = () => {
  const [plan, setPlan] = useState<TripPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => console.log('Geolocation permission denied')
      );
    }
  }, []);

  const handlePlanSubmit = async (data: TripPlanRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTripPlan(data, userLocation);
      setPlan(result);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Nepodařilo se vygenerovat plán. Zkontrolujte připojení a API klíč.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow">
        <div className="relative overflow-hidden bg-slate-900 py-20 sm:py-28">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
            alt="Roadtrip"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
          />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center sm:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
              Váš roadtrip, <br className="hidden sm:block" /> sestavený inteligencí.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Personalizované plány cest optimalizované pro váš Hyundai i30. 
              Stačí říct kam a na jak dlouho.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 sticky top-24">
              <TripForm onSubmit={handlePlanSubmit} isLoading={isLoading} />
              
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm animate-in fade-in duration-300">
                  <div className="flex gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-bold mb-1">Chyba při generování</p>
                      <p className="text-sm opacity-90">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div id="results" className="lg:col-span-7">
              {plan ? (
                <Itinerary plan={plan} />
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 backdrop-blur-sm">
                  <div className="bg-indigo-50 p-6 rounded-full mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Připraveni na cestu?</h3>
                  <p className="text-slate-500 max-w-sm">
                    Vyplňte parametry vlevo. AI analyzuje trasu, spotřebu vašeho vozu a vyhledá nejlepší místa k návštěvě.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Roadtrip Master CZ • Hyundai i30 Edition
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
