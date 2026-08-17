import React, { useState } from 'react';
import type { Place, Language } from '../types/place';
import { TRANSLATIONS } from '../i18n/translations';
import { ChevronUp, ChevronDown, Navigation } from 'lucide-react';

interface PlaceBottomSheetProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onOpenDetail: (place: Place) => void;
  currentLang: Language;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const PlaceBottomSheet: React.FC<PlaceBottomSheetProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  onOpenDetail,
  currentLang,
  isExpanded: isExpandedProp,
  onToggleExpand,
}) => {
  const [internalExpanded, setInternalExpanded] = useState<boolean>(true);
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  const t = TRANSLATIONS[currentLang];

  if (places.length === 0) {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30 glass-panel p-4 rounded-2xl border border-slate-700/80 text-center shadow-2xl">
        <p className="text-sm font-semibold text-slate-300">{t.no_places_found}</p>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-out glass-panel border-t border-slate-800 rounded-t-3xl shadow-2xl max-w-4xl mx-auto ${
        isExpanded ? 'max-h-[50vh] sm:max-h-[45vh]' : 'h-14'
      }`}
    >
      {/* Handle Bar / Toggle Header */}
      <div
        onClick={handleToggle}
        className="w-full py-2.5 px-4 flex items-center justify-between cursor-pointer border-b border-slate-800/60 select-none hover:bg-slate-800/30 transition-colors rounded-t-3xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 rounded-full bg-slate-600 mx-auto" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {places.length} {t.all_categories}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400 font-semibold">
            {isExpanded ? 'Collapse' : 'Expand Recommendations'}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-amber-400 animate-bounce" />
          )}
        </div>
      </div>

      {/* Card List when expanded */}
      {isExpanded && (
        <div className="p-4 overflow-y-auto max-h-[calc(50vh-50px)] sm:max-h-[calc(45vh-50px)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {places.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=${encodeURIComponent(place.name_en)}&travelmode=walking`;
            const naverMapsUrl = `https://map.naver.com/v5/directions/-/-/-/walk?c=${place.lng},${place.lat},15,0,0,0,dh&destination=${place.lat},${place.lng}&destinationName=${encodeURIComponent(place.name_kr)}`;
            const naverMapsAppUrl = `nmap://route/walk?dlat=${place.lat}&dlng=${place.lng}&dname=${encodeURIComponent(place.name_kr)}&appname=com.jayangjayang.guestmap`;

            return (
              <div
                key={place.id}
                onClick={() => {
                  onSelectPlace(place);
                }}
                className={`p-3 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/30 shadow-xl scale-[1.01]'
                    : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Image & Category Tag */}
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2.5 bg-slate-950">
                    <img
                      src={place.image_url}
                      alt={place.name_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    {/* Category Tag */}
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white shadow-md">
                      {place.category}
                    </span>

                    {/* Staff Pick Badge */}
                    {place.is_featured && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold shadow-md flex items-center gap-1">
                        ★ HOT
                      </span>
                    )}

                  </div>

                  {/* Title & Description */}
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {place.name_en}
                    </h3>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-0.5 shrink-0">
                      ★ {place.rating || 4.8}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2 font-medium">
                    {place.name_kr} • {place.address}
                  </p>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-snug">
                    "{place.description_en}"
                  </p>
                </div>

                {/* Actions (View Details & Get Directions Deep Link) */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(place);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors text-center"
                  >
                    Details
                  </button>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white text-[10px] font-bold transition-all flex items-center justify-center gap-0.5 shadow-md shadow-blue-500/20 active:scale-95"
                    title="Google Maps Directions"
                  >
                    <Navigation className="w-3 h-3 fill-white shrink-0" />
                    <span>Google</span>
                  </a>

                  <a
                    href={naverMapsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTimeout(() => {
                        window.open(naverMapsUrl, '_blank');
                      }, 1500);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-[10px] font-bold transition-all flex items-center justify-center gap-0.5 shadow-md shadow-emerald-500/20 active:scale-95"
                    title="NAVER Maps Walking"
                  >
                    <Navigation className="w-3 h-3 fill-white shrink-0" />
                    <span>NAVER</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
