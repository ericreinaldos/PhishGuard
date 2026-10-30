import { useContext } from 'react';
import { SmoothScrollContext } from '@/context/SmoothScrollContext';

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) throw new Error('useSmoothScroll debe usarse dentro de <SmoothScrollProvider>');
  return ctx;
}
