import React, { useState } from 'react';
import type { Place } from '../../types/place';
import { Plus, Edit2, Trash2, Search, Shield, LogOut, Database, Cloud } from 'lucide-react';
import { isFirebaseConfigured } from '../../config/firebase';

interface PlaceManagerTableProps {
  places: Place[];
  onAddNew: () => void;
  onEdit: (place: Place) => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
  onBackToGuestView: () => void;
}

export const PlaceManagerTable: React.FC<PlaceManagerTableProps> = ({
  places,
  onAddNew,
  onEdit,
  onDelete,
  onLogout,
  onBackToGuestView,
}) => {
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredPlaces = places.filter(
    (p) =>
      p.name_en.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.name_kr.includes(filterQuery) ||
      p.category.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleDeleteConfirm = (id: string) => {
    onDelete(id);
    setDeletingId(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Admin Spot Inventory ({places.length})
              </h1>
              {/* Sync Status Badge */}
              {isFirebaseConfigured ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  Firebase Cloud Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold flex items-center gap-1">
                  <Database className="w-3 h-3 text-sky-400" />
                  Local Storage Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Manage hotel guest recommended places, photos, and menus.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onBackToGuestView}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
          >
            ← Guest Map View
          </button>
          <button
            onClick={onAddNew}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Spot</span>
          </button>
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500 text-rose-400 hover:text-rose-300 transition-colors"
            title="Sign Out Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter spots by English name, Korean name, or category..."
          className="w-full bg-slate-900/90 text-white text-xs pl-10 pr-4 py-3 rounded-2xl border border-slate-800 focus:border-amber-400 focus:outline-none"
        />
      </div>

      {/* Places Grid/Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlaces.map((place) => (
          <div
            key={place.id}
            className="glass-panel p-4 rounded-3xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Thumbnail & Category */}
              <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={place.image_url}
                  alt={place.name_en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                  {place.category}
                </span>
                {place.is_featured && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold">
                    HOT
                  </span>
                )}
              </div>

              {/* Info */}
              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{place.name_en}</h3>
                <p className="text-xs text-slate-400 font-medium">{place.name_kr}</p>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-snug">
                  "{place.description_en}"
                </p>
              </div>

              {/* Menus Summary */}
              {place.recommended_menus.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/60 text-[11px] text-slate-300">
                  <span className="text-[10px] font-bold text-amber-400 block uppercase mb-0.5">Top Menu</span>
                  <span className="truncate block font-medium">{place.recommended_menus[0]}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => onEdit(place)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => setDeletingId(place.id)}
                className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors border border-rose-500/30 flex items-center justify-center gap-1"
                title="Delete Place"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/40 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Spot Recommendation?</h3>
            <p className="text-xs text-slate-400">
              This will remove this place from foreign guests' recommendation map.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
