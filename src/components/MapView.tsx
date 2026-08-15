/// <reference types="navermaps" />
import React, { useEffect, useRef, useState } from 'react';
import type { Place } from '../types/place';
import { HOTEL_LOCATION } from '../data/initialPlaces';
import { Compass, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';

interface MapViewProps {
  places: Place[];
  activeCategory: string;
  searchQuery: string;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place | null) => void;
  onOpenDetail?: (place: Place) => void;
  onMapClickForCoords?: (coords: { lat: number; lng: number; address?: string }) => void;
  isBottomSheetExpanded?: boolean;
  /** Increment this counter each time a place is selected (even re-selecting the same one) */
  panTrigger?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  Food: { bg: '#f97316', icon: '🍖' },
  Cafe: { bg: '#d97706', icon: '☕' },
  Pub: { bg: '#8b5cf6', icon: '🍺' },
  Attraction: { bg: '#10b981', icon: '🏛️' },
  Hotel: { bg: '#3b82f6', icon: '🏨' },
};

export const MapView: React.FC<MapViewProps> = ({
  places,
  activeCategory,
  searchQuery,
  selectedPlace,
  onSelectPlace,
  onOpenDetail,
  onMapClickForCoords,
  isBottomSheetExpanded = false,
  panTrigger = 0,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const naverMapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersMapRef = useRef<Map<string, naver.maps.Marker>>(new Map());
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [naverLoadError, setNaverLoadError] = useState<boolean>(false);

  const [fallbackZoom, setFallbackZoom] = useState<number>(1);
  const [fallbackCenter, setFallbackCenter] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. SINGLETON NAVER MAP INITIALIZATION
  // Script is loaded in index.html — we just wait for window.naver to be ready
  useEffect(() => {
    if (naverMapInstanceRef.current || !mapContainerRef.current) return;

    const tryInit = () => {
      if (typeof window.naver === 'undefined' || !window.naver.maps) {
        // naver script may not have loaded yet (e.g. no clientId → fallback)
        setNaverLoadError(true);
        return;
      }

      try {
        const mapOptions: naver.maps.MapOptions = {
          center: new window.naver.maps.LatLng(HOTEL_LOCATION.lat, HOTEL_LOCATION.lng),
          zoom: 16,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          logoControl: false,
        };

        const map = new window.naver.maps.Map(mapContainerRef.current!, mapOptions);
        naverMapInstanceRef.current = map;
        setMapLoaded(true);

        // 초기 로딩 시 하단창(~50vh)이 확장되어 있으므로,
        // 호텔 핀이 보이는 영역(상단 50%) 중앙에 위치하도록 중심을 아래로 이동
        setTimeout(() => {
          if (!mapContainerRef.current || !naverMapInstanceRef.current) return;
          const projection = map.getProjection();
          const hotelLatLng = new window.naver.maps.LatLng(HOTEL_LOCATION.lat, HOTEL_LOCATION.lng);
          const hotelOffset = projection.fromCoordToOffset(hotelLatLng);
          const sheetHeightPx = mapContainerRef.current.clientHeight * 0.5;
          const adjustedOffset = new window.naver.maps.Point(
            hotelOffset.x,
            hotelOffset.y + sheetHeightPx / 2
          );
          const adjustedLatLng = projection.fromOffsetToCoord(adjustedOffset);
          map.setCenter(adjustedLatLng);
        }, 0);

        window.naver.maps.Event.addListener(map, 'click', (e: any) => {
          if (e.coord && onMapClickForCoords) {
            onMapClickForCoords({ lat: e.coord.y, lng: e.coord.x });
          }
        });

        // Hotel marker
        new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(HOTEL_LOCATION.lat, HOTEL_LOCATION.lng),
          map,
          title: HOTEL_LOCATION.name,
          icon: {
            content: `
              <div style="background:#3b82f6;border:2px solid #fff;padding:6px 12px;border-radius:9999px;color:#fff;font-weight:bold;font-size:12px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.3);display:flex;align-items:center;gap:6px;white-space:nowrap;">
                🏨 <span>${HOTEL_LOCATION.name}</span>
              </div>
            `,
            anchor: new window.naver.maps.Point(60, 20),
          },
        });
      } catch (err) {
        console.error('Failed to initialize Naver Map:', err);
        setNaverLoadError(true);
      }
    };

    // If naver already available (script loaded before React)
    if (typeof window.naver !== 'undefined' && window.naver.maps) {
      tryInit();
    } else {
      // Wait up to 5s for the script in index.html to finish loading
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 200;
        if (typeof window.naver !== 'undefined' && window.naver.maps) {
          clearInterval(interval);
          tryInit();
        } else if (elapsed >= 5000) {
          clearInterval(interval);
          setNaverLoadError(true);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [onMapClickForCoords]);

  // 2. MARKER SYNC — ref-based visibility, no map re-init
  useEffect(() => {
    const map = naverMapInstanceRef.current;
    if (!map || !mapLoaded || typeof window.naver === 'undefined' || !window.naver.maps) return;

    places.forEach((place) => {
      if (!markersMapRef.current.has(place.id)) {
        const color = CATEGORY_COLORS[place.category] || CATEGORY_COLORS.Food;

        const html = `
          <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <div style="background:${color.bg};border:2px solid #fff;padding:4px 10px;border-radius:9999px;color:#fff;font-weight:bold;font-size:12px;box-shadow:0 8px 15px rgba(0,0,0,0.4);display:flex;align-items:center;gap:4px;white-space:nowrap;">
              ${color.icon} ${place.name_en.split(' ')[0]}
            </div>
            <div style="width:8px;height:8px;background:${color.bg};transform:rotate(45deg);margin-top:-4px;"></div>
          </div>
        `;

        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(place.lat, place.lng),
          map,
          title: place.name_en,
          icon: {
            content: html,
            anchor: new window.naver.maps.Point(40, 36),
          },
        });

        window.naver.maps.Event.addListener(marker, 'click', () => {
          onSelectPlace(place);
          if (onOpenDetail) onOpenDetail(place);
        });
        markersMapRef.current.set(place.id, marker);
      }
    });

    // Toggle visibility via setMap — no re-render of the map itself
    markersMapRef.current.forEach((marker, placeId) => {
      const place = places.find((p) => p.id === placeId);
      if (!place) { marker.setMap(null); return; }

      const catMatch = activeCategory === 'All' || place.category === activeCategory;
      const searchMatch =
        !searchQuery ||
        place.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.name_kr.includes(searchQuery) ||
        place.description_en.toLowerCase().includes(searchQuery.toLowerCase());

      marker.setMap(catMatch && searchMatch ? map : null);
    });
  }, [places, activeCategory, searchQuery, mapLoaded, onSelectPlace]);

  // 3. PAN TO SELECTED PLACE
  // panTrigger increments on every select (including re-select of same place)
  // so the map always responds, even after manual panning.
  useEffect(() => {
    const map = naverMapInstanceRef.current;
    if (!map || !selectedPlace || !window.naver?.maps) return;

    const targetLatLng = new window.naver.maps.LatLng(selectedPlace.lat, selectedPlace.lng);

    if (isBottomSheetExpanded) {
      // 하단창이 열려있을 때: 지도의 보이는 영역(상단 50~55%) 중앙으로 핀을 이동시킨다.
      // panTo는 현재 뷰포트 기준으로 오프셋을 계산하므로,
      // 먼저 목적지를 현재 뷰포트 좌표계에서 오프셋으로 변환한 뒤
      // 하단창 높이의 절반만큼 y를 더해(위로 올려) 조정된 좌표를 구한다.
      const projection = map.getProjection();
      // 현재 뷰포트 중심을 기준으로 한 픽셀 오프셋 구하기
      const targetOffset = projection.fromCoordToOffset(targetLatLng);
      const sheetHeightPx = mapContainerRef.current
        ? mapContainerRef.current.clientHeight * 0.5 // 하단창이 약 50vh
        : 150;
      // y를 +sheetHeightPx/2 하면 지도가 위로 올라가서 핀이 보이는 영역 중앙에 위치
      const adjustedOffset = new window.naver.maps.Point(
        targetOffset.x,
        targetOffset.y + sheetHeightPx / 2
      );
      const adjustedLatLng = projection.fromOffsetToCoord(adjustedOffset);
      map.setZoom(16, false);
      map.panTo(adjustedLatLng, { duration: 300 });
    } else {
      map.setZoom(16, false);
      map.panTo(targetLatLng, { duration: 300 });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panTrigger, selectedPlace]);

  const handleRecenterHotel = () => {
    if (naverMapInstanceRef.current && window.naver?.maps) {
      naverMapInstanceRef.current.panTo(
        new window.naver.maps.LatLng(HOTEL_LOCATION.lat, HOTEL_LOCATION.lng),
        { duration: 300 }
      );
      naverMapInstanceRef.current.setZoom(15, true);
    } else {
      setFallbackCenter({ x: 0, y: 0 });
      setFallbackZoom(1);
    }
  };

  const handleZoomIn = () => {
    if (naverMapInstanceRef.current) {
      naverMapInstanceRef.current.setZoom(naverMapInstanceRef.current.getZoom() + 1, true);
    } else {
      setFallbackZoom((p) => Math.min(p + 0.2, 2.5));
    }
  };

  const handleZoomOut = () => {
    if (naverMapInstanceRef.current) {
      naverMapInstanceRef.current.setZoom(naverMapInstanceRef.current.getZoom() - 1, true);
    } else {
      setFallbackZoom((p) => Math.max(p - 0.2, 0.6));
    }
  };

  const visiblePlaces = places.filter((p) => {
    const catMatch = activeCategory === 'All' || p.category === activeCategory;
    const searchMatch =
      !searchQuery ||
      p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name_kr.includes(searchQuery) ||
      p.description_en.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-slate-950">
      {/* Naver Map container */}
      {!naverLoadError && (
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
      )}

      {/* Fallback visual map (auth failure / offline / no clientId) */}
      {naverLoadError && (
        <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden">
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${fallbackCenter.x}px, ${fallbackCenter.y}px) scale(${fallbackZoom})`,
              transformOrigin: 'center center',
            }}
          >
            <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Hotel pin */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer" onClick={handleRecenterHotel}>
              <div className="relative">
                <div className="animate-ping absolute inset-0 rounded-full bg-blue-500 opacity-40" />
                <div className="bg-blue-600 border-2 border-white px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 text-white font-bold text-xs whitespace-nowrap">
                  🏨 <span>{HOTEL_LOCATION.name}</span>
                </div>
              </div>
            </div>

            {/* Place pins */}
            {visiblePlaces.map((place) => {
              const offsetX = (place.lng - HOTEL_LOCATION.lng) * 9000;
              const offsetY = (HOTEL_LOCATION.lat - place.lat) * 9000;
              const style = CATEGORY_COLORS[place.category] || CATEGORY_COLORS.Food;
              const isSelected = selectedPlace?.id === place.id;
              return (
                <div
                  key={place.id}
                  className={`absolute left-1/2 top-1/2 z-10 transition-all duration-200 cursor-pointer ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`}
                  style={{ transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))` }}
                  onClick={() => { onSelectPlace(place); if (onOpenDetail) onOpenDetail(place); }}
                >
                  <div className="flex flex-col items-center">
                    <div className="px-2.5 py-1 rounded-full shadow-lg border border-white/80 flex items-center gap-1 text-xs font-bold text-white" style={{ backgroundColor: style.bg }}>
                      {style.icon} <span className="max-w-[100px] truncate">{place.name_en.split(' ')[0]}</span>
                    </div>
                    <div className="w-2 h-2 rotate-45 -mt-1" style={{ backgroundColor: style.bg }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notice banner */}
          <div className="absolute top-20 left-4 right-4 max-w-md mx-auto z-20 glass-panel p-3 rounded-2xl border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200 shadow-xl">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold block text-amber-300">Demo Map Mode (Visual Pins Active)</span>
              <span>Naver Maps API loading... Register localhost in NCP Console to activate live map.</span>
            </div>
          </div>
        </div>
      )}

      {/* Map controls elevated to z-35 above bottom sheet (z-30) with dynamic bottom position */}
      <div
        className={`absolute right-4 z-35 flex flex-col gap-2 transition-all duration-300 ease-out ${
          isBottomSheetExpanded
            ? 'bottom-[calc(50vh+16px)] sm:bottom-[calc(45vh+16px)]'
            : 'bottom-20 sm:bottom-24'
        }`}
      >
        <button
          type="button"
          onClick={handleRecenterHotel}
          className="glass-panel p-3 rounded-full text-white hover:bg-slate-800/90 active:scale-95 transition-all shadow-xl border border-white/10 flex items-center justify-center group"
          title="Recenter to Hotel"
        >
          <Compass className="w-5 h-5 text-sky-400 group-hover:rotate-45 transition-transform" />
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          className="glass-panel p-3 rounded-full text-white hover:bg-slate-800/90 active:scale-95 transition-all shadow-xl border border-white/10 flex items-center justify-center"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-slate-200" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="glass-panel p-3 rounded-full text-white hover:bg-slate-800/90 active:scale-95 transition-all shadow-xl border border-white/10 flex items-center justify-center"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-slate-200" />
        </button>
      </div>
    </div>
  );
};
