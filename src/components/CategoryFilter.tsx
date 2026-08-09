import React from 'react';
import type { Category, Language } from '../types/place';
import { TRANSLATIONS } from '../i18n/translations';

interface CategoryFilterProps {
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  currentLang: Language;
  placeCounts: Record<Category, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  currentLang,
  placeCounts,
}) => {
  const t = TRANSLATIONS[currentLang];

  const categories: { id: Category; label: string; icon: string; bg: string }[] = [
    { id: 'All', label: t.all_categories, icon: '🌟', bg: 'from-amber-500 to-orange-500' },
    { id: 'Food', label: t.food, icon: '🍖', bg: 'from-orange-500 to-red-500' },
    { id: 'Cafe', label: t.cafe, icon: '☕', bg: 'from-amber-600 to-yellow-600' },
    { id: 'Pub', label: t.pub, icon: '🍺', bg: 'from-purple-600 to-indigo-600' },
    { id: 'Attraction', label: t.attraction, icon: '🏛️', bg: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="w-full py-2.5 px-4 overflow-x-auto no-scrollbar glass-panel border-b border-slate-800/80 z-30">
      <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = placeCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-200 shadow-lg active:scale-95 border ${
                isActive
                  ? `bg-gradient-to-r ${cat.bg} text-white border-white/30 ring-2 ring-white/20 shadow-amber-500/20`
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-slate-500'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
