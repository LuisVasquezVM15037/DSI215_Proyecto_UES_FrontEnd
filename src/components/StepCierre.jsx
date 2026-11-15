import React, { useState } from 'react';
import Button from './ui/Button';
import ModalAgendarSiguienteCita from './consulta/ModalAgendarSiguienteCita';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Paso 4: Cierre y Resumen Clínico de la Consulta (Punto 5).
 * - Resumen visual de procedimientos realizados y pendientes.
 * - Bloqueo estricto de finalización si quedan procedimientos pendientes sin reagendar.
 * - Impresión de receta médica.
 */
const StepCierre = ({
  cita,
  hallazgos = [],
  prescripcion,
  onVolver,
  onAgendarSiguiente,
}) => {
  const [reagendadoConfirmado, setReagendadoConfirmado] = useState(false);
  const [modalReagendarOpen, setModalReagendarOpen] = useState(false);
  const [citaAgendada, setCitaAgendada] = useState(null);

  // Clasificación de procedimientos
  const hallazgosRealizados = hallazgos.filter(
    h => ['COMPLETADO', 'FINALIZADO'].includes(h.estadoPlan?.toUpperCase())
  );
  const hallazgosPendientes = hallazgos.filter(
    h => !['COMPLETADO', 'FINALIZADO', 'CANCELADO'].includes(h.estadoPlan?.toUpperCase())
  );

  const tienePendientes = hallazgosPendientes.length > 0;
  const puedeCerrar = !tienePendientes || reagendadoConfirmado;

  const handleReagendarClick = () => {
    setModalReagendarOpen(true);
  };

  // Función para imprimir receta médica
  const imprimirReceta = () => {
    const detallesReceta = prescripcion?.detalles?.map((med, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${med.nombreMedicamento || ''}</strong></td>
        <td>${med.dosis || ''}</td>
        <td>${med.frecuencia || ''}</td>
        <td>${med.duracion || ''} días</td>
        <td>${med.indicaciones || 'Según prescripción médica'}</td>
      </tr>
    `).join('');

    const contenido = `
      <html>
        <head>
          <title>Receta Médica - ${cita?.nombreCompletoPaciente || 'Paciente'}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1e293b; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
            h1 { font-size: 22px; color: #0369a1; margin: 0 0 4px 0; }
            .meta { font-size: 13px; color: #64748b; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background: #f8fafc; color: #334155; font-weight: bold; }
            .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DentalCare ERP — Prescripción Odontológica</h1>
            <div class="meta">
              <p><strong>Paciente:</strong> ${cita?.nombreCompletoPaciente || 'Paciente'}</p>
              <p><strong>Fecha de Emisión:</strong> ${new Date(cita?.fechaHora || cita?.fechaCita || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicamento</th>
                <th>Dosis</th>
                <th>Frecuencia</th>
                <th>Duración</th>
                <th>Indicaciones</th>
              </tr>
            </thead>
            <tbody>
              ${detallesReceta || '<tr><td colspan="6" style="text-align:center;">No se registraron medicamentos.</td></tr>'}
            </tbody>
          </table>
          <div class="footer">
            Documento emitido electrónicamente desde la plataforma DentalCare ERP. Válido para control y despacho en farmacia.
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card mt-4 flex-1 overflow-y-auto animate-fade-in p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Encabezado y felicitación */}
        <div className="text-center pb-2">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
            <i className="bi bi-clipboard2-check-fill text-emerald-600 text-3xl" />
          </div>
          <h2 className="text-xl font-black text-slate-800">Resumen y Cierre de Consulta</h2>
          <p className="text-slate-500 text-xs mt-1">
            Expediente clínico de <strong className="text-slate-700">{cita?.nombreCompletoPaciente}</strong> actualizado correctamente.
          </p>
        </div>

        {/* ── RESUMEN VISUAL DE PROCEDIMIENTOS (PUNTO 5) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Procedimientos Realizados en esta sesión */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-emerald-200/60 pb-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <i className="bi bi-check2-circle text-emerald-600 text-base"></i>
                Procedimientos Realizados ({hallazgosRealizados.length})
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-800">
                Sesión Actual
              </span>
            </div>

            {hallazgosRealizados.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">
                No se marcaron procedimientos como realizados en esta consulta.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {hallazgosRealizados.map((h) => (
                  <div
                    key={h.idPlanTratamiento}
                    className="p-2.5 bg-white rounded-xl border border-emerald-200/70 text-xs flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {h.piezaDental ? `Pieza FDI #${h.piezaDental}` : 'Procedimiento General'}
                      </span>
                      <span className="text-[11px] text-slate-500">{h.nombreTratamiento}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Realizado
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Procedimientos Pendientes / En Plan */}
          <div className={`border rounded-2xl p-4 shadow-xs transition-colors ${
            tienePendientes
              ? 'border-amber-300 bg-amber-50/50'
              : 'border-slate-200 bg-slate-50/50'
          }`}>
            <div className="flex items-center justify-between mb-3 border-b border-amber-200/60 pb-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <i className="bi bi-hourglass-split text-amber-600 text-base"></i>
                Procedimientos Pendientes ({hallazgosPendientes.length})
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                tienePendientes ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {tienePendientes ? 'Requiere Cita' : 'Completos'}
              </span>
            </div>

            {hallazgosPendientes.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">
                ¡Excelente! Todos los procedimientos previstos fueron completados.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {hallazgosPendientes.map((h) => (
                  <div
                    key={h.idPlanTratamiento}
                    className="p-2.5 bg-white rounded-xl border border-amber-200 text-xs flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {h.piezaDental ? `Pieza FDI #${h.piezaDental}` : 'Procedimiento General'}
                      </span>
                      <span className="text-[11px] text-slate-500">{h.nombreTratamiento}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      Pendiente
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── REGLA DE NEGOCIO: OBLIGATORIEDAD DE REAGENDAMIENTO (PUNTO 5) ── */}
        {tienePendientes && (
          <div className={`p-4 rounded-2xl border text-xs transition-all ${
            reagendadoConfirmado
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base ${
                reagendadoConfirmado ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                <i className={`bi ${reagendadoConfirmado ? 'bi-calendar-check-fill' : 'bi-exclamation-octagon-fill'}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <strong className="font-bold block text-sm mb-0.5">
                  {reagendadoConfirmado
                    ? 'Próxima cita coordinada'
                    : 'Reagendamiento Obligatorio por Procedimientos Pendientes'}
                </strong>
                <p className="text-[11px] leading-relaxed mb-3">
                  {reagendadoConfirmado
                    ? (citaAgendada 
                        ? `Próxima cita programada exitosamente para el ${citaAgendada.fechaCita} (${citaAgendada.horaInicio} - ${citaAgendada.horaFin}). Ya puedes finalizar la consulta.`
                        : 'Se ha coordinado la sesión de seguimiento. Ya puedes dar por concluida la atención y volver a la consola.')
                    : `El paciente tiene ${hallazgosPendientes.length} procedimiento(s) pendiente(s). Para garantizar la continuidad clínica, el sistema exige agendar la próxima cita antes de salir.`}
                </p>

                {!reagendadoConfirmado && (
                  <button
                    type="button"
                    onClick={handleReagendarClick}
                    className="py-2 px-3.5 rounded-xl font-bold text-xs bg-rose-700 text-white hover:bg-rose-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer animate-pulse"
                  >
                    <i className="bi bi-calendar-plus-fill"></i>
                    <span>Reagendar Próxima Cita Ahora</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resumen de Prescripción */}
        {prescripcion?.detalles?.length > 0 && (
          <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl text-xs flex items-center justify-between text-sky-900">
            <div className="flex items-center gap-2">
              <i className="bi bi-capsule text-sky-600 text-base"></i>
              <span>Receta emitida con <strong>{prescripcion.detalles.length} medicamento(s)</strong>.</span>
            </div>
            <button
              type="button"
              onClick={imprimirReceta}
              className="text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer"
            >
              Imprimir Receta
            </button>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={imprimirReceta}
            icon={<i className="bi bi-printer" />}
          >
            Imprimir Receta
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant={puedeCerrar ? 'primary' : 'disabled'}
              disabled={!puedeCerrar}
              onClick={onVolver}
              title={!puedeCerrar ? 'Debe reagendar la próxima cita antes de salir' : 'Finalizar y salir'}
              icon={<i className="bi bi-check2-all" />}
            >
              {puedeCerrar ? 'Concluir y Volver a Consultas' : 'Reagendamiento Pendiente'}
            </Button>
          </div>
        </div>

      </div>

      {/* Modal de Reagendamiento de Próxima Cita (Punto 5) */}
      {modalReagendarOpen && (
        <ModalAgendarSiguienteCita
          isOpen={modalReagendarOpen}
          onClose={() => setModalReagendarOpen(false)}
          cita={cita}
          hallazgosPendientes={hallazgosPendientes}
          onCitaAgendada={(nueva) => {
            setCitaAgendada(nueva);
            setReagendadoConfirmado(true);
          }}
        />
      )}
    </div>
  );
};

export default StepCierre;
