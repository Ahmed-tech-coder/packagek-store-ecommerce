import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useStore } from '@/store/useStore';

export function Layout() {
  const { setTheme, theme } = useStore();

  useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  return (
    <div className="min-h-screen flex flex-col ">
      <Navbar />
      <main className="flex-1 lg:mt-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
