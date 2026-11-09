import React, { useState, useEffect } from 'react';
import { getCitasParaRecordatorio, getConfiguracionAlertaCita } from '../services/alertaCita.service';

/**
 * Banner informativo de citas próximas y recordatorios pendientes del día de mañana.
 * DENTALCARE-96 (PBI-Secret-15)
 */
export default function CitaProximaAlertBanner({ onVerRecordatorios }) {
  const [citasManiana, setCitasManiana] = useState([]);
  const [descartado, setDescartado] = useState(false);

  const verificarRecordatorios = async () => {
    try {
      const config = await getConfiguracionAlertaCita();
      if (config && config.alertasActivas === false) {
        setCitasManiana([]);
        return;
      }

      // Consulta de citas para mañana
      const maniana = new Date();
      maniana.setDate(maniana.getDate() + 1);
      const fechaManiana = maniana.toISOString().split('T')[0];

      const res = await getCitasParaRecordatorio(fechaManiana);
      if (Array.isArray(res)) {
        setCitasManiana(res);
      }
    } catch {
      // Silencioso
    }
  };

  useEffect(() => {
    verificarRecordatorios();
    const interval = setInterval(verificarRecordatorios, 60000);
    return () => clearInterval(interval);
  }, []);

  if (descartado || citasManiana.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-50/50 border border-emerald-300 rounded-2xl shadow-xs animate__animated animate__fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs animate-pulse">
          <i className="bi bi-bell" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs text-emerald-900 uppercase tracking-wide">
              Recordatorios del Día Anterior (Mañana)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900">
              {citasManiana.length} cita{citasManiana.length !== 1 ? 's' : ''} programada{citasManiana.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium mt-0.5">
            Hay citas programadas para mañana pendientes de confirmación. Puedes contactar a los pacientes por WhatsApp o correo.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onVerRecordatorios && (
          <button
            type="button"
            onClick={onVerRecordatorios}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <i className="bi bi-whatsapp" /> Enviar Recordatorios
          </button>
        )}

        <button
          type="button"
          onClick={() => setDescartado(true)}
          title="Ocultar aviso"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-lg transition-colors cursor-pointer"
        >
          <i className="bi bi-x-lg text-xs" />
        </button>
      </div>
    </div>
  );
}
