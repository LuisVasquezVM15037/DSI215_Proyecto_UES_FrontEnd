import React from 'react';
import { ESTADOS_HALLAZGO_OPCIONES, ESTADO_HALLAZGO } from '../constants/estados.constants';
import { HALLAZGO_ESTADO_CONFIG } from '../utils/cita.utils';

/**
 * Lista de hallazgos registrados en el odontograma con estado editable y eliminación.
 */
const HallazgosList = ({ hallazgos, onCambiarEstado, onEliminar }) => {
  if (!hallazgos?.length) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <h6 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Hallazgos Registrados ({hallazgos.length})
        </h6>
        <span className="text-[10px] text-slate-400">Pieza / Tratamiento / Estado</span>
      </div>

      <div className="space-y-2">
        {hallazgos.map(h => {
          const esFinal = [ESTADO_HALLAZGO.COMPLETADO, ESTADO_HALLAZGO.CANCELADO].includes(h.estadoPlan);
          const estadoConf = HALLAZGO_ESTADO_CONFIG[h.estadoPlan] ?? HALLAZGO_ESTADO_CONFIG.OTRO;

          return (
            <div
              key={h.idPlanTratamiento}
              className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200/80
                         rounded-2xl hover:border-slate-300 transition-colors"
            >
              {/* Badge de Pieza FDI */}
              <div className="px-2.5 py-1 rounded-xl bg-primary-100 text-primary-800 text-xs font-extrabold flex-shrink-0">
                P.{h.piezaDental}
              </div>

              {/* Nombre del tratamiento */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {h.nombreTratamiento}
                </p>
                {h.costoTratamiento && (
                  <p className="text-[10px] text-slate-400 font-semibold">
                    ${Number(h.costoTratamiento).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Selector de estado */}
              <select
                value={h.estadoPlan}
                onChange={e => onCambiarEstado(h.idPlanTratamiento, e.target.value)}
                disabled={esFinal}
                aria-label={`Estado hallazgo pieza ${h.piezaDental}`}
                className={`text-xs px-2.5 py-1 rounded-xl font-bold border-0 outline-none
                            cursor-pointer disabled:cursor-default transition-all
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
                  aria-label={`Eliminar hallazgo pieza ${h.piezaDental}`}
                  title="Eliminar hallazgo"
                  className="w-7 h-7 flex items-center justify-center text-slate-400
                             hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors flex-shrink-0 cursor-pointer"
                >
                  <i className="bi bi-trash text-xs" />
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
