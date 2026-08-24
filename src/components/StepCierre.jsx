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

const StepCierre = ({ cita, hallazgos, prescripcion, onVolver }) => {
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
          <p><strong>Fecha:</strong> ${new Date(cita.fechaHora).toLocaleString()}</p>
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
                    flex-1 flex items-center justify-center animate-fade-in">
      <div className="text-center py-12 px-8 max-w-md">

        {/* Ícono de éxito */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center
                        mx-auto mb-6">
          <i className="bi bi-check-circle-fill text-emerald-500 text-5xl" />
        </div>
    {/*Título y mensaje de cierre */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Consulta Finalizada</h2>
        <p className="text-slate-500 text-sm mb-6">
          El diagnóstico, hallazgos y prescripción han sido guardados en el expediente de{' '}
          <strong className="text-slate-700">{cita.nombreCompletoPaciente}</strong>.
        </p>

        {/* Resumen de lo registrado */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-sky-50 text-sky-700
                          rounded-full text-sm font-semibold">
            <i className="bi bi-tooth text-xs" />
            {/*Si no hay hallazgos, mostrar 0 */}
            {hallazgos.length} Hallazgos
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700
                          rounded-full text-sm font-semibold">
            <i className="bi bi-capsule text-xs" />
            {/*Si no hay prescripción, mostrar 0 */}
            {prescripcion?.detalles?.length ?? 0} Medicamentos
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          {/* Botón para imprimir solo la receta */}
          <Button
            variant="outline"
            onClick={imprimirReceta}
            icon={<i className="bi bi-printer" />}
          >
            Imprimir Receta
          </Button>
          {/* Botón para volver a la pantalla de consultas, llamando a la función onVolver pasada como prop */}
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
