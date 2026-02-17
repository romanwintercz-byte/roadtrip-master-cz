
import React from 'react';
import { TripPlanResponse } from '../types';

interface ItineraryProps {
  plan: TripPlanResponse;
}

const Itinerary: React.FC<ItineraryProps> = ({ plan }) => {
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    let isInsideTable = false;
    const tableRows: string[][] = [];

    return lines.map((line, i) => {
      // Basic Markdown Table Detection
      if (line.trim().startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
        if (cells.length > 1) {
          if (line.includes('---')) return null; // Skip separator line
          
          if (!isInsideTable) {
            isInsideTable = true;
          }
          
          return (
            <div key={i} className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {cells.map((cell, idx) => (
                      <th key={idx} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {/* Note: This is a simplified table renderer. 
                      In a real scenario we'd collect all rows first. 
                      But for the stream/generator output this inline logic works for simple tables. */}
                </tbody>
              </table>
            </div>
          );
        }
      }
      
      // Traditional Markdown
      if (line.startsWith('# ')) return <h2 key={i} className="text-3xl font-bold text-slate-800 mt-10 mb-6 border-b pb-4">{line.replace('# ', '')}</h2>;
      if (line.startsWith('## ')) return <h3 key={i} className="text-2xl font-bold text-indigo-700 mt-8 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-8 bg-indigo-600 rounded-full inline-block"></span>
        {line.replace('## ', '')}
      </h3>;
      if (line.startsWith('### ')) return <h4 key={i} className="text-xl font-semibold text-slate-700 mt-6 mb-3">{line.replace('### ', '')}</h4>;
      if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} className="ml-6 mb-2 text-slate-600 list-disc marker:text-indigo-500">{line.substring(2)}</li>;
      
      // Table Row fallback (if the table is already initiated)
      if (line.trim().startsWith('|') && !line.includes('---')) {
        const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
        // Logic to properly render rows would need a more robust parser or state. 
        // For this UI, let's treat the table header and body with a simpler approach:
        return (
          <div key={i} className="grid grid-cols-5 gap-2 px-4 py-2 border-b border-slate-100 text-sm text-slate-600 bg-white hover:bg-slate-50">
            {cells.map((c, idx) => <span key={idx} className={idx === 0 ? "font-bold" : ""}>{c}</span>)}
          </div>
        );
      }

      if (line.trim() === '') return <div key={i} className="h-2"></div>;
      return <p key={i} className="text-slate-600 leading-relaxed mb-4">{line}</p>;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 leading-tight">Váš itinerář na míru</h2>
              <p className="text-sm text-slate-500">Optimalizováno pro Hyundai i30 Fastback</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            EFEKTIVNÍ TRASA
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          {renderContent(plan.content)}
        </div>

        {plan.groundingLinks.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Užitečné odkazy a zdroje:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.groundingLinks.map((link, idx) => {
                const url = link.web?.uri || link.maps?.uri;
                const title = link.web?.title || link.maps?.title || "Zdroj informací";
                if (!url) return null;
                return (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white rounded-lg border border-slate-100 group-hover:bg-indigo-50">
                        {link.maps ? (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                           </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0114 10c0 .34-.028.675-.083 1H11a2 2 0 00-2 2v2.108a5.99 5.99 0 01-4.668-5.081z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {link.maps ? 'Lokace' : 'Web'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 line-clamp-2 group-hover:text-indigo-600 transition-colors">{title}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Itinerary;
