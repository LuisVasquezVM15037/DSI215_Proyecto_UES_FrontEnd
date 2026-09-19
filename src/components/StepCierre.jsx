import React from 'react';
import Button from './ui/Button';

/**
 * Paso 4: Cierre exitoso de la consulta odontológica con resumen y emisión de comprobante/receta.
 */
const StepCierre = ({ cita, hallazgos = [], prescripcion, onVolver }) => {
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
                    flex-1 flex items-center justify-center p-8 animate-scale-in">
      <div className="text-center py-8 px-4 max-w-lg mx-auto">

        {/* Ícono de éxito con efecto de brillo */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl shadow-md shadow-emerald-500/10">
            <i className="bi bi-check-lg" />
          </div>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-white" />
        </div>

        {/* Título y mensaje */}
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-display mb-2">
          Consulta Finalizada con Éxito
        </h2>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6">
          Los datos clínicos, diagnóstico, hallazgos en odontograma y prescripciones han sido archivados en el expediente de{' '}
          <strong className="text-slate-800 font-bold">{cita.nombreCompletoPaciente}</strong>.
        </p>

        {/* Tarjetas de resumen métrico */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 text-primary-700
                          rounded-2xl border border-primary-100/80">
            <i className="bi bi-diagram-3 text-base" />
            <span className="text-xs font-bold">{hallazgos.length} Hallazgos</span>
          </div>

          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700
                          rounded-2xl border border-emerald-100/80">
            <i className="bi bi-capsule text-base" />
            <span className="text-xs font-bold">{prescripcion?.detalles?.length ?? 0} Medicamentos</span>
          </div>
        </div>

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
