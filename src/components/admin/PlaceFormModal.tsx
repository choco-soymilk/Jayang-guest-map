import React, { useState, useEffect } from 'react';
import type { Place } from '../../types/place';
import { uploadImageService } from '../../services/placeService';
import { X, Upload, Plus, Trash2 } from 'lucide-react';

interface PlaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (placeData: Omit<Place, 'id' | 'created_at'>, existingId?: string) => Promise<void>;
  editingPlace?: Place | null;
}

export const PlaceFormModal: React.FC<PlaceFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPlace,
}) => {
  const [nameEn, setNameEn] = useState<string>('');
  const [nameKr, setNameKr] = useState<string>('');
  const [category, setCategory] = useState<'Food' | 'Cafe' | 'Pub' | 'Attraction'>('Food');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [lat, setLat] = useState<number>(37.5635);
  const [lng, setLng] = useState<number>(126.9860);
  const [menus, setMenus] = useState<string[]>(['']);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [openingHours, setOpeningHours] = useState<string>('11:00 AM - 10:00 PM');
  const [hotelDistance, setHotelDistance] = useState<string>('5 min walk');
  const [isFeatured, setIsFeatured] = useState<boolean>(true);
  const [rating, setRating] = useState<number>(4.5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const [uploading, setUploading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (editingPlace) {
      setNameEn(editingPlace.name_en);
      setNameKr(editingPlace.name_kr);
      setCategory(editingPlace.category);
      setDescriptionEn(editingPlace.description_en);
      setAddress(editingPlace.address);
      setLat(editingPlace.lat);
      setLng(editingPlace.lng);
      setMenus(editingPlace.recommended_menus.length > 0 ? editingPlace.recommended_menus : ['']);
      setImageUrl(editingPlace.image_url);
      setOpeningHours(editingPlace.opening_hours || '11:00 AM - 10:00 PM');
      setHotelDistance(editingPlace.hotel_distance || '5 min walk');
      setIsFeatured(editingPlace.is_featured ?? true);
      setRating(editingPlace.rating ?? 4.5);
    } else {
      setNameEn('');
      setNameKr('');
      setCategory('Food');
      setDescriptionEn('');
      setAddress('');
      setLat(37.5635);
      setLng(126.9860);
      setMenus(['Samgyeopsal (₩18,000)', 'Kimchi Stew (₩9,000)']);
      setImageUrl('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80');
      setOpeningHours('11:30 AM - 11:00 PM');
      setHotelDistance('4 min walk');
      setIsFeatured(true);
      setRating(4.5);
    }
  }, [editingPlace, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageService(file);
      setImageUrl(url);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddMenu = () => {
    setMenus([...menus, '']);
  };

  const handleRemoveMenu = (index: number) => {
    setMenus(menus.filter((_, i) => i !== index));
  };

  const handleMenuChange = (index: number, val: string) => {
    const updated = [...menus];
    updated[index] = val;
    setMenus(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSave(
        {
          name_en: nameEn.trim(),
          name_kr: nameKr.trim(),
          category,
          description_en: descriptionEn.trim(),
          address: address.trim(),
          lat: Number(lat),
          lng: Number(lng),
          recommended_menus: menus.filter((m) => m.trim() !== ''),
          image_url: imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
          opening_hours: openingHours,
          hotel_distance: hotelDistance,
          is_featured: isFeatured,
          rating: rating,
        },
        editingPlace?.id
      );
      onClose();
    } catch (err) {
      console.error('Failed to save place:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] glass-panel border border-slate-700/80 rounded-3xl p-6 shadow-2xl overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {editingPlace ? 'Edit Recommended Spot' : 'Register New Spot'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fill in English & Korean details for hotel guests.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">English Name *</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Myeongdong K-BBQ Grill"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Korean Name (for Taxi) *</label>
              <input
                type="text"
                required
                value={nameKr}
                onChange={(e) => setNameKr(e.target.value)}
                placeholder="e.g. 명동 돼지갈비"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="Food">Food 🍖</option>
                <option value="Cafe">Cafe ☕</option>
                <option value="Pub">Pub / Bar 🍺</option>
                <option value="Attraction">Attraction 🏛️</option>
              </select>
            </div>
            <div className="space-y-2">
              {/* Star Rating Picker */}
              <label className="font-semibold text-slate-300 block">Rating ★</label>
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  const halfActive = !active && (hoverRating || rating) >= star - 0.5;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setRating(star)}
                      className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
                      title={`${star}점`}
                    >
                      <span className={active ? 'text-amber-400' : halfActive ? 'text-amber-400/50' : 'text-slate-600'}>
                        ★
                      </span>
                    </button>
                  );
                })}
                <span className="ml-2 text-sm font-bold text-amber-400">
                  {(hoverRating || rating).toFixed(1)}
                </span>
              </div>
              {/* Staff Pick checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="isFeatured" className="font-semibold text-slate-200 cursor-pointer">
                  Highlight as Staff Pick ⭐
                </label>
              </div>
            </div>
          </div>

          {/* 1-Line English Recommendation */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">1-Line Recommendation (English) *</label>
            <textarea
              required
              rows={2}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="e.g. Best Pork Belly near hotel. Extremely friendly staff!"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Address & Lat/Lng Coordinates */}
          <div className="space-y-2">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 12, Myeongdong 8-gil, Jung-gu, Seoul"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-400 block mb-1">Latitude (Lat)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-400 block mb-1">Longitude (Lng)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Recommended Menus */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">Recommended Menus & Prices</label>
              <button
                type="button"
                onClick={handleAddMenu}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Menu
              </button>
            </div>
            <div className="space-y-2">
              {menus.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={m}
                    onChange={(e) => handleMenuChange(idx, e.target.value)}
                    placeholder="e.g. Samgyeopsal ($15)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:border-amber-400 focus:outline-none"
                  />
                  {menus.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMenu(idx)}
                      className="p-1.5 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload / Preview */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">Representative Image</label>
            <div className="flex items-center gap-3">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                />
              )}
              <label className="flex-1 cursor-pointer p-3 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-amber-400 flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>{uploading ? 'Uploading...' : 'Choose Image File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold shadow-lg disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingPlace ? 'Update Spot' : 'Save New Spot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
