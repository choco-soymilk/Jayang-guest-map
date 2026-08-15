import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Place, Category, Language } from '../types/place';
import { Header } from '../components/Header';
import { CategoryFilter } from '../components/CategoryFilter';
import { MapView } from '../components/MapView';
import { PlaceBottomSheet } from '../components/PlaceBottomSheet';
import { PlaceDetailModal } from '../components/PlaceDetailModal';
import { fetchPlaces } from '../services/placeService';
import { subscribeAuthState } from '../services/authService';

interface GuestPageProps {
  onOpenAdminPage: () => void;
}

export const GuestPage: React.FC<GuestPageProps> = ({ onOpenAdminPage }) => {
  // Detect browser default language or default to English
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const navLang = (navigator.language || '').toLowerCase();
    if (navLang.startsWith('ko')) return 'kr';
    if (navLang.startsWith('ja')) return 'jp';
    if (navLang.startsWith('zh')) return 'cn';
    return 'en';
  });

  const [places, setPlaces] = useState<Place[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [detailModalPlace, setDetailModalPlace] = useState<Place | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState<boolean>(true);
  const [panTrigger, setPanTrigger] = useState<number>(0);

  const handleSelectPlace = useCallback((place: Place | null) => {
    setSelectedPlace(place);
    if (place) setPanTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    fetchPlaces().then(setPlaces);
    const unsubscribe = subscribeAuthState(setIsAdminLoggedIn);
    return () => unsubscribe();
  }, []);

  // Filter places based on active category & search query
  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesCat = activeCategory === 'All' || place.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        place.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.name_kr.includes(searchQuery) ||
        place.description_en.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [places, activeCategory, searchQuery]);

  // Count per category
  const placeCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      All: places.length,
      Food: 0,
      Cafe: 0,
      Pub: 0,
      Attraction: 0,
    };
    places.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [places]);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 select-none">
      {/* Top Bar Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAdmin={onOpenAdminPage}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Category Scroll Filter Chips */}
      <CategoryFilter
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        currentLang={currentLang}
        placeCounts={placeCounts}
      />

      {/* Main Interactive Map Canvas */}
      <main className="relative flex-1 w-full h-full">
        <MapView
          places={places}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          selectedPlace={selectedPlace}
          onSelectPlace={handleSelectPlace}
          onOpenDetail={(place) => setDetailModalPlace(place)}
          isBottomSheetExpanded={isBottomSheetExpanded}
          panTrigger={panTrigger}
        />

        {/* Mobile & Desktop Bottom Sheet */}
        <PlaceBottomSheet
          places={filteredPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={handleSelectPlace}
          onOpenDetail={(place) => {
            setDetailModalPlace(place);
          }}
          currentLang={currentLang}
          isExpanded={isBottomSheetExpanded}
          onToggleExpand={() => setIsBottomSheetExpanded((prev) => !prev)}
        />
      </main>

      {/* Detail Modal */}
      <PlaceDetailModal
        place={detailModalPlace}
        onClose={() => setDetailModalPlace(null)}
        currentLang={currentLang}
      />

    </div>
  );
};
