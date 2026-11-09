import React, { useState, useEffect } from 'react';
import {
  getConfiguracionAlertaCita,
  guardarConfiguracionAlertaCita,
} from '../services/alertaCita.service';
import Swal from 'sweetalert2';

/**
 * Modal para configuración de recordatorios de citas.
 * DENTALCARE-96 (PBI-Secret-15)
 */
export default function ModalConfigAlertaCita({ isOpen, onClose }) {
  const [alertasActivas, setAlertasActivas] = useState(true);
  const [anticipacionTipo, setAnticipacionTipo] = useState('DIA_ANTERIOR');
  const [canalWhatsApp, setCanalWhatsApp] = useState(true);
  const [canalCorreo, setCanalCorreo] = useState(true);
  const [sonidoActivo, setSonidoActivo] = useState(true);
  const [plantillaMensaje, setPlantillaMensaje] = useState(
    'Hola *{paciente}*, le saludamos de DentalCare. Le recordamos su cita odontológica para mañana *{fecha}* a las *{hora}* con el Dr(a). *{doctor}*. Por favor responda con \"CONFIRMAR\".'
  );
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getConfiguracionAlertaCita()
        .then((res) => {
          if (res) {
            setAlertasActivas(res.alertasActivas ?? true);
            setAnticipacionTipo(res.anticipacionTipo || 'DIA_ANTERIOR');
            setCanalWhatsApp(res.canalWhatsApp ?? true);
            setCanalCorreo(res.canalCorreo ?? true);
            setSonidoActivo(res.sonidoActivo ?? true);
            if (res.plantillaMensaje) setPlantillaMensaje(res.plantillaMensaje);
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
        anticipacionTipo,
        tiempoAnticipacionMinutos: anticipacionTipo === 'DIA_ANTERIOR' ? 1440 : anticipacionTipo === 'MISMO_DIA' ? 360 : 30,
        canalWhatsApp,
        canalCorreo,
        sonidoActivo,
        plantillaMensaje,
      });

      Swal.fire({
        icon: 'success',
        title: 'Preferencias guardadas',
        text: 'La configuración de recordatorios de citas ha sido actualizada.',
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
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate__animated animate__zoomIn animate__faster">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
              <i className="bi bi-sliders" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">
                Configuración de Recordatorios de Citas
              </h3>
              <p className="text-[11px] text-slate-400">
                Parámetros de anticipación y canales para recepción
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
        <form onSubmit={handleGuardar} className="p-6 space-y-4">
          {/* Switch Alertas Activas */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label htmlFor="switch-alertas-activas" className="font-bold text-xs text-slate-800 block cursor-pointer">
                Habilitar Recordatorios y Alertas
              </label>
              <span className="text-[11px] text-slate-500">
                Genera la lista proactiva de citas pendientes para contactar pacientes.
              </span>
            </div>
            <input
              id="switch-alertas-activas"
              type="checkbox"
              checked={alertasActivas}
              onChange={(e) => setAlertasActivas(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded-lg focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Regla de Negocio: Cuándo enviar recordatorio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Momento de Anticipación (Regla de Negocio)
            </label>
            <select
              value={anticipacionTipo}
              disabled={!alertasActivas}
              onChange={(e) => setAnticipacionTipo(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="DIA_ANTERIOR">
                1 día antes / El día anterior (Recomendado para Clínica)
              </option>
              <option value="MISMO_DIA">
                El mismo día por la mañana (Primeras horas)
              </option>
              <option value="HORAS_30">
                30 minutos antes de la hora de la cita
              </option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              {anticipacionTipo === 'DIA_ANTERIOR'
                ? 'El sistema cargará automáticamente las citas programadas para el día de mañana para que recepción envíe WhatsApp o correo con tiempo suficiente.'
                : 'El recordatorio se enfocará en las citas inmediatas del día.'}
            </p>
          </div>

          {/* Canales Habilitados */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-700">Canales de Notificación</span>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={canalWhatsApp}
                  disabled={!alertasActivas}
                  onChange={(e) => setCanalWhatsApp(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                />
                <i className="bi bi-whatsapp text-emerald-600 text-sm" /> WhatsApp Directo
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={canalCorreo}
                  disabled={!alertasActivas}
                  onChange={(e) => setCanalCorreo(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
                />
                <i className="bi bi-envelope text-blue-600 text-sm" /> Correo Electrónico
              </label>
            </div>
          </div>

          {/* Plantilla de Mensaje */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Plantilla de Mensaje (Variables: {'{paciente}'}, {'{fecha}'}, {'{hora}'}, {'{doctor}'})
            </label>
            <textarea
              rows="3"
              value={plantillaMensaje}
              disabled={!alertasActivas}
              onChange={(e) => setPlantillaMensaje(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Botones */}
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {guardando ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg" /> Guardar Configuración
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
