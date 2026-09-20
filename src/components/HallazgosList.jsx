/**
 * Propósito:
 * Componente de lista y tabla interactiva de hallazgos clínicos registrados en el odontograma.
 * Despliega los procedimientos clasificados por pieza dental (FDI), calcula subtotales monetarios
 * en tiempo real según el filtro activo (Total, Presupuestado, Por Cobrar, Realizado), y provee
 * botones de acción rápida para transicionar el flujo de trabajo clínico (Presupuestar -> Programar -> Realizar).
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/HallazgosList.jsx'. Componente de dominio clínico dentro de la
 * capa de presentación del subsistema de consulta odontológica.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/components/StepOdontograma.jsx'
 * - Consume:
 *   - 'src/constants/estados.constants.js' ('ESTADOS_HALLAZGO_OPCIONES', 'ESTADO_HALLAZGO')
 *   - 'src/utils/cita.utils.js' ('HALLAZGO_ESTADO_CONFIG', 'getPrecioHallazgo')
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del componente.
 * @param {Array<Object>} [props.hallazgos=[]] - Conjunto de hallazgos filtrados a renderizar en la lista.
 * @param {(idPlan: number, nuevoEstado: string) => void} props.onCambiarEstado - Callback para actualizar el estado del procedimiento.
 * @param {(idPlan: number) => void} props.onEliminar - Callback para eliminar un hallazgo no ejecutado.
 * @param {'Hallazgos'|'Presupuestado'|'Programado'|'Realizado'} [props.activeFilter='Hallazgos'] - Filtro actualmente aplicado.
 * @param {number} [props.totalSinFiltrar=0] - Conteo total de hallazgos sin filtrar para estados vacíos condicionales.
 * @param {() => void} [props.onResetFilter] - Callback para restablecer la vista a todos los hallazgos.
 * @returns {JSX.Element} Lista interactiva de procedimientos con subtotal y botones de acción rápida.
 */

import React, { useMemo } from 'react';
import { ESTADOS_HALLAZGO_OPCIONES, ESTADO_HALLAZGO } from '../constants/estados.constants';
import { HALLAZGO_ESTADO_CONFIG, getPrecioHallazgo } from '../utils/cita.utils';

const HallazgosList = ({
  hallazgos = [],
  onCambiarEstado,
  onEliminar,
  activeFilter = 'Hallazgos',
  totalSinFiltrar = 0,
  onResetFilter,
}) => {
  // Cálculo memoizado de la suma económica total de los hallazgos en la vista actual
  const subtotal = useMemo(() => {
    return hallazgos.reduce((acc, h) => acc + getPrecioHallazgo(h), 0);
  }, [hallazgos]);

  // Manejo de estados vacíos según el contexto de filtrado
  if (hallazgos.length === 0) {
    if (totalSinFiltrar > 0) {
      return (
        <div className="py-4 px-3 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 mt-2">
          <p className="text-xs font-semibold text-slate-600 mb-1">
            No hay procedimientos en vista <span className="font-bold text-primary-700">"{activeFilter}"</span>
          </p>
          <p className="text-[11px] text-slate-400 mb-2">
            Existen {totalSinFiltrar} hallazgo(s) registrados en otros estados clínicos.
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

  // Título dinámico adaptado al propósito del filtro activo
  const tituloFiltro = {
    Hallazgos: 'Hallazgos Clínicos del Odontograma',
    Presupuestado: 'Procedimientos Presupuestados (Pendientes)',
    Programado: 'Procedimientos Programados para Cobro y Atención',
    Realizado: 'Procedimientos Realizados / Concluidos',
  }[activeFilter] ?? `Hallazgos (${activeFilter})`;

  // Etiqueta del balance económico adaptada al contexto analítico
  const subtotalLabel = {
    Hallazgos: 'Subtotal Hallazgos:',
    Presupuestado: 'Total Presupuestado:',
    Programado: 'Total a Cobrar en Consulta:',
    Realizado: 'Total Realizado:',
  }[activeFilter] ?? 'Subtotal:';

  return (
    <div className="mt-2 space-y-2">
      {/* Encabezado contextual con contador y sumatoria económica */}
      <div className="flex items-center justify-between px-1 pb-1.5 border-b border-slate-100 flex-wrap gap-2">
        <div>
          <h6 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>{tituloFiltro}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-100 text-primary-800">
              {hallazgos.length} {activeFilter !== 'Hallazgos' && totalSinFiltrar ? `de ${totalSinFiltrar}` : ''}
            </span>
          </h6>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1.5">{subtotalLabel}</span>
          <span className="text-xs font-extrabold text-slate-800 font-mono">
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Lista de filas/tarjetas con detalle de cada procedimiento dental */}
      <div className="space-y-2">
        {hallazgos.map(h => {
          const st = String(h.estadoPlan || 'PENDIENTE').toUpperCase();
          const esFinal = [ESTADO_HALLAZGO.COMPLETADO, ESTADO_HALLAZGO.CANCELADO].includes(st);
          const estadoConf = HALLAZGO_ESTADO_CONFIG[st] ?? HALLAZGO_ESTADO_CONFIG.OTRO;
          const costo = getPrecioHallazgo(h);
          const esPendiente = !['PROGRAMADO', 'EN_PROGRESO', 'COMPLETADO', 'FINALIZADO', 'CANCELADO'].includes(st);
          const esProgramado = st === 'PROGRAMADO' || st === 'EN_PROGRESO';

          return (
            <div
              key={h.idPlanTratamiento}
              className="flex items-center justify-between gap-2 p-2.5 bg-white border border-slate-200/80
                         rounded-2xl hover:border-slate-300 transition-all shadow-xs"
            >
              {/* Identificador de pieza dental según nomenclatura FDI y nombre del procedimiento */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="px-2.5 py-1 rounded-xl bg-primary-50 text-primary-800 border border-primary-200/60 text-xs font-extrabold flex-shrink-0">
                  P.{h.piezaDental}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {h.nombreTratamiento}
                  </p>
                  <p className="text-[11px] text-slate-600 font-semibold font-mono">
                    ${costo.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Botonera de acciones rápidas para transiciones del flujo de trabajo */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Paso 1: De Presupuestado a Programado para cobro/atención inmediata */}
                {esPendiente && (
                  <button
                    type="button"
                    onClick={() => onCambiarEstado(h.idPlanTratamiento, 'PROGRAMADO')}
                    title="Programar para atender y cobrar en esta consulta"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold
                               bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors border border-sky-200/60 cursor-pointer shadow-2xs"
                  >
                    <i className="bi bi-calendar-plus" />
                    <span>Programar</span>
                  </button>
                )}

                {/* Paso 2: De Programado a Realizado o reversión a Presupuestado */}
                {esProgramado && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onCambiarEstado(h.idPlanTratamiento, 'COMPLETADO')}
                      title="Marcar procedimiento como Realizado en esta cita"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold
                                 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <i className="bi bi-check2-circle" />
                      <span>Realizar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCambiarEstado(h.idPlanTratamiento, 'PENDIENTE')}
                      title="Desprogramar (regresar a Presupuestado)"
                      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-amber-700
                                 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                      aria-label="Regresar a presupuestado"
                    >
                      <i className="bi bi-arrow-counterclockwise text-xs" />
                    </button>
                  </div>
                )}

                {/* Paso 3: Indicador de procedimiento realizado exitosamente */}
                {st === 'COMPLETADO' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <i className="bi bi-check-circle-fill text-[10px]" />
                    <span>Realizado</span>
                  </span>
                )}

                {/* Selector complementario para ajustes administrativos o auditoría */}
                {!esFinal ? (
                  <select
                    value={st}
                    onChange={e => onCambiarEstado(h.idPlanTratamiento, e.target.value)}
                    aria-label={`Estado hallazgo pieza ${h.piezaDental}`}
                    className={`text-[11px] px-2.5 py-1 rounded-xl font-bold border-0 outline-none
                                cursor-pointer transition-all focus:ring-2 focus:ring-primary-500 ${estadoConf.tw}`}
                  >
                    {ESTADOS_HALLAZGO_OPCIONES.filter(opt => opt.value !== 'COMPLETADO').map(e => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                    <option value="COMPLETADO">Realizado (Completado)</option>
                  </select>
                ) : null}

                {/* Botón para eliminar el registro (bloqueado una vez completado o cancelado) */}
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

