/**
 * Propósito:
 * Componente principal de la Fase 2 de la consulta clínica (Odontograma Interactivo).
 * Integra la representación anatómica dental basada en el estándar internacional FDI,
 * suministra cuatro filtros analíticos (Hallazgos, Presupuestado, Programado, Realizado),
 * mapea dinámicamente las condiciones cromáticas sobre los gráficos vectoriales (SVG) de los dientes,
 * y hospeda el panel lateral para asignación de tratamientos y precios a las piezas seleccionadas.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/StepOdontograma.jsx'. Componente nuclear de dominio clínico dentro
 * de la capa de presentación de la consulta activa.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/ActiveConsultationPage.jsx'
 * - Consume:
 *   - 'react-odontogram' (librería gráfica de odontograma anatómico).
 *   - 'src/components/HallazgosList.jsx' (tabla interactiva de procedimientos filtrados).
 *   - 'src/components/TratamientoSelector.jsx' (dropdown de procedimientos y creación inline).
 *   - 'src/components/ui/Button.jsx' (botones de navegación y guardado).
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.cita - Objeto con los datos de la cita médica activa.
 * @param {Array<Object>} [props.hallazgos=[]] - Lista global de hallazgos registrados para la evaluación.
 * @param {(idPlan: number, estado: string) => void} props.onCambiarEstado - Callback para transicionar el estado del hallazgo.
 * @param {(idPlan: number) => void} props.onEliminarHallazgo - Callback para suprimir un hallazgo del plan.
 * @param {Array<Object>} props.tratamientos - Catálogo maestro de tratamientos clínicos disponibles.
 * @param {Array<Object>} props.selectedTeeth - Dientes marcados activamente en el diagrama interactivo.
 * @param {string} props.selectedTratamiento - Identificador del tratamiento seleccionado en el panel lateral.
 * @param {(id: string) => void} props.setSelectedTratamiento - Mutador del tratamiento seleccionado.
 * @param {string} props.customPrecio - Importe económico a aplicar al procedimiento seleccionado.
 * @param {(val: string) => void} props.setCustomPrecio - Mutador del importe del tratamiento.
 * @param {boolean} props.savingHallazgo - Indicador de guardado en red activo.
 * @param {(teeth: Array<Object>) => void} props.onOdontogramChange - Notificación emitida al hacer clic sobre piezas dentales.
 * @param {() => void} props.onRegistrarHallazgo - Callback para persistir los hallazgos en las piezas seleccionadas.
 * @param {(data: Object) => Promise<any>} [props.onCrearTratamiento] - Función para dar de alta nuevos tratamientos en catálogo.
 * @param {(data: Object) => Promise<any>} [props.onCrearNuevoTratamiento] - Alias alternativo para creación de tratamiento.
 * @param {() => void} props.onVolver - Retorno al Paso 1 (Evaluación).
 * @param {() => void} props.onContinuar - Avance al Paso 3 (Prescripción).
 * @returns {JSX.Element} Panel interactivo con odontograma anatómico, filtros y formulario lateral de asignación.
 */

import React, { useState, useMemo } from 'react';
import { Odontogram } from 'react-odontogram';
import 'react-odontogram/style.css';
import '../styles/odontograma.css';
import HallazgosList from './HallazgosList';
import TratamientoSelector from './TratamientoSelector';
import Button from './ui/Button';

// Definición de filtros de vista clínica para segmentar los procedimientos del odontograma
const FILTERS = [
  { id: 'Hallazgos',     label: 'Hallazgos',     icon: 'bi-grid-fill' },
  { id: 'Presupuestado', label: 'Presupuestado', icon: 'bi-receipt' },
  { id: 'Programado',    label: 'Programado',    icon: 'bi-calendar-event' },
  { id: 'Realizado',     label: 'Realizado',     icon: 'bi-check-circle-fill' },
];

const StepOdontograma = ({
  cita,
  hallazgos = [],
  onCambiarEstado,
  onEliminarHallazgo,
  tratamientos,
  selectedTeeth,
  selectedTratamiento,
  setSelectedTratamiento,
  customPrecio,
  setCustomPrecio,
  savingHallazgo,
  onOdontogramChange,
  onRegistrarHallazgo,
  onCrearTratamiento,
  onCrearNuevoTratamiento,
  onVolver,
  onContinuar,
}) => {
  const [activeFilter, setActiveFilter] = useState('Hallazgos');
  const piecesText = selectedTeeth.map(t => t.notations?.fdi || t.id).join(', ');
  const handleCrear = onCrearTratamiento || onCrearNuevoTratamiento;

  // Cálculo de conteos en tiempo real para cada pestaña según reglas de negocio
  const conteos = useMemo(() => {
    const lista = Array.isArray(hallazgos) ? hallazgos : [];
    const total = lista.length;

    // Presupuestados: procedimientos registrados que aún no están programados para cobro, en ejecución ni finalizados
    const presupuestado = lista.filter(h => {
      const st = String(h.estadoPlan || 'PENDIENTE').toUpperCase();
      return !['PROGRAMADO', 'EN_PROGRESO', 'COMPLETADO', 'FINALIZADO', 'CANCELADO'].includes(st);
    }).length;

    // Programados: procedimientos seleccionados específicamente para realizarse y cobrarse en la cita presente
    const programado = lista.filter(h => {
      const st = String(h.estadoPlan || '').toUpperCase();
      return st === 'PROGRAMADO' || st === 'EN_PROGRESO';
    }).length;

    // Realizados: procedimientos cuya intervención ya fue concluida con éxito
    const realizado = lista.filter(h => {
      const st = String(h.estadoPlan || '').toUpperCase();
      return st === 'COMPLETADO' || st === 'FINALIZADO';
    }).length;

    return {
      Hallazgos: total,
      Presupuestado: presupuestado,
      Programado: programado,
      Realizado: realizado,
    };
  }, [hallazgos]);

  // Reglas cromáticas que colorean condicionalmente los dientes según el filtro activo y el estado del tratamiento
  const teethConditions = useMemo(() => {
    if (!hallazgos?.length) return [];

    const pendientes = [];
    const programados = [];
    const realizados = [];

    hallazgos.forEach(h => {
      const toothId = `teeth-${h.piezaDental}`;
      const st = String(h.estadoPlan || 'PENDIENTE').toUpperCase();

      if (st === 'COMPLETADO' || st === 'FINALIZADO') {
        realizados.push(toothId);
      } else if (st === 'PROGRAMADO' || st === 'EN_PROGRESO') {
        programados.push(toothId);
      } else if (st !== 'CANCELADO') {
        pendientes.push(toothId);
      }
    });

    const conditions = [];

    if (activeFilter === 'Hallazgos') {
      // Vista 1: Mapa general de todos los hallazgos con diferenciación de color por estado
      if (pendientes.length > 0) {
        conditions.push({
          label: 'Presupuestado / Pendiente',
          teeth: pendientes,
          fillColor: '#fef3c7',    // Ámbar suave
          outlineColor: '#f59e0b', // Ámbar
        });
      }
      if (programados.length > 0) {
        conditions.push({
          label: 'Programado para Cobro',
          teeth: programados,
          fillColor: '#e0f2fe',    // Azul suave
          outlineColor: '#0284c7', // Azul
        });
      }
      if (realizados.length > 0) {
        conditions.push({
          label: 'Realizado',
          teeth: realizados,
          fillColor: '#d1fae5',    // Verde suave
          outlineColor: '#10b981', // Verde
        });
      }
    } else if (activeFilter === 'Presupuestado') {
      // Vista 2: Resalta exclusivamente piezas presupuestadas pendientes de programar
      if (pendientes.length > 0) {
        conditions.push({
          label: 'Presupuestado (Pendiente)',
          teeth: pendientes,
          fillColor: '#fef3c7',
          outlineColor: '#f59e0b',
        });
      }
    } else if (activeFilter === 'Programado') {
      // Vista 3: Resalta únicamente piezas programadas para atención y cobro en la fecha presente
      if (programados.length > 0) {
        conditions.push({
          label: 'Programado para Atención / Cobro',
          teeth: programados,
          fillColor: '#e0f2fe',
          outlineColor: '#0284c7',
        });
      }
    } else if (activeFilter === 'Realizado') {
      // Vista 4: Resalta piezas con intervenciones odontológicas concluidas
      if (realizados.length > 0) {
        conditions.push({
          label: 'Realizado (Completado)',
          teeth: realizados,
          fillColor: '#d1fae5',
          outlineColor: '#10b981',
        });
      }
    }

    return conditions;
  }, [hallazgos, activeFilter]);

  // Lista memoizada de hallazgos filtrados para la tabla inferior
  const hallazgosFiltrados = useMemo(() => {
    if (!hallazgos?.length) return [];
    if (activeFilter === 'Hallazgos') return hallazgos;

    return hallazgos.filter(h => {
      const st = String(h.estadoPlan || 'PENDIENTE').toUpperCase();
      if (activeFilter === 'Presupuestado') {
        return !['PROGRAMADO', 'EN_PROGRESO', 'COMPLETADO', 'FINALIZADO', 'CANCELADO'].includes(st);
      }
      if (activeFilter === 'Programado') {
        return st === 'PROGRAMADO' || st === 'EN_PROGRESO';
      }
      if (activeFilter === 'Realizado') {
        return st === 'COMPLETADO' || st === 'FINALIZADO';
      }
      return true;
    });
  }, [hallazgos, activeFilter]);

  return (
    <div className="flex gap-4 mt-2 flex-1 min-h-0 overflow-hidden animate-fade-in">

      {/* ── COLUMNA IZQUIERDA: Odontograma y Hallazgos ────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200/80
                      shadow-card overflow-hidden min-w-0">

        {/* Barra de filtros superior activa */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex-shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <i className="bi bi-funnel-fill text-primary-600 text-xs" />
            <span className="text-xs font-bold text-slate-700">Filtro de vista:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map(f => {
              const isSelected = activeFilter === f.id;
              const count = conteos[f.id] ?? 0;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all outline-none cursor-pointer
                    ${isSelected
                      ? f.id === 'Realizado'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : f.id === 'Programado'
                          ? 'bg-primary-600 text-white shadow-xs'
                          : f.id === 'Presupuestado'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70 bg-white border border-slate-200/80'
                    }`}
                >
                  <i className={`bi ${f.icon} text-[11px] ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{f.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenedor del Odontograma con Scroll (contenedor de bloque estándar para permitir cálculo SVG) */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="w-full">
            {/* Leyenda de colores adaptativa según el filtro activo */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3 px-2 flex-wrap">
              {activeFilter === 'Hallazgos' && (
                <>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="w-3 h-3 rounded-full bg-amber-100 border-2 border-amber-500 flex-shrink-0" />
                    Presupuestado ({conteos.Presupuestado})
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="w-3 h-3 rounded-full bg-sky-100 border-2 border-primary-500 flex-shrink-0" />
                    Programado ({conteos.Programado})
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="w-3 h-3 rounded-full bg-emerald-100 border-2 border-emerald-500 flex-shrink-0" />
                    Realizado ({conteos.Realizado})
                  </span>
                </>
              )}
              {activeFilter === 'Presupuestado' && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/60">
                  <span className="w-3 h-3 rounded-full bg-amber-100 border-2 border-amber-500 flex-shrink-0" />
                  Mostrando Piezas Presupuestadas ({conteos.Presupuestado})
                </span>
              )}
              {activeFilter === 'Programado' && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-xl border border-primary-200/60">
                  <span className="w-3 h-3 rounded-full bg-sky-100 border-2 border-primary-500 flex-shrink-0" />
                  Mostrando Piezas Programadas ({conteos.Programado})
                </span>
              )}
              {activeFilter === 'Realizado' && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/60">
                  <span className="w-3 h-3 rounded-full bg-emerald-100 border-2 border-emerald-500 flex-shrink-0" />
                  Mostrando Tratamientos Realizados ({conteos.Realizado})
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span className="w-3 h-3 rounded-full bg-blue-50 border-2 border-dashed border-primary-400 flex-shrink-0" />
                Selección Actual
              </span>
            </div>

            {/* Render del odontograma SVG responsivo */}
            <div className="odontograma-fit">
              <Odontogram
                onChange={onOdontogramChange}
                theme="light"
                notation="FDI"
                teethConditions={teethConditions}
                showLabels={false}
              />
            </div>

            <p className="text-center text-[11px] font-semibold text-slate-400 mt-3">
              {activeFilter === 'Realizado'
                ? 'Visualizando tratamientos concluidos en las piezas dentales.'
                : activeFilter === 'Programado'
                  ? 'Visualizando tratamientos programados o en progreso.'
                  : activeFilter === 'Presupuestado'
                    ? 'Visualizando tratamientos presupuestados pendientes de realizar.'
                    : 'Haz clic en una o varias piezas dentales para asignarles tratamiento en el panel derecho.'}
            </p>
          </div>
        </div>

        {/* Lista de Hallazgos registrados filtrados dinámicamente */}
        <div className="border-t border-slate-100 px-5 py-3 max-h-52 overflow-y-auto bg-slate-50/40">
          <HallazgosList
            hallazgos={hallazgosFiltrados}
            totalSinFiltrar={hallazgos.length}
            activeFilter={activeFilter}
            onResetFilter={() => setActiveFilter('Hallazgos')}
            onCambiarEstado={onCambiarEstado}
            onEliminar={onEliminarHallazgo}
          />
        </div>
      </div>

      {/* ── COLUMNA DERECHA: Panel de asignación de tratamiento ───────────────── */}
      <aside className="w-72 sm:w-80 flex-shrink-0 flex flex-col bg-white rounded-3xl
                        border border-slate-200/80 shadow-card p-5 gap-4 overflow-y-auto">

        <div className="border-b border-slate-100 pb-3">
          <h6 className="font-extrabold text-slate-800 text-sm font-display">
            Asignar Procedimiento
          </h6>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Vincula un tratamiento a las piezas marcadas.
          </p>
        </div>

        {/* Piezas seleccionadas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Piezas seleccionadas (FDI)
          </label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
            <i className="bi bi-diagram-3 text-slate-400" />
            <span className={piecesText ? 'text-primary-700' : 'text-slate-400 font-normal italic'}>
              {piecesText || 'Ninguna pieza seleccionada'}
            </span>
          </div>
        </div>

        {/* Selector de tratamiento */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tratamiento
          </label>
          <TratamientoSelector
            tratamientos={tratamientos}
            selectedId={selectedTratamiento}
            onSelect={(id) => {
              setSelectedTratamiento(id);
              const t = tratamientos.find(tr => String(tr.idTratamiento) === id);
              if (t) setCustomPrecio(String(t.costoTratamiento));
            }}
            onCrear={handleCrear}
            crearLoading={savingHallazgo}
          />
        </div>

        {/* Costo aplicado */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Precio Aplicado ($)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-xs text-slate-400 font-bold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={customPrecio}
              onChange={e => setCustomPrecio(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200
                         bg-white text-slate-800 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
            />
          </div>
        </div>

        {/* Botón registrar hallazgo */}
        <Button
          fullWidth
          onClick={onRegistrarHallazgo}
          loading={savingHallazgo}
          disabled={selectedTeeth.length === 0 || !selectedTratamiento || savingHallazgo}
          icon={<i className="bi bi-plus-circle" />}
        >
          Guardar en Odontograma
        </Button>

        {/* Navegación entre pasos */}
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-slate-100">
          <Button
            variant="secondary"
            fullWidth
            onClick={onVolver}
            icon={<i className="bi bi-arrow-left" />}
          >
            Volver a Evaluación
          </Button>

          <Button
            fullWidth
            onClick={onContinuar}
            iconRight={<i className="bi bi-arrow-right" />}
          >
            Avanzar a Prescripción
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default StepOdontograma;