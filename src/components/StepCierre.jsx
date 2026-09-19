import React, { useState } from 'react';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import { createCita } from '../services/cita.service';
import { getHoyLocal } from '../utils/cita.utils';
import { alertSuccess, alertError, alertWarning } from '../utils/alert.utils';

/**
 * Paso 4: Cierre exitoso de la consulta odontológica.
 * Evalúa hallazgos completados y pendientes, permitiendo agendar una sesión posterior
 * antes de regresar al menú de selección de consultas.
 */
const StepCierre = ({ cita, hallazgos = [], prescripcion, onVolver }) => {
  const [showReprogramModal, setShowReprogramModal] = useState(false);
  const [showConfirmExitModal, setShowConfirmExitModal] = useState(false);
  const [sesionAgendada, setSesionAgendada] = useState(null);
  const [savingCita, setSavingCita] = useState(false);

  // Fecha sugerida: dentro de 7 días
  const getFechaSugerida = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    fechaCita: getFechaSugerida(),
    horaInicio: '09:00',
    horaFin: '10:00',
  });

  const hallazgosRealizados = (hallazgos ?? []).filter(h => {
    const st = String(h.estadoPlan || '').toUpperCase();
    return st === 'COMPLETADO' || st === 'FINALIZADO';
  });

  const hallazgosPendientes = (hallazgos ?? []).filter(h => {
    const st = String(h.estadoPlan || '').toUpperCase();
    return st !== 'COMPLETADO' && st !== 'FINALIZADO' && st !== 'CANCELADO';
  });

  const handleAgendarSesion = async () => {
    if (!formData.fechaCita || !formData.horaInicio || !formData.horaFin) {
      alertWarning('Completa la fecha y el horario de la próxima cita.');
      return;
    }
    setSavingCita(true);
    try {
      const payload = {
        idPaciente: cita.idPaciente,
        idOdontologo: cita.idOdontologo,
        fechaCita: formData.fechaCita,
        horaInicioCita: `${formData.fechaCita}T${formData.horaInicio}:00`,
        horaFinCita: `${formData.fechaCita}T${formData.horaFin}:00`,
        estadoCita: 'PROGRAMADA',
      };
      await createCita(payload);
      setSesionAgendada({
        fechaCita: formData.fechaCita,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
      });
      setShowReprogramModal(false);
      alertSuccess(
        'Sesión posterior agendada',
        `Se programó la próxima cita para el ${formData.fechaCita} a las ${formData.horaInicio}.`
      );
    } catch (err) {
      alertError(err.message || 'Error al agendar la sesión posterior.');
    } finally {
      setSavingCita(false);
    }
  };

  const handleIntentarVolver = () => {
    if (hallazgosPendientes.length > 0 && !sesionAgendada) {
      setShowConfirmExitModal(true);
    } else {
      onVolver();
    }
  };

  const imprimirReceta = () => {
    const detallesReceta = prescripcion?.detalles?.map((med, index) => `
      <tr>
        <td style="text-align: center; font-weight: bold; color: #64748b;">${index + 1}</td>
        <td><strong>${med.nombreMedicamento || ''}</strong></td>
        <td>${med.dosis || 'Dosis indicada'}</td>
        <td>${med.frecuencia || 'Según indicación'}</td>
        <td>${med.duracion ? `${med.duracion} días` : '-'}</td>
        <td style="font-style: italic; color: #475569;">${med.indicaciones || 'Ninguna'}</td>
      </tr>
    `).join('');

    const contenido = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Receta Médica — ${cita.nombreCompletoPaciente}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 30px; color: #1e293b; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .title { font-size: 20px; font-weight: 800; color: #0369a1; margin: 0; }
            .subtitle { font-size: 11px; color: #64748b; margin-top: 3px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 25px; font-size: 13px; }
            .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background: #f1f5f9; color: #334155; font-weight: bold; text-align: left; padding: 10px 8px; border-bottom: 1px solid #cbd5e1; }
            td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; }
            .signature { margin-top: 60px; display: flex; justify-content: flex-end; }
            .sig-line { border-top: 1px solid #94a3b8; width: 220px; text-align: center; padding-top: 8px; font-size: 12px; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">DentalCare Clínica Odontológica</h1>
              <div class="subtitle">Expediente Clínico y Recetario Médico Digital</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              Fecha: ${new Date().toLocaleDateString('es-SV')}<br />
              Hora: ${new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <strong>Paciente:</strong> ${cita.nombreCompletoPaciente}<br />
              <strong>DUI:</strong> ${cita.numeroIdentidadPaciente || 'No especificado'}
            </div>
            <div class="info-box">
              <strong>Especialista:</strong> ${cita.especialidadOdontologo || 'Odontólogo General'}<br />
              <strong>Estado:</strong> Consulta Finalizada
            </div>
          </div>

          <h3 style="font-size: 14px; color: #0f172a; margin-bottom: 5px;">Medicamentos Prescritos</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Medicamento</th>
                <th>Dosis</th>
                <th>Frecuencia</th>
                <th>Duración</th>
                <th>Instrucciones</th>
              </tr>
            </thead>
            <tbody>
              ${detallesReceta || '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">No se registraron medicamentos en esta consulta.</td></tr>'}
            </tbody>
          </table>

          <div class="signature">
            <div class="sig-line">
              Firma y Sello del Odontólogo<br />
              <strong>DentalCare ERP</strong>
            </div>
          </div>
        </body>
      </html>
    `;

    const nuevaVentana = window.open('', '_blank');
    if (nuevaVentana) {
      nuevaVentana.document.write(contenido);
      nuevaVentana.document.close();
      nuevaVentana.focus();
      nuevaVentana.print();
      nuevaVentana.close();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card mt-2
                    flex-1 flex items-center justify-center p-6 md:p-8 overflow-y-auto animate-scale-in">
      <div className="text-center py-4 px-2 max-w-xl mx-auto w-full">

        {/* Ícono de éxito con efecto de brillo */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl md:text-4xl shadow-md shadow-emerald-500/10">
            <i className="bi bi-check-lg" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-emerald-500 ring-4 ring-white" />
        </div>

        {/* Título y mensaje */}
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight font-display mb-2">
          Consulta Finalizada con Éxito
        </h2>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6">
          Los datos clínicos, diagnóstico y procedimientos de{' '}
          <strong className="text-slate-800 font-bold">{cita.nombreCompletoPaciente}</strong> han sido archivados con éxito.
        </p>

        {/* Tarjetas de resumen métrico */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="flex flex-col items-center justify-center p-3 bg-emerald-50 text-emerald-700
                          rounded-2xl border border-emerald-100/80">
            <span className="text-lg font-extrabold">{hallazgosRealizados.length}</span>
            <span className="text-[11px] font-bold">Realizados</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-amber-50 text-amber-700
                          rounded-2xl border border-amber-100/80">
            <span className="text-lg font-extrabold">{hallazgosPendientes.length}</span>
            <span className="text-[11px] font-bold">Pendientes</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-sky-50 text-sky-700
                          rounded-2xl border border-sky-100/80">
            <span className="text-lg font-extrabold">{prescripcion?.detalles?.length ?? 0}</span>
            <span className="text-[11px] font-bold">Medicamentos</span>
          </div>
        </div>

        {/* Banner de tratamientos pendientes y opción de sesión posterior */}
        {hallazgosPendientes.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                <i className="bi bi-calendar-event" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-amber-900">
                  Tratamientos pendientes de finalizar ({hallazgosPendientes.length})
                </h4>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  El paciente aún cuenta con procedimientos en su plan de tratamiento.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {hallazgosPendientes.map(h => (
                    <span
                      key={h.idPlanTratamiento}
                      className="px-2 py-0.5 rounded-lg bg-white border border-amber-200 text-[10px] font-bold text-amber-800 shadow-2xs"
                    >
                      P.{h.piezaDental} · {h.nombreTratamiento}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {sesionAgendada ? (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <i className="bi bi-check-circle-fill text-emerald-600" />
                <span>Próxima sesión agendada para el {sesionAgendada.fechaCita} ({sesionAgendada.horaInicio} - {sesionAgendada.horaFin})</span>
              </div>
            ) : (
              <div className="mt-3.5 flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowReprogramModal(true)}
                  icon={<i className="bi bi-calendar-plus" />}
                >
                  Agendar Sesión Posterior
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Acciones principales */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={imprimirReceta}
            icon={<i className="bi bi-printer" />}
          >
            Imprimir Receta Médica
          </Button>

          <Button
            fullWidth
            onClick={handleIntentarVolver}
            icon={<i className="bi bi-house" />}
          >
            Volver a Consultas
          </Button>
        </div>

      </div>

      {/* ── MODAL DE AGENDAR SESIÓN POSTERIOR ─────────────────────────────── */}
      <Modal
        isOpen={showReprogramModal}
        onClose={() => setShowReprogramModal(false)}
        title="Agendar Sesión Posterior"
        subtitle={`Paciente: ${cita.nombreCompletoPaciente}`}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowReprogramModal(false)}
              disabled={savingCita}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAgendarSesion}
              loading={savingCita}
              icon={<i className="bi bi-check2-circle" />}
            >
              Confirmar y Agendar Cita
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
            <p className="text-slate-700">
              <strong className="font-bold">Especialista:</strong> {cita.nombreCompletoOdontologo || 'Odontólogo Asignado'}
            </p>
            <p className="text-slate-500 text-[11px]">
              <strong className="font-bold text-slate-700">Procedimientos a Continuar:</strong>{' '}
              {hallazgosPendientes.map(h => `P.${h.piezaDental} (${h.nombreTratamiento})`).join(', ')}
            </p>
          </div>

          <Input
            type="date"
            label="Fecha de la Próxima Sesión"
            required
            min={getHoyLocal()}
            value={formData.fechaCita}
            onChange={e => setFormData(p => ({ ...p, fechaCita: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="time"
              label="Hora de Inicio"
              required
              value={formData.horaInicio}
              onChange={e => setFormData(p => ({ ...p, horaInicio: e.target.value }))}
            />

            <Input
              type="time"
              label="Hora de Fin"
              required
              value={formData.horaFin}
              onChange={e => setFormData(p => ({ ...p, horaFin: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      {/* ── DIÁLOGO PREVENTIVO ANTES DE SALIR SI QUEDAN PROCEDIMIENTOS PENDIENTES ── */}
      <Modal
        isOpen={showConfirmExitModal}
        onClose={() => setShowConfirmExitModal(false)}
        title="Tratamientos Pendientes de Finalizar"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowConfirmExitModal(false);
                onVolver();
              }}
            >
              Salir al Menú
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowConfirmExitModal(false);
                setShowReprogramModal(true);
              }}
              icon={<i className="bi bi-calendar-plus" />}
            >
              Agendar Sesión
            </Button>
          </>
        }
      >
        <div className="text-center py-2 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl mx-auto mb-2">
            <i className="bi bi-calendar-week" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            El paciente <strong className="text-slate-800 font-bold">{cita.nombreCompletoPaciente}</strong> aún tiene{' '}
            <strong className="text-amber-700 font-extrabold">{hallazgosPendientes.length} procedimiento(s) pendientes</strong> en su plan de tratamiento.
          </p>
          <p className="text-[11px] text-slate-400">
            ¿Deseas agendar la próxima sesión médica antes de volver al menú de consultas?
          </p>
        </div>
      </Modal>

    </div>
  );
};

export default StepCierre;

