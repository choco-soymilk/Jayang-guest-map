import { useState, useEffect } from 'react';
import { GuestPage } from './pages/GuestPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<'guest' | 'admin'>(() => {
    return window.location.pathname === '/admin' ? 'admin' : 'guest';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname === '/admin' ? 'admin' : 'guest');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: 'guest' | 'admin') => {
    setCurrentRoute(route);
    const path = route === 'admin' ? '/admin' : '/';
    window.history.pushState({}, '', path);
  };

  return (
    <div
      className={`w-full bg-slate-950 text-slate-100 font-sans ${
        currentRoute === 'admin'
          ? 'min-h-screen overflow-y-auto'
          : 'h-screen overflow-hidden'
      }`}
    >
      {currentRoute === 'admin' ? (
        <AdminPage onBackToGuestView={() => navigateTo('guest')} />
      ) : (
        <GuestPage onOpenAdminPage={() => navigateTo('admin')} />
      )}
    </div>
  );
}

export default App;
