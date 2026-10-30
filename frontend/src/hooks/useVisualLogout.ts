import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';

/**
 * Cierre de sesión solo visual: no hay sesión real que destruir.
 * Cuando exista autenticación, aquí se llamará a authService.logout().
 */
export function useVisualLogout() {
  const navigate = useNavigate();
  const { notify } = useToast();

  return () => {
    navigate('/');
    notify({
      tone: 'info',
      title: 'Cierre de sesión visual',
      description: 'La autenticación aún no está integrada, así que no había ninguna sesión activa.',
    });
  };
}
