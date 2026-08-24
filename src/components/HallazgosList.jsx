import React from 'react';
import { ESTADOS_HALLAZGO_OPCIONES, ESTADO_HALLAZGO } from '../constants/estados.constants';
import { HALLAZGO_ESTADO_CONFIG } from '../utils/cita.utils';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Lista de hallazgos registrados en el odontograma.
 * * Permite al usuario:
 *   - Ver cada hallazgo con su pieza dental y tratamiento asociado.
 *   - Cambiar el estado de un hallazgo (ej: Pendiente → Completado).
 *   - Eliminar un hallazgo si aún no está en estado final.
 */

//Hallazgo> Lista de hallazgos registrados en el odontograma
//onCambiarEstado> Función para cambiar el estado de un hallazgo
//onEliminar> Función para eliminar un hallazgo

//Los colores del select de estado vienen de HALLAZGO_ESTADO_CONFIG en 'utils/cita.utils.js'
//Las opciones del select de estado vienen de ESTADOS_HALLAZGO_OPCIONES en 'constants/estados.constants.js'.

//Un hallazgo se considera en estado final si su estado es COMPLETADO o CANCELADO, en cuyo caso no se puede cambiar su estado ni eliminarlo.
const HallazgosList = ({ hallazgos, onCambiarEstado, onEliminar }) => {
  // Si no hay hallazgos, no renderiza el componente.
  if (!hallazgos?.length) return null;

  return (
    <div className="mt-4 px-1">
      {/* Encabezado de la sección con contador de hallazgos */}
      <h6 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Hallazgos registrados ({hallazgos.length})
      </h6>
       {/* Lista de hallazgos con separación uniforme entre items */}
      <div className="space-y-2">
        {/* Itera sobre cada hallazgo para mostrar su información y controles asociados */}
        {hallazgos.map(h => {
          {/*Si `esFinal` es true, se deshabilitan el select y el botón de eliminación. */}
          const esFinal = [ESTADO_HALLAZGO.COMPLETADO, ESTADO_HALLAZGO.CANCELADO].includes(h.estadoPlan);
          // Si el estado no está en el mapa, usa el config de 'OTRO' como fallback.
          const estadoConf = HALLAZGO_ESTADO_CONFIG[h.estadoPlan] ?? HALLAZGO_ESTADO_CONFIG.OTRO;

          return (
            // Fila individual de hallazgo con diseño flex para alinear los elementos horizontalmente y espacio entre ellos
            <div
              key={h.idPlanTratamiento}
              className="flex items-center gap-2 p-2.5 bg-white border border-slate-100
                         rounded-xl hover:border-slate-200 transition-colors"
            >
              {/*Badge de Pieza dental */}
              <span className="w-14 text-center text-xs font-bold text-primary-700
                               bg-primary-50 rounded-lg py-1 flex-shrink-0">
                P.{h.piezaDental}
              </span>

              {/* Nombre del tratamiento */}
              <span className="flex-1 text-sm text-slate-700 font-medium truncate min-w-0">
                {h.nombreTratamiento}
              </span>

              {/* Select de estado */}
              {/* Deshabilitado si el estado es final (COMPLETADO o CANCELADO).
                  Los colores del select cambian dinámicamente según `estadoConf.tw`. */}
              <select
                value={h.estadoPlan}
                onChange={e => onCambiarEstado(h.idPlanTratamiento, e.target.value)}
                disabled={esFinal}
                aria-label={`Estado de hallazgo pieza ${h.piezaDental}`}
                className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium outline-none
                            cursor-pointer disabled:cursor-default transition-colors
                            focus:ring-2 focus:ring-primary-500 ${estadoConf.tw}`}
              >
                {/* Opciones de estado para el select, mapeadas desde ESTADOS_HALLAZGO_OPCIONES. Cada opción tiene un valor y una etiqueta. */}
                {ESTADOS_HALLAZGO_OPCIONES.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>

              {/* Botón eliminar */}
              {!esFinal && (
                <button
                  type="button"
                  // Al hacer clic, se llama a la función `onEliminar` con el ID del plan de tratamiento del hallazgo.
                  onClick={() => onEliminar(h.idPlanTratamiento)}
                  // El botón está deshabilitado si el estado es final, y tiene estilos que cambian al pasar el mouse para indicar que es interactivo.
                  aria-label={`Eliminar hallazgo pieza ${h.piezaDental}`}
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
    </div>
  );
};

export default HallazgosList;
