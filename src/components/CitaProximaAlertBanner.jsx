import React, { useState, useEffect, useRef } from 'react';
import { getCitasProximas, getConfiguracionAlertaCita } from '../services/alertaCita.service';

/**
 * Banner flotante / encabezado para advertir sobre citas inminentes (30 minutos).
 * DENTALCARE-96 (PBI-Secret-15)
 */
export default function CitaProximaAlertBanner({ onAgendarCita, onRefreshAgenda }) {
  const [citasProximas, setCitasProximas] = useState([]);
  const [descartadas, setDescartadas] = useState([]);
  const [sonidoActivo, setSonidoActivo] = useState(true);
  const avisadasRef = useRef(new Set());

  // Función sintetizadora de sonido de alerta web (no requiere archivos externos)
  const reproducirTonoAlerta = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext bloqueado por política de usuario antes de interacción
    }
  };

  const verificarCitas = async () => {
    try {
      const config = await getConfiguracionAlertaCita();
      if (config && config.alertasActivas === false) {
        setCitasProximas([]);
        return;
      }
      setSonidoActivo(config?.sonidoActivo ?? true);

      const res = await getCitasProximas();
      if (Array.isArray(res)) {
        setCitasProximas(res);

        // Si hay una cita nueva dentro de la ventana que no ha sonado, reproducir aviso sonoro
        if (config?.sonidoActivo) {
          const nuevas = res.filter((c) => !avisadasRef.current.has(c.idCitas));
          if (nuevas.length > 0) {
            reproducirTonoAlerta();
            nuevas.forEach((c) => avisadasRef.current.add(c.idCitas));
          }
        }
      }
    } catch {
      // Ignorar error de red silenciosamente en polling
    }
  };

  useEffect(() => {
    verificarCitas();
    const interval = setInterval(verificarCitas, 45000); // Cada 45 segundos
    return () => clearInterval(interval);
  }, []);

  const citasVisibles = citasProximas.filter((c) => !descartadas.includes(c.idCitas));

  if (citasVisibles.length === 0) {
    return null;
  }

  const handleDescartar = (idCitas) => {
    setDescartadas((prev) => [...prev, idCitas]);
  };

  return (
    <div className="mb-4 space-y-2">
      {citasVisibles.map((cita) => {
        const horaInicio = cita.horaInicioCita
          ? new Date(cita.horaInicioCita).toLocaleTimeString('es-SV', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

        return (
          <div
            key={cita.idCitas}
            className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50/50 border border-amber-300 rounded-2xl shadow-sm animate__animated animate__fadeIn"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm animate-bounce">
                <i className="bi bi-clock-history" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-amber-900 uppercase tracking-wide">
                    ¡Cita Próxima en {cita.minutosRestantes} min!
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-800">
                    {horaInicio}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  Paciente: <strong className="text-slate-900">{cita.nombrePaciente}</strong>{' '}
                  {cita.telefonoPaciente && (
                    <span className="text-slate-500 text-[11px]">
                      (Tel: {cita.telefonoPaciente})
                    </span>
                  )}{' '}
                  &bull; Atiende: <span className="text-primary-700">{cita.nombreOdontologo}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDescartar(cita.idCitas)}
                title="Ocultar recordatorio"
                className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-amber-100/60 rounded-lg transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
