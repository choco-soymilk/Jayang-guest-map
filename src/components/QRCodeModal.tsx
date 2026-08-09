import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Language } from '../types/place';
import { TRANSLATIONS } from '../i18n/translations';
import { HOTEL_LOCATION } from '../data/initialPlaces';
import { X, Smartphone, Wifi, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, currentLang }) => {
  const [wifiCopied, setWifiCopied] = React.useState(false);
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang];
  const appUrl = window.location.href;

  const handleCopyWifi = () => {
    navigator.clipboard.writeText(`Wi-Fi: ${HOTEL_LOCATION.wifi_name} / Password: ${HOTEL_LOCATION.wifi_pass}`);
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md glass-panel border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
          <Smartphone className="w-6 h-6 animate-pulse" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{t.qr_code}</h2>
          <p className="text-xs text-slate-400 mt-1">{t.scan_qr_desc}</p>
        </div>

        {/* QR Code Container */}
        <div className="p-5 bg-white rounded-2xl inline-block shadow-2xl border-4 border-amber-400/80">
          <QRCodeSVG
            value={appUrl}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Hotel Wi-Fi Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Wifi className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.wifi_info}</span>
              <span className="font-mono text-slate-200">{HOTEL_LOCATION.wifi_name} (Pass: {HOTEL_LOCATION.wifi_pass})</span>
            </div>
          </div>

          <button
            onClick={handleCopyWifi}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Copy Wi-Fi Details"
          >
            {wifiCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
