import { useState, useEffect, useMemo } from 'react';
import { getCitas } from '../services/cita.service';
import { normalizarFecha, getHoyLocal } from '../utils/cita.utils';
import { getUserName } from '../services/auth.service';

/**
 * Hook para el dashboard principal.
 * Carga las citas del día y calcula las estadísticas rápidas.
 */
export const useHomeDashboard = () => {
  const [citasHoy,  setCitasHoy]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  const userName = useMemo(() => getUserName(), []);

  const hoy = useMemo(() => getHoyLocal(), []);

  const today = new Date().toLocaleDateString('es-SV', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const todas = await getCitas();
        const deHoy = (todas ?? []).filter(c => normalizarFecha(c.fechaCita) === hoy);
        setCitasHoy(deHoy);
      } catch (_) {
        // Si falla, el widget muestra vacío sin romper el dashboard
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hoy]);

  const stats = useMemo(() => ({
    total:         citasHoy.length,
    completadas:   citasHoy.filter(c => c.estadoCita === 'COMPLETADA' || c.estadoCita === 'FINALIZADA').length,
    reprogramadas: citasHoy.filter(c => c.estadoCita === 'REPROGRAMADA').length,
    pendientes:    citasHoy.filter(c => ['PROGRAMADA', 'PENDIENTE'].includes(c.estadoCita)).length,
  }), [citasHoy]);

  return {
    citasHoy: citasHoy.slice(0, 4),
    loading,
    userName,
    today,
    stats,
  };
};
