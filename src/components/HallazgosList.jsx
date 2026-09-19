import React, { useMemo } from 'react';
import { ESTADOS_HALLAZGO_OPCIONES, ESTADO_HALLAZGO } from '../constants/estados.constants';
import { HALLAZGO_ESTADO_CONFIG } from '../utils/cita.utils';

/**
 * Lista de hallazgos registrados en el odontograma con filtro de vista, subtotal y acciones rápidas.
 */
const HallazgosList = ({
  hallazgos = [],
  onCambiarEstado,
  onEliminar,
  activeFilter = 'Hallazgos',
  totalSinFiltrar = 0,
  onResetFilter,
}) => {
  const subtotal = useMemo(() => {
    return hallazgos.reduce((acc, h) => {
      const costo = Number(h.costoAplicado ?? h.costoTratamiento) || 0;
      return acc + costo;
    }, 0);
  }, [hallazgos]);

  if (hallazgos.length === 0) {
    if (totalSinFiltrar > 0) {
      return (
        <div className="py-4 px-3 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 mt-2">
          <p className="text-xs font-semibold text-slate-600 mb-1">
            No hay procedimientos en vista <span className="font-bold text-primary-700">"{activeFilter}"</span>
          </p>
          <p className="text-[11px] text-slate-400 mb-2">
            Existen {totalSinFiltrar} hallazgo(s) registrados en otros estados.
          </p>
          {onResetFilter && (
            <button
              type="button"
              onClick={onResetFilter}
              className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-primary-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              Ver todos los hallazgos ({totalSinFiltrar})
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="py-4 px-3 text-center text-slate-400 text-xs italic">
        Aún no se han registrado hallazgos clínicos para esta evaluación.
      </div>
    );
  }

  const tituloFiltro = {
    Hallazgos: 'Todos los Hallazgos',
    Presupuestado: 'Procedimientos Presupuestados',
    Programado: 'Procedimientos Programados',
    Realizado: 'Procedimientos Realizados',
  }[activeFilter] ?? `Hallazgos (${activeFilter})`;

  return (
    <div className="mt-2 space-y-2">
      {/* Header con resumen y subtotal monetario */}
      <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100">
        <div>
          <h6 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>{tituloFiltro}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-100 text-primary-800">
              {hallazgos.length} {activeFilter !== 'Hallazgos' && totalSinFiltrar ? `de ${totalSinFiltrar}` : ''}
            </span>
          </h6>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1.5">Subtotal:</span>
          <span className="text-xs font-extrabold text-slate-800 font-mono">
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Lista de tarjetas de hallazgos */}
      <div className="space-y-2">
        {hallazgos.map(h => {
          const st = String(h.estadoPlan || 'PENDIENTE').toUpperCase();
          const esFinal = [ESTADO_HALLAZGO.COMPLETADO, ESTADO_HALLAZGO.CANCELADO].includes(st);
          const estadoConf = HALLAZGO_ESTADO_CONFIG[st] ?? HALLAZGO_ESTADO_CONFIG.OTRO;
          const costo = Number(h.costoAplicado ?? h.costoTratamiento) || 0;

          return (
            <div
              key={h.idPlanTratamiento}
              className="flex items-center justify-between gap-2 p-2.5 bg-white border border-slate-200/80
                         rounded-2xl hover:border-slate-300 transition-all shadow-xs"
            >
              {/* Pieza Dental FDI y Datos del Tratamiento */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="px-2.5 py-1 rounded-xl bg-primary-50 text-primary-800 border border-primary-200/60 text-xs font-extrabold flex-shrink-0">
                  P.{h.piezaDental}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {h.nombreTratamiento}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold font-mono">
                    ${costo.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Acciones y selector de estado */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Botón de acción rápida si está pendiente o programado */}
                {st === 'PENDIENTE' && (
                  <button
                    type="button"
                    onClick={() => onCambiarEstado(h.idPlanTratamiento, 'COMPLETADO')}
                    title="Marcar inmediatamente como Realizado"
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold
                               bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/60 cursor-pointer"
                  >
                    <i className="bi bi-check2" />
                    <span>Realizar</span>
                  </button>
                )}

                {/* Selector de estado oficial */}
                <select
                  value={st}
                  onChange={e => onCambiarEstado(h.idPlanTratamiento, e.target.value)}
                  disabled={esFinal}
                  aria-label={`Estado hallazgo pieza ${h.piezaDental}`}
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-bold border-0 outline-none
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
                               hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                  >
                    <i className="bi bi-trash text-xs" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HallazgosList;
