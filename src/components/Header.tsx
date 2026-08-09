import React, { useState, useRef, useEffect } from 'react';
import type { Language } from '../types/place';
import { TRANSLATIONS } from '../i18n/translations';
import { MapPin, Search, QrCode, Globe, Shield, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenQRCode: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'kr', label: '한국어', flag: '🇰🇷' },
  { code: 'jp', label: '日本語', flag: '🇯🇵' },
  { code: 'cn', label: '中文', flag: '🇨🇳' },
];

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  onOpenQRCode,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-2.5 py-2.5 sm:px-4 sm:py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Logo & Hotel Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-500/20 ring-1 ring-white/20">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight leading-none">
                {t.app_title}
              </h1>
              <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              {t.app_subtitle}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 min-w-0 max-w-md mx-1 sm:mx-2">
          <div className="relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.search_placeholder}
              className="w-full bg-slate-900/90 text-white text-xs sm:text-sm pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-full border border-slate-700/80 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-500 truncate"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* QR Code Button */}
          <button
            type="button"
            onClick={onOpenQRCode}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
            title={t.qr_code}
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">{t.qr_code}</span>
          </button>

          {/* Language Switcher */}
          <div className="relative shrink-0" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen((prev) => !prev)}
              className="px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
              <span>{LANGUAGES.find((l) => l.code === currentLang)?.flag}</span>
              <span className="uppercase text-[10px] sm:text-[11px] font-bold tracking-wider">{currentLang}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isLangOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors ${
                      currentLang === lang.code ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-300'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin Dashboard Button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all shadow-md shrink-0 active:scale-95 ${
              isAdminLoggedIn
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white'
            }`}
            title={t.admin_panel}
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
              {isAdminLoggedIn ? t.admin_panel : (currentLang === 'kr' ? '관리자' : currentLang === 'jp' ? '管理者' : currentLang === 'cn' ? '管理员' : 'Admin')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
