
import React, { useState } from 'react';
import { TripPlanRequest, TravelStyle, INTEREST_OPTIONS } from '../types';

interface TripFormProps {
  onSubmit: (data: TripPlanRequest) => void;
  isLoading: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<TripPlanRequest>({
    destination: '',
    days: 3,
    travelers: 'couple',
    style: TravelStyle.ADVENTURE,
    interests: []
  });

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Kam se chystáte?</label>
        <input
          required
          type="text"
          placeholder="Např. Jižní Morava, Alpy, Toskánsko..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          value={formData.destination}
          onChange={e => setFormData({ ...formData, destination: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Počet dní</label>
          <input
            type="number"
            min="1"
            max="14"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.days}
            onChange={e => setFormData({ ...formData, days: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">S kým jedete?</label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.travelers}
            onChange={e => setFormData({ ...formData, travelers: e.target.value as any })}
          >
            <option value="solo">Sám / Sama</option>
            <option value="couple">V páru</option>
            <option value="family">S rodinou</option>
            <option value="group">S partou přátel</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Styl cesty</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.values(TravelStyle).map(style => (
            <button
              key={style}
              type="button"
              onClick={() => setFormData({ ...formData, style })}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                formData.style === style
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
              }`}
            >
              {style === 'adventure' ? 'Dobrodružství' :
               style === 'luxury' ? 'Luxus' :
               style === 'budget' ? 'Nízkonáklad' :
               style === 'culture' ? 'Kultura' : 'Příroda'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Co vás zajímá?</label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                formData.interests.includes(interest)
                  ? 'bg-violet-100 text-violet-700 border-violet-200 font-medium'
                  : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={isLoading}
        type="submit"
        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${
          isLoading 
            ? 'bg-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Plánujeme vaši cestu...
          </>
        ) : (
          'Naplánovat Roadtrip'
        )}
      </button>
    </form>
  );
};

export default TripForm;
