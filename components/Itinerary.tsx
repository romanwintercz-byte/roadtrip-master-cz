
import React, { useState } from 'react';
import { TripPlanResponse } from '../types';

interface ItineraryProps {
  plan: TripPlanResponse;
}

const Itinerary: React.FC<ItineraryProps> = ({ plan }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(plan.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sharePlan = async () => {
    // Zakódování plánu do URL pro přenos mezi zařízeními
    const encodedPlan = btoa(encodeURIComponent(JSON.stringify({
      content: plan.content,
      links: plan.groundingLinks
    })));
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedPlan}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Roadtrip: ${plan.request?.destination || 'Můj plán'}`,
          text: 'Podívej se na můj roadtrip plán vygenerovaný AI!',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Sdílení zrušeno');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Odkaz na tento plán byl zkopírován do schránky. Můžete ho poslat na mobil!');
    }
  };

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim() !== '' || line.indexOf('|') !== line.lastIndexOf('|')).map(c => c.trim());
        if (trimmedLine.includes('---')) return null;
        if (cells.length > 1) {
          const isHeader = i === lines.findIndex(l => l.trim().startsWith('|'));
          return (
            <div key={i} className={`grid grid-cols-${cells.length} gap-2 p-3 border-b border-slate-100 text-xs sm:text-sm ${isHeader ? 'bg-indigo-50 font-bold text-indigo-900 rounded-t-lg' : 'bg-white text-slate-600'}`}>
              {cells.map((cell, idx) => <span key={idx}>{cell}</span>)}
            </div>
          );
        }
      }
      if (line.startsWith('# ')) return <h2 key={i} className="text-2xl sm:text-3xl font-bold text-slate-800 mt-8 mb-4 border-b pb-2">{line.replace('# ', '')}</h2>;
      if (line.startsWith('## ')) return <h3 key={i} className="text-xl sm:text-2xl font-bold text-indigo-700 mt-6 mb-3 flex items-center gap-2">{line.replace('## ', '')}</h3>;
      if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} className="ml-4 mb-1 text-slate-600 list-disc marker:text-indigo-400">{line.substring(2)}</li>;
      if (trimmedLine === '') return <div key={i} className="h-2"></div>;
      return <p key={i} className="text-slate-600 leading-relaxed mb-3 text-sm sm:text-base">{line}</p>;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-4 sm:p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Váš itinerář</h2>
            <p className="text-indigo-100 text-xs">Vytvořeno pro Hyundai i30 Edition</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={copyToClipboard}
              className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {copied ? '✅ Zkopírováno' : '📋 Kopírovat text'}
            </button>
            <button 
              onClick={sharePlan}
              className="flex-1 sm:flex-none bg-indigo-500 hover:bg-indigo-400 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              🚀 Sdílet / Do mobilu
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="prose prose-slate max-w-none">
            {renderContent(plan.content)}
          </div>

          {plan.groundingLinks.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                📍 Mapy a zdroje
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.groundingLinks.map((link, idx) => {
                  const url = link.web?.uri || link.maps?.uri;
                  if (!url) return null;
                  return (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-300 transition-all group text-sm">
                      <span className="text-xl">{link.maps ? '🗺️' : '🔗'}</span>
                      <span className="font-medium text-slate-700 truncate">{link.web?.title || link.maps?.title || "Zobrazit na mapě"}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
