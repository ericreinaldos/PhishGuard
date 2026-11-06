import { BrowserRouter } from 'react-router-dom';
import { PreferencesProvider } from '@/context/PreferencesContext';
import { ToastProvider } from '@/context/ToastContext';
import { SmoothScrollProvider } from '@/context/SmoothScrollContext';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { AppRouter } from '@/routes/AppRouter';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SmoothScrollProvider>
        <ToastProvider>
          <PreferencesProvider>
            <ScrollToTop />
            <AppRouter />
          </PreferencesProvider>
        </ToastProvider>
      </SmoothScrollProvider>
    </BrowserRouter>
  );
}
