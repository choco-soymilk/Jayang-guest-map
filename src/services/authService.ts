import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';

const MOCK_ADMIN_KEY = 'guest_map_admin_auth';

export const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
  // ── Firebase 연결된 경우: Firebase Auth만 사용 ──
  if (isFirebaseConfigured && auth) {
    await signInWithEmailAndPassword(auth, email, pass); // 실패하면 예외 throw → 폼에 오류 표시
    return true;
  }

  // ── Firebase 미설정: 데모 로컬 인증 ──
  if (email.trim() === 'admin@hotel.com' && pass.trim() === 'admin1234') {
    localStorage.setItem(MOCK_ADMIN_KEY, JSON.stringify({ email, loggedInAt: Date.now() }));
    window.dispatchEvent(new Event('auth_state_changed'));
    return true;
  }

  throw new Error('Invalid email or password.');
};

export const logoutAdmin = async (): Promise<void> => {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase logout failed:', err);
    }
  }
  localStorage.removeItem(MOCK_ADMIN_KEY);
  window.dispatchEvent(new Event('auth_state_changed'));
};

export const isLocalAdminLoggedIn = (): boolean => {
  const item = localStorage.getItem(MOCK_ADMIN_KEY);
  return Boolean(item);
};

export const subscribeAuthState = (callback: (isAdmin: boolean) => void) => {
  let unsubscribeFirebase: (() => void) | null = null;

  if (isFirebaseConfigured && auth) {
    unsubscribeFirebase = firebaseOnAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        callback(true);
      } else {
        callback(isLocalAdminLoggedIn());
      }
    });
  } else {
    callback(isLocalAdminLoggedIn());
  }

  const handleCustomEvent = () => {
    callback(isLocalAdminLoggedIn());
  };

  window.addEventListener('auth_state_changed', handleCustomEvent);

  return () => {
    if (unsubscribeFirebase) unsubscribeFirebase();
    window.removeEventListener('auth_state_changed', handleCustomEvent);
  };
};
