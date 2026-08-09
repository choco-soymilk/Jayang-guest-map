import React, { useState } from 'react';
import type { Place, Language } from '../types/place';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  X, 
  MapPin, 
  Navigation, 
  Star, 
  Clock, 
  Utensils, 
  Check, 
  Share2, 
  Building2,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
  currentLang: Language;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  onClose,
  currentLang,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  if (!place) return null;

  const t = TRANSLATIONS[currentLang];
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=${encodeURIComponent(place.name_en)}&travelmode=walking`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${place.name_kr} (${place.address})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRouteClick = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl max-h-[90vh] glass-panel border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Section */}
        <div className="relative w-full h-64 sm:h-72 bg-slate-950 shrink-0">
          <img
            src={place.image_url}
            alt={place.name_en}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Badges */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-lg">
                  {place.category}
                </span>
                {place.rating && (
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {place.rating}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {place.name_en}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {place.name_kr}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Key English Recommendation Highlight */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400" />
              {t.featured_spot}
            </h3>
            <p className="text-sm text-amber-100 font-medium leading-relaxed">
              "{place.description_en}"
            </p>
          </div>

          {/* Key Quick Info Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">{t.opening_hours}</span>
                <span className="font-semibold text-slate-200">{place.opening_hours || '11:00 AM - 10:00 PM'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">{t.hotel_distance}</span>
                <span className="font-semibold text-slate-200">{place.hotel_distance || '5 min walk'}</span>
              </div>
            </div>
          </div>

          {/* Must-Try Menus & Price */}
          {place.recommended_menus && place.recommended_menus.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-amber-400" />
                {t.recommended_menus}
              </h3>
              <div className="space-y-2">
                {place.recommended_menus.map((menu, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-200"
                  >
                    <span className="font-medium">{menu}</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Address & Copy Action */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Address (Korean for Taxi)</span>
                <span className="text-xs text-slate-200 font-medium truncate block">{place.address}</span>
              </div>
            </div>

            <button
              onClick={handleCopyAddress}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors shrink-0 flex items-center gap-1 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions — Google Maps */}
        <div className="p-4 glass-panel border-t border-slate-800 shrink-0">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleRouteClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Navigation className="w-4 h-4 fill-white" />
            <span>Google Maps Directions</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-75" />
          </a>
        </div>
      </div>
    </div>
  );
};
