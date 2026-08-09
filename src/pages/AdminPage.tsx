import React, { useState, useEffect } from 'react';
import type { Place } from '../types/place';
import { PlaceManagerTable } from '../components/admin/PlaceManagerTable';
import { PlaceFormModal } from '../components/admin/PlaceFormModal';
import { AdminLoginForm } from '../components/admin/AdminLoginForm';
import { fetchPlaces, createPlace, updatePlaceService, deletePlaceService } from '../services/placeService';
import { logoutAdmin, subscribeAuthState } from '../services/authService';

interface AdminPageProps {
  onBackToGuestView: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToGuestView }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAuthState((isLoggedIn) => {
      setIsAdminLoggedIn(isLoggedIn);
    });
    loadPlaces();
    return () => unsubscribe();
  }, []);

  const loadPlaces = async () => {
    const data = await fetchPlaces();
    setPlaces(data);
  };

  const handleOpenAddForm = () => {
    setEditingPlace(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (place: Place) => {
    setEditingPlace(place);
    setIsFormModalOpen(true);
  };

  const handleSavePlace = async (placeData: Omit<Place, 'id' | 'created_at'>, existingId?: string) => {
    if (existingId) {
      await updatePlaceService(existingId, placeData);
    } else {
      await createPlace(placeData);
    }
    await loadPlaces();
  };

  const handleDeletePlace = async (id: string) => {
    await deletePlaceService(id);
    await loadPlaces();
  };

  const handleLogout = async () => {
    await logoutAdmin();
  };

  if (!isAdminLoggedIn) {
    return (
      <AdminLoginForm
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          loadPlaces();
        }}
        onClose={onBackToGuestView}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6">
      <PlaceManagerTable
        places={places}
        onAddNew={handleOpenAddForm}
        onEdit={handleOpenEditForm}
        onDelete={handleDeletePlace}
        onLogout={handleLogout}
        onBackToGuestView={onBackToGuestView}
      />

      <PlaceFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSavePlace}
        editingPlace={editingPlace}
      />
    </div>
  );
};
