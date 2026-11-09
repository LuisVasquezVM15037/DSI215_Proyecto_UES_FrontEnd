import React, { useState, useEffect } from 'react';
import {
  getCitasParaRecordatorio,
  enviarRecordatorioCita,
  enviarRecordatorioMasivo,
} from '../services/alertaCita.service';
import Swal from 'sweetalert2';

/**
 * Panel de Citas y Envío de Recordatorios (Día Anterior / Mañana).
 * DENTALCARE-96 (PBI-Secret-15) & DENTALCARE-92 (PBI-Secret-14)
 */
export default function RecordatoriosCitasPanel() {
  const getFechaManianaISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getFechaHoyISO = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [fechaSeleccionada, setFechaSeleccionada] = useState(getFechaManianaISO());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviadosState, setEnviadosState] = useState({});
  const [modalCorreo, setModalCorreo] = useState(null);
  const [enviandoMasivo, setEnviandoMasivo] = useState(false);
  const [asistenteWhatsApp, setAsistenteWhatsApp] = useState({
    abierto: false,
    pacientes: [],
    abiertosWA: {},
  });

  const cargarCitas = async (fecha = fechaSeleccionada) => {
    setLoading(true);
    try {
      const res = await getCitasParaRecordatorio(fecha);
      if (Array.isArray(res)) {
        setCitas(res);
      }
    } catch (err) {
      console.error('Error al cargar citas para recordatorio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCitas(fechaSeleccionada);
  }, [fechaSeleccionada]);

  // Enviar / Abrir WhatsApp individual
  const handleEnviarWhatsApp = async (cita) => {
    if (!cita.telefonoPaciente || cita.telefonoPaciente.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Sin teléfono registrado',
        text: `El paciente ${cita.nombrePaciente} no tiene número de teléfono registrado en el sistema.`,
      });
      return;
    }

    try {
      // Registrar envío en backend (trazabilidad y notificación)
      await enviarRecordatorioCita(cita.idCitas, 'WHATSAPP');
      setEnviadosState((prev) => ({ ...prev, [cita.idCitas]: 'WHATSAPP' }));

      // Abrir WhatsApp Web con el mensaje pre-cargado
      if (cita.linkWhatsApp) {
        window.open(cita.linkWhatsApp, '_blank');
      }

      Swal.fire({
        icon: 'success',
        title: 'WhatsApp Preparado',
        text: `Se abrió WhatsApp Web para enviar el recordatorio a ${cita.nombrePaciente}.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.message || 'No se pudo registrar el envío', 'error');
    }
  };

  // Simular Envío de Correo individual
  const handleConfirmarEnvioCorreo = async (cita) => {
    try {
      await enviarRecordatorioCita(cita.idCitas, 'CORREO');
      setEnviadosState((prev) => ({ ...prev, [cita.idCitas]: 'CORREO' }));
      setModalCorreo(null);

      Swal.fire({
        icon: 'success',
        title: '¡Correo Simulado con Éxito!',
        html: `Se envió el recordatorio institucional al correo <strong>${cita.emailPaciente}</strong> de ${cita.nombrePaciente}.`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  // Enviar recordatorios a TODOS los pacientes de la fecha
  const handleEnviarRecordatorioATodos = async () => {
    if (citas.length === 0) return;

    const citasPendientes = citas.filter((c) => !enviadosState[c.idCitas]);

    const result = await Swal.fire({
      title: 'Enviar Recordatorios a Todos',
      html: `
        <div class="text-left space-y-3">
          <p class="text-xs text-slate-600">
            Hay <strong>${citas.length}</strong> cita(s) programada(s) para <strong>${fechaSeleccionada}</strong> (${citasPendientes.length} sin recordatorio aún).
          </p>
          <p class="text-xs font-bold text-slate-700">Selecciona el canal para el envío masivo:</p>
          <div class="space-y-2">
            <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/60 transition-colors cursor-pointer">
              <input type="radio" id="canal-correo-opt" name="canal-masivo-option" value="CORREO" checked class="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
              <div>
                <div class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <i class="bi bi-envelope-at text-blue-600"></i> Correo Electrónico (Masivo Simulado)
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  Despacha simultáneamente los correos institucionales a todos los pacientes en un solo clic.
                </p>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/60 transition-colors cursor-pointer">
              <input type="radio" id="canal-whatsapp-opt" name="canal-masivo-option" value="WHATSAPP" class="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
              <div>
                <div class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <i class="bi bi-whatsapp text-emerald-600"></i> WhatsApp (Asistente Secuencial)
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  Abre de forma asistida los chats de WhatsApp Web con mensaje personalizado para cada paciente.
                </p>
              </div>
            </label>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-send-fill mr-1"></i> Continuar Envío',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
      preConfirm: () => {
        const radios = document.getElementsByName('canal-masivo-option');
        for (let r of radios) {
          if (r.checked) return r.value;
        }
        return 'CORREO';
      },
    });

    if (!result.isConfirmed) return;

    const canalElegido = result.value;

    if (canalElegido === 'CORREO') {
      setEnviandoMasivo(true);
      try {
        const resp = await enviarRecordatorioMasivo(
          fechaSeleccionada,
          'CORREO',
          citas.map((c) => c.idCitas)
        );

        const nuevosEnviados = { ...enviadosState };
        citas.forEach((c) => {
          nuevosEnviados[c.idCitas] = 'CORREO';
        });
        setEnviadosState(nuevosEnviados);

        Swal.fire({
          icon: 'success',
          title: '¡Envío Masivo Exitoso!',
          html: `Se enviaron y registraron los recordatorios por correo institucional para los <strong>${resp.totalProcesados || citas.length}</strong> pacientes.`,
          timer: 3000,
        });
      } catch (err) {
        Swal.fire('Error', err.message || 'No se pudo procesar el envío masivo', 'error');
      } finally {
        setEnviandoMasivo(false);
      }
    } else if (canalElegido === 'WHATSAPP') {
      const pacientesConWA = citas.filter((c) => c.telefonoPaciente && c.telefonoPaciente.trim() !== '');
      if (pacientesConWA.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin teléfonos registrados',
          text: 'Ninguno de los pacientes en esta fecha cuenta con número de teléfono registrado.',
        });
        return;
      }

      // Registrar masivamente en backend
      try {
        await enviarRecordatorioMasivo(
          fechaSeleccionada,
          'WHATSAPP',
          pacientesConWA.map((c) => c.idCitas)
        );

        const nuevosEnviados = { ...enviadosState };
        pacientesConWA.forEach((c) => {
          nuevosEnviados[c.idCitas] = 'WHATSAPP';
        });
        setEnviadosState(nuevosEnviados);
      } catch (e) {
        console.error('Error registrando lote en backend:', e);
      }

      // Abrir Asistente Interactivo de WhatsApp
      setAsistenteWhatsApp({
        abierto: true,
        pacientes: pacientesConWA,
        abiertosWA: {},
      });
    }
  };

  const handleAbrirWhatsAppDesdeAsistente = (cita) => {
    if (cita.linkWhatsApp) {
      window.open(cita.linkWhatsApp, '_blank');
      setAsistenteWhatsApp((prev) => ({
        ...prev,
        abiertosWA: { ...prev.abiertosWA, [cita.idCitas]: true },
      }));
    }
  };

  const formatearHora = (horaIso) => {
    if (!horaIso) return '';
    const d = new Date(horaIso);
    return d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros, Selector de Fecha y Botón Masivo */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
              <i className="bi bi-bell-fill" />
            </span>
            Envío de Recordatorios de Citas
          </h2>
          <p className="text-[11px] text-slate-500">
            Regla de Negocio: Notificación proactiva con 1 día de anticipación (El día anterior)
          </p>
        </div>

        {/* Botones de Selección Rápida y Acción Masiva */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFechaSeleccionada(getFechaManianaISO())}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              fechaSeleccionada === getFechaManianaISO()
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="bi bi-calendar-event" /> Citas de Mañana (Recomendado)
          </button>

          <button
            type="button"
            onClick={() => setFechaSeleccionada(getFechaHoyISO())}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              fechaSeleccionada === getFechaHoyISO()
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="bi bi-clock" /> Citas de Hoy
          </button>

          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          />

          {/* BOTÓN ENVIAR A TODOS */}
          <button
            type="button"
            onClick={handleEnviarRecordatorioATodos}
            disabled={citas.length === 0 || enviandoMasivo}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
              citas.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20'
            }`}
            title="Enviar recordatorio a todos los pacientes programados en esta fecha"
          >
            {enviandoMasivo ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin text-sm" /> Enviando a todos...
              </>
            ) : (
              <>
                <i className="bi bi-send-check-fill text-sm" /> Enviar a Todos ({citas.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-base">
            <i className="bi bi-people" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase">Total Citas en Fecha</p>
            <p className="text-xl font-extrabold text-slate-800">{citas.length}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
            <i className="bi bi-whatsapp" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase">Con WhatsApp / Teléfono</p>
            <p className="text-xl font-extrabold text-emerald-700">
              {citas.filter((c) => c.telefonoPaciente && c.telefonoPaciente.trim() !== '').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
            <i className="bi bi-send-check" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase">Recordatorios Enviados</p>
            <p className="text-xl font-extrabold text-blue-700">
              {Object.keys(enviadosState).length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Citas del Día */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Barra superior de la tabla con estado masivo */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Listado de Pacientes</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold">
              {citas.length} citas
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Puedes enviar recordatorios individualmente o usar el botón <strong>"Enviar a Todos"</strong> arriba.</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <i className="bi bi-arrow-repeat animate-spin text-2xl block mb-2 text-emerald-600" />
            Cargando citas para recordatorio...
          </div>
        ) : citas.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <i className="bi bi-calendar-check text-3xl block mb-2 text-slate-300" />
            No hay citas programadas para la fecha seleccionada ({fechaSeleccionada}).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Odontólogo / Especialidad</th>
                  <th className="py-3 px-4 text-center">Estado Recordatorio</th>
                  <th className="py-3 px-4 text-right">Acciones de Notificación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citas.map((cita) => {
                  const yaEnviado = enviadosState[cita.idCitas];

                  return (
                    <tr key={cita.idCitas} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-slate-800 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          {formatearHora(cita.horaInicioCita)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-slate-800">{cita.nombrePaciente}</p>
                        <p className="text-[11px] text-slate-400">
                          Estado Cita: <span className="font-semibold text-slate-600">{cita.estadoCita}</span>
                        </p>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <i className="bi bi-telephone text-[11px] text-slate-400" />
                          <span>{cita.telefonoPaciente || 'Sin teléfono'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <i className="bi bi-envelope text-[11px]" />
                          <span className="truncate max-w-[180px]">{cita.emailPaciente || 'Sin correo'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{cita.nombreOdontologo}</p>
                        <p className="text-[11px] text-primary-600 font-medium">{cita.especialidad}</p>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {yaEnviado === 'WHATSAPP' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            <i className="bi bi-whatsapp" /> Enviado por WhatsApp
                          </span>
                        ) : yaEnviado === 'CORREO' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                            <i className="bi bi-envelope-check" /> Enviado por Correo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <i className="bi bi-clock-history" /> Pendiente
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Botón WhatsApp */}
                          <button
                            type="button"
                            onClick={() => handleEnviarWhatsApp(cita)}
                            title="Abrir WhatsApp Web con mensaje de recordatorio pre-cargado"
                            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <i className="bi bi-whatsapp" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>

                          {/* Botón Correo */}
                          <button
                            type="button"
                            onClick={() => setModalCorreo(cita)}
                            title="Previsualizar y simular envío de correo"
                            className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <i className="bi bi-envelope-at" />
                            <span className="hidden sm:inline">Correo</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Simulación de Correo Electrónico Individual */}
      {modalCorreo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate__animated animate__fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate__animated animate__zoomIn animate__faster">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  <i className="bi bi-envelope-paper-fill" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">
                    Simulación de Recordatorio por Correo
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Destinatario: {modalCorreo.emailPaciente}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalCorreo(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg text-sm" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Asunto:</span>
                <p className="font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {modalCorreo.asuntoCorreo}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Contenido del Mensaje:</span>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {modalCorreo.cuerpoCorreo}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalCorreo(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmarEnvioCorreo(modalCorreo)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="bi bi-send-check" /> Simular Envío Exitoso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asistente de Envío de WhatsApp (Secuencial sin bloqueo de popups) */}
      {asistenteWhatsApp.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate__animated animate__fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate__animated animate__zoomIn animate__faster">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  <i className="bi bi-whatsapp" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">
                    Asistente de Envío por WhatsApp
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Abre de forma segura el chat de cada paciente para enviar el mensaje pre-cargado.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAsistenteWhatsApp({ abierto: false, pacientes: [], abiertosWA: {} })}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg text-sm" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <i className="bi bi-info-circle-fill text-emerald-600 text-sm" />
                <span>
                  Los navegadores bloquean la apertura de múltiples pestañas automáticas. Haz clic en <strong>"Abrir Chat"</strong> para contactar a cada paciente en su propia pestaña.
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {asistenteWhatsApp.pacientes.map((p, idx) => {
                  const yaAbierto = asistenteWhatsApp.abiertosWA[p.idCitas];

                  return (
                    <div
                      key={p.idCitas}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        yaAbierto
                          ? 'bg-slate-50 border-slate-200 opacity-75'
                          : 'bg-white border-emerald-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-extrabold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{p.nombrePaciente}</p>
                          <p className="text-[11px] text-slate-400">
                            Hora: {formatearHora(p.horaInicioCita)} • Tel: {p.telefonoPaciente} • Dr(a). {p.nombreOdontologo}
                          </p>
                        </div>
                      </div>

                      <div>
                        {yaAbierto ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                            <i className="bi bi-check2-circle" /> Chat Abierto
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAbrirWhatsAppDesdeAsistente(p)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <i className="bi bi-whatsapp" /> Abrir Chat
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  {Object.keys(asistenteWhatsApp.abiertosWA).length} de {asistenteWhatsApp.pacientes.length} chats abiertos
                </span>
                <button
                  type="button"
                  onClick={() => setAsistenteWhatsApp({ abierto: false, pacientes: [], abiertosWA: {} })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Listo / Finalizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
