import React, { useState, useEffect } from 'react';
import {
  getConfiguracionAlertaCita,
  guardarConfiguracionAlertaCita,
} from '../services/alertaCita.service';
import Swal from 'sweetalert2';

/**
 * Modal para configuración de alertas de citas próximas.
 * DENTALCARE-96 (PBI-Secret-15)
 */
export default function ModalConfigAlertaCita({ isOpen, onClose }) {
  const [alertasActivas, setAlertasActivas] = useState(true);
  const [tiempoAnticipacionMinutos, setTiempoAnticipacionMinutos] = useState(30);
  const [sonidoActivo, setSonidoActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getConfiguracionAlertaCita()
        .then((res) => {
          if (res) {
            setAlertasActivas(res.alertasActivas ?? true);
            setTiempoAnticipacionMinutos(res.tiempoAnticipacionMinutos ?? 30);
            setSonidoActivo(res.sonidoActivo ?? true);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await guardarConfiguracionAlertaCita(null, {
        alertasActivas,
        tiempoAnticipacionMinutos: Number(tiempoAnticipacionMinutos),
        sonidoActivo,
      });

      Swal.fire({
        icon: 'success',
        title: 'Configuración guardada',
        text: 'Las preferencias de alertas de citas han sido actualizadas.',
        timer: 2000,
        showConfirmButton: false,
      });
      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo guardar la configuración.',
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate__animated animate__fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate__animated animate__zoomIn animate__faster">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
              <i className="bi bi-sliders" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                Alertas de Citas Próximas
              </h3>
              <p className="text-[11px] text-slate-400">
                Parámetros de recordatorio para recepción
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="bi bi-x-lg text-sm" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleGuardar} className="p-6 space-y-5">
          {/* Switch Alertas Activas */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label htmlFor="switch-alertas" className="font-bold text-xs text-slate-800 block cursor-pointer">
                Activar Alertas de Agenda
              </label>
              <span className="text-[11px] text-slate-500">
                Muestra banners visuales cuando una cita esté por comenzar.
              </span>
            </div>
            <input
              id="switch-alertas"
              type="checkbox"
              checked={alertasActivas}
              onChange={(e) => setAlertasActivas(e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded-lg focus:ring-primary-500 cursor-pointer"
            />
          </div>

          {/* Selector de Tiempo de Anticipación */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ventana de Anticipación del Recordatorio
            </label>
            <select
              value={tiempoAnticipacionMinutos}
              disabled={!alertasActivas}
              onChange={(e) => setTiempoAnticipacionMinutos(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value={15}>15 minutos antes</option>
              <option value={30}>30 minutos antes (Recomendado)</option>
              <option value={45}>45 minutos antes</option>
              <option value={60}>60 minutos (1 hora) antes</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              El sistema alertará a la recepcionista según este intervalo de tiempo.
            </p>
          </div>

          {/* Switch Sonido de Alerta */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label htmlFor="switch-sonido" className="font-bold text-xs text-slate-800 block cursor-pointer">
                Aviso Sonoro
              </label>
              <span className="text-[11px] text-slate-500">
                Reproduce un tono discreto al emitirse un nuevo recordatorio.
              </span>
            </div>
            <input
              id="switch-sonido"
              type="checkbox"
              disabled={!alertasActivas}
              checked={sonidoActivo}
              onChange={(e) => setSonidoActivo(e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded-lg focus:ring-primary-500 cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {guardando ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg" /> Guardar Preferencias
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
