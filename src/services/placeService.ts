import { compressImage } from '../utils/imageCompressor';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from '../config/firebase';
import type { Place } from '../types/place';
import { INITIAL_PLACES } from '../data/initialPlaces';

const LOCAL_STORAGE_KEY = 'guest_map_places_v1';

// ─────────────────────────────────────────────
// Local Storage helpers (used ONLY when Firebase is NOT configured)
// ─────────────────────────────────────────────
const getLocalPlaces = (): Place[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PLACES));
    return INITIAL_PLACES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PLACES;
  }
};

const saveLocalPlaces = (places: Place[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(places));
};

// ─────────────────────────────────────────────
// Firestore row → Place
// ─────────────────────────────────────────────
const docToPlace = (id: string, data: Record<string, any>): Place => ({
  id,
  name_en: data.name_en || '',
  name_kr: data.name_kr || '',
  category: data.category || 'Food',
  description_en: data.description_en || '',
  address: data.address || '',
  lat: Number(data.lat) || 37.5665,
  lng: Number(data.lng) || 126.9780,
  recommended_menus: data.recommended_menus || [],
  image_url: data.image_url || '',
  created_at: data.created_at?.toDate
    ? data.created_at.toDate().toISOString()
    : (data.created_at || new Date().toISOString()),
  opening_hours: data.opening_hours || '11:00 AM - 10:00 PM',
  price_range: data.price_range || '',
  rating: data.rating || 4.8,
  hotel_distance: data.hotel_distance || '5 min walk',
  is_featured: data.is_featured ?? false,
  closed_days: data.closed_days || [],
});

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────
export const fetchPlaces = async (): Promise<Place[]> => {
  // ── Firebase 연결된 경우: Firestore만 사용, localStorage 폴백 없음 ──
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'places'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => docToPlace(d.id, d.data()));
    } catch (err) {
      console.error('Firestore fetch error:', err);
      return []; // Firebase 오류 시 빈 배열 반환 (목업 데이터 X)
    }
  }

  // ── Firebase 미설정: localStorage 목업 데이터 사용 ──
  return getLocalPlaces();
};

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
export const createPlace = async (
  placeData: Omit<Place, 'id' | 'created_at'>
): Promise<Place> => {
  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, 'places'), {
      ...placeData,
      created_at: serverTimestamp(),
    });
    return { ...placeData, id: docRef.id, created_at: new Date().toISOString() };
  }

  // localStorage
  const newPlace: Place = {
    ...placeData,
    id: 'place_' + Date.now(),
    created_at: new Date().toISOString(),
  };
  const current = getLocalPlaces();
  saveLocalPlaces([newPlace, ...current]);
  return newPlace;
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
export const updatePlaceService = async (
  id: string,
  placeData: Partial<Place>
): Promise<void> => {
  if (isFirebaseConfigured && db) {
    const placeRef = doc(db, 'places', id);
    await updateDoc(placeRef, placeData as Record<string, any>);
    return;
  }

  // localStorage
  const current = getLocalPlaces();
  saveLocalPlaces(current.map((p) => (p.id === id ? { ...p, ...placeData } : p)));
};

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────
export const deletePlaceService = async (id: string): Promise<void> => {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'places', id));
    return;
  }

  // localStorage
  const current = getLocalPlaces();
  saveLocalPlaces(current.filter((p) => p.id !== id));
};

// ─────────────────────────────────────────────
// IMAGE UPLOAD
// ─────────────────────────────────────────────
export const uploadImageService = async (file: File): Promise<string> => {
  // ── 압축 먼저 (최대 1200px / 0.5 MB) ──
  let fileToUpload: File;
  try {
    fileToUpload = await compressImage(file);
    console.info(
      `이미지 압축 완료: ${(file.size / 1024).toFixed(0)} KB → ${(fileToUpload.size / 1024).toFixed(0)} KB`
    );
  } catch (err) {
    console.warn('이미지 압축 실패, 원본 사용:', err);
    fileToUpload = file;
  }

  if (isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, `places/${Date.now()}_${fileToUpload.name}`);
      const snapshot = await uploadBytes(storageRef, fileToUpload);
      return await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.warn('Firebase Storage upload failed, using base64 fallback:', err);
    }
  }

  // Firebase 미설정 시 base64 fallback (압축된 파일 사용)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(fileToUpload);
  });
};
