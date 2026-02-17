
import React, { useState } from 'react';
import { TripPlanResponse } from '../types';

interface ItineraryProps {
  plan: TripPlanResponse;
}

const Itinerary: React.FC<ItineraryProps> = ({ plan }) => {
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(plan.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToMobile = async () => {
    const data = btoa(encodeURIComponent(JSON.stringify(plan)));
    const url = `${window.location.origin}${window.location.pathname}?plan=${data}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Roadtrip: ${plan.request?.destination}`,
          text: `Podívej se na můj plán roadtripu!`,
          url: url
        });
      } catch (e) {
        console.log("Sdílení zrušeno");
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Odkaz na synchronizaci byl zkopírován. Pošli si ho na mobil!");
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      
      // Tabulky
      if (trimmed.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim() !== '' || line.indexOf('|') !== line.lastIndexOf('|')).map(c => c.trim());
        if (trimmed.includes('---')) return null;
        if (cells.length > 1) {
          const isHeader = i < 10 && (line.includes('Den') || line.includes('Trasa'));
          return (
            <div key={i} className={`grid grid-cols-${cells.length} gap-2 p-2 sm:p-3 border-b border-slate-100 text-[10px] sm:text-xs ${isHeader ? 'bg-indigo-600 text-white font-bold rounded-t-lg' : 'bg-white text-slate-600'}`}>
              {cells.map((cell, idx) => <span key={idx} className="truncate">{cell}</span>)}
            </div>
          );
        }
      }

      // Nadpisy
      if (line.startsWith('# ')) return <h2 key={i} className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-8 mb-4">{line.replace('# ', '')}</h2>;
      if (line.startsWith('## ')) return <h3 key={i} className="text-xl sm:text-2xl font-bold text-indigo-700 mt-6 mb-3 flex items-center gap-2">🚗 {line.replace('## ', '')}</h3>;
      if (line.startsWith('### ')) return <h4 key={i} className="text-lg font-bold text-slate-800 mt-5 mb-2">{line.replace('### ', '')}</h4>;
      
      // Seznamy
      if (line.startsWith('* ') || line.startsWith('- ')) return (
        <li key={i} className="ml-5 mb-1.5 text-slate-600 list-none flex items-start gap-2 text-sm sm:text-base">
          <span className="text-indigo-500 mt-1">•</span>
          <span>{line.substring(2)}</span>
        </li>
      );

      if (trimmed === '') return <div key={i} className="h-4"></div>;
      
      return <p key={i} className="text-slate-600 leading-relaxed mb-4 text-sm sm:text-base">{line}</p>;
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-slate-100">
        
        {/* Akční lišta */}
        <div className="bg-slate-900 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">i30</div>
            <div className="hidden sm:block">
              <p className="text-white text-xs font-bold uppercase tracking-widest opacity-50">Vozidlo</p>
              <p className="text-white text-sm">Hyundai Fastback</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyText} className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
              {copied ? '✅ Hotovo' : '📋 Kopírovat'}
            </button>
            <button onClick={shareToMobile} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-900/20">
              📲 Sync do mobilu
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="prose prose-indigo max-w-none">
            {renderMarkdown(plan.content)}
          </div>

          {plan.groundingLinks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Užitečné odkazy a mapy</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.groundingLinks.map((link, idx) => {
                  const url = link.web?.uri || link.maps?.uri;
                  if (!url) return null;
                  return (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-white transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                        {link.maps ? '📍' : '🔗'}
                      </div>
                      <span className="text-sm font-bold text-slate-700 truncate">{link.web?.title || link.maps?.title || "Zobrazit cíl"}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tiskové instrukce */}
      <div className="mt-6 text-center">
        <button onClick={() => window.print()} className="text-slate-400 hover:text-indigo-600 text-sm flex items-center gap-2 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Vytisknout itinerář na cestu
        </button>
      </div>
    </div>
  );
};

export default Itinerary;
