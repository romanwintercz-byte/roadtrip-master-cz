
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
      // Scroll to result
      window.scrollTo({ top: document.getElementById('results')?.offsetTop, behavior: 'smooth' });
    } catch (err) {
      setError('Nepodařilo se vygenerovat plán. Zkuste to prosím znovu.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
          <img
            src="https://picsum.photos/1920/1080?nature"
            alt="Travel background"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40 blur-[2px]"
          />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-4">
                Vaše dobrodružství <br /> začíná tady.
              </h1>
              <p className="text-lg leading-8 text-slate-300">
                Chytrý plánovač roadtripů využívající umělou inteligenci pro ty nejlepší zážitky, 
                od skrytých vyhlídek po nejlepší lokální restaurace.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Form Column */}
            <div className="lg:col-span-5">
              <TripForm onSubmit={handlePlanSubmit} isLoading={isLoading} />
              
              {error && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            {/* Results Column */}
            <div id="results" className="lg:col-span-7">
              {plan ? (
                <Itinerary plan={plan} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Zatím žádný plán</h3>
                  <p className="text-slate-500 max-w-md">
                    Vyplňte formulář vlevo a nechte AI sestavit vaši ideální cestu. 
                    Najdeme pro vás ubytování, památky i nejlepší jídlo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 Roadtrip Master CZ. Vyrobeno s láskou pro cestovatele. <br />
            Powered by Google Gemini API
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
