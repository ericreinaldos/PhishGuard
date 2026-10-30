import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useLenis } from '@/context/SmoothScrollContext';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

export function PublicLayout() {
  // Scroll suave solo en la zona pública y editorial
  const { setLenis } = useSmoothScroll();
  useLenis(setLenis);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent-strong focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
