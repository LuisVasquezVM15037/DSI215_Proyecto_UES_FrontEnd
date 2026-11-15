import React, { useState } from 'react';
import { ESTADOS_HALLAZGO_OPCIONES, ESTADO_HALLAZGO } from '../constants/estados.constants';
import { HALLAZGO_ESTADO_CONFIG } from '../utils/cita.utils';
import ModalEvidenciasProcedimiento from './consulta/ModalEvidenciasProcedimiento';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Lista de hallazgos y procedimientos registrados en el odontograma y consulta.
 * Permite al usuario:
 *   - Ver cada hallazgo con su pieza dental o indicación general.
 *   - Ver y adjuntar fotos clínicas de evidencia (Punto 7).
 *   - Cambiar el estado de un hallazgo (ej: Pendiente → Completado).
 *   - Eliminar un hallazgo si aún no está en estado final.
 */
const HallazgosList = ({ hallazgos, onCambiarEstado, onEliminar }) => {
  const [evidenciaPlan, setEvidenciaPlan] = useState(null);

  if (!hallazgos?.length) return null;

  return (
    <div className="mt-4 px-1">
      {/* Encabezado de la sección con contador de hallazgos */}
      <h6 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Procedimientos y Hallazgos registrados ({hallazgos.length})
      </h6>

      {/* Lista de hallazgos con separación uniforme entre items */}
      <div className="space-y-2">
        {hallazgos.map(h => {
          const esFinal = [ESTADO_HALLAZGO.COMPLETADO, ESTADO_HALLAZGO.CANCELADO].includes(h.estadoPlan);
          const estadoConf = HALLAZGO_ESTADO_CONFIG[h.estadoPlan] ?? HALLAZGO_ESTADO_CONFIG.OTRO;

          return (
            <div
              key={h.idPlanTratamiento}
              className="flex items-center gap-2 p-2.5 bg-white border border-slate-100
                         rounded-xl hover:border-slate-200 transition-colors"
            >
              {/* Badge de Pieza dental o General */}
              <span className={`text-center text-xs font-bold rounded-lg py-1 px-2 flex-shrink-0 ${
                h.piezaDental
                  ? 'w-14 text-primary-700 bg-primary-50'
                  : 'text-teal-700 bg-teal-50'
              }`}>
                {h.piezaDental ? `P.${h.piezaDental}` : 'General'}
              </span>

              {/* Nombre del tratamiento */}
              <span className="flex-1 text-sm text-slate-700 font-medium truncate min-w-0">
                {h.nombreTratamiento}
              </span>

              {/* Botón de Evidencias / Fotos Clínicas (Punto 7) */}
              <button
                type="button"
                onClick={() => setEvidenciaPlan(h)}
                title="Ver y adjuntar fotos clínicas de evidencia"
                className="px-2 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex-shrink-0"
              >
                <i className="bi bi-camera" />
                <span className="hidden sm:inline">Fotos</span>
              </button>

              {/* Select de estado */}
              <select
                value={h.estadoPlan}
                onChange={e => onCambiarEstado(h.idPlanTratamiento, e.target.value)}
                disabled={esFinal}
                aria-label={`Estado de hallazgo pieza ${h.piezaDental || 'general'}`}
                className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium outline-none
                            cursor-pointer disabled:cursor-default transition-colors
                            focus:ring-2 focus:ring-primary-500 ${estadoConf.tw}`}
              >
                {ESTADOS_HALLAZGO_OPCIONES.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>

              {/* Botón eliminar */}
              {!esFinal && (
                <button
                  type="button"
                  onClick={() => onEliminar(h.idPlanTratamiento)}
                  aria-label={`Eliminar hallazgo pieza ${h.piezaDental || 'general'}`}
                  className="w-7 h-7 flex items-center justify-center text-slate-400
                             hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
                >
                  <i className="bi bi-x text-sm" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Evidencias Clínicas */}
      {evidenciaPlan && (
        <ModalEvidenciasProcedimiento
          isOpen={Boolean(evidenciaPlan)}
          onClose={() => setEvidenciaPlan(null)}
          procedimiento={evidenciaPlan}
        />
      )}
    </div>
  );
};

export default HallazgosList;
