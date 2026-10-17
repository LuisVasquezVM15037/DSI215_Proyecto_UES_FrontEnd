import React from 'react';
import Button from './ui/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
Este componente representa el paso de cierre de la consulta médica en el proceso de atención. Muestra un resumen de los hallazgos y prescripción registrados, junto con un mensaje de éxito. Permite al médico imprimir solo la receta en una nueva ventana formateada para impresión, y también ofrece un botón para volver a la pantalla principal de consultas. El diseño es limpio y centrado, con íconos visuales para reforzar el mensaje de cierre exitoso.
 */

// Recibe la cita, hallazgos, prescripción y función para volver
//cita> { id, nombreCompletoPaciente, fechaHora }
//hallazgos> [{ idPlanTratamiento, nombreTratamiento, piezaDental }]
//prescripcion> { detalles: [{ idMedicamento, nombreMedicamento, dosis, frecuencia, duracion, indicaciones }] }
//onVolver> Callback al hacer click en el botón volver.

const StepCierre = ({ cita, hallazgos = [], prescripcion, onVolver, onAgendarSiguiente }) => {
  // Hallazgos pendientes que justifican reagendar una próxima sesión
  const hallazgosPendientes = hallazgos.filter(
    h => !['COMPLETADO', 'CANCELADO'].includes(h.estadoPlan?.toUpperCase())
  );
  const tienePendientes = hallazgosPendientes.length > 0;

  // Función para imprimir solo la receta, formateando los datos en una nueva ventana
  const imprimirReceta = () => {
    const detallesReceta = prescripcion?.detalles?.map((med, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${med.nombreMedicamento || ''}</td>
        <td>${med.dosis || ''}</td>
        <td>${med.frecuencia || ''}</td>
        <td>${med.duracion || ''}</td>
        <td>${med.indicaciones || ''}</td>
      </tr>
    `).join('');
    // Si no hay detalles, mostrar un mensaje en la tabla
    const contenido = `
      <html>
        <head>
          <title>Receta de ${cita.nombreCompletoPaciente}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { font-size: 20px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #aaa; padding: 8px; text-align: left; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Receta</h1>
          <p><strong>Paciente:</strong> ${cita.nombreCompletoPaciente}</p>
          <p><strong>Fecha:</strong> ${new Date(cita.fechaHora || cita.fechaCita || Date.now()).toLocaleString()}</p>
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
              ${detallesReceta || '<tr><td colspan="6">No hay medicamentos registrados.</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `;
    // Abrir una nueva ventana, escribir el contenido formateado, imprimir y cerrar la ventana
    const nuevaVentana = window.open('', '_blank');
    if (nuevaVentana) {
      nuevaVentana.document.write(contenido);
      nuevaVentana.document.close();
      nuevaVentana.focus();
      nuevaVentana.print();
      nuevaVentana.close();
    }
  };

  // Renderizado de la pantalla de cierre, mostrando resumen y opciones para imprimir o volver
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card mt-4
                    flex-1 flex items-center justify-center animate-fade-in p-6">
      <div className="text-center py-6 px-4 max-w-lg w-full">

        {/* Ícono de éxito */}
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center
                        mx-auto mb-4">
          <i className="bi bi-check-circle-fill text-emerald-500 text-4xl" />
        </div>

        {/* Título y mensaje de cierre */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Consulta Finalizada</h2>
        <p className="text-slate-500 text-sm mb-5">
          El expediente de <strong className="text-slate-700">{cita.nombreCompletoPaciente}</strong> ha sido actualizado correctamente.
        </p>

        {/* Resumen de lo registrado */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700
                          rounded-full text-xs font-semibold">
            <i className="bi bi-tooth text-xs" />
            {hallazgos.length} Procedimientos en plan
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700
                          rounded-full text-xs font-semibold">
            <i className="bi bi-capsule text-xs" />
            {prescripcion?.detalles?.length ?? 0} Medicamentos recetados
          </div>
        </div>

        {/* AVISO DE REAGENDACIÓN AUTOMÁTICA SI QUEDAN PROCEDIMIENTOS PENDIENTES */}
        {tienePendientes && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 mt-0.5">
                <i className="bi bi-calendar-event text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="text-sm font-bold text-amber-900 mb-1">
                  Procedimientos pendientes para otra cita ({hallazgosPendientes.length})
                </h6>
                <p className="text-xs text-amber-700 mb-2">
                  Quedan hallazgos/tratamientos sin completar en el plan de este paciente:
                </p>
                <div className="max-h-28 overflow-y-auto space-y-1 mb-3">
                  {hallazgosPendientes.map(h => (
                    <div key={h.idPlanTratamiento} className="text-xs text-amber-800 bg-white/70 px-2.5 py-1 rounded-lg border border-amber-200/50 flex justify-between items-center">
                      <span><strong>{h.piezaDental ? `Pieza ${h.piezaDental}` : 'General'}:</strong> {h.nombreTratamiento}</span>
                      <span className="font-semibold text-[11px] uppercase text-amber-600">{h.estadoPlan}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={onAgendarSiguiente}
                  icon={<i className="bi bi-calendar-plus" />}
                >
                  Agendar Próxima Cita Ahora
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          {/* Botón para imprimir solo la receta */}
          <Button
            variant="outline"
            onClick={imprimirReceta}
            icon={<i className="bi bi-printer" />}
          >
            Imprimir Receta
          </Button>
          {/* Botón para volver a la pantalla de consultas */}
          <Button
            onClick={onVolver}
            icon={<i className="bi bi-house" />}
          >
            Volver a Consultas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepCierre;
