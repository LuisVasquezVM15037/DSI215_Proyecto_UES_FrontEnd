import React, { useState, useMemo } from 'react';
import { Odontogram } from 'react-odontogram';
import 'react-odontogram/style.css';
import '../styles/odontograma.css';
import HallazgosList from './HallazgosList';
import TratamientoSelector from './TratamientoSelector';
import Button from './ui/Button';

const FILTERS = ['Hallazgos', 'Presupuestado', 'Programado', 'Realizado'];

/**
 * Paso 2: Odontograma interactivo digital y registro de hallazgos por pieza dental.
 */
const StepOdontograma = ({
  cita,
  hallazgos,
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
  const showHistorial = activeFilter === 'Programado' || activeFilter === 'Realizado';
  const piecesText = selectedTeeth.map(t => t.notations?.fdi || t.id).join(', ');
  const handleCrear = onCrearTratamiento || onCrearNuevoTratamiento;

  // Hallazgos existentes → rojo en el odontograma.
  const teethConditions = useMemo(() => {
    if (!hallazgos?.length) return [];
    return [{
      label: 'Hallazgo registrado',
      teeth: hallazgos.map(h => `teeth-${h.piezaDental}`),
      fillColor:    '#fee2e2',
      outlineColor: '#ef4444',
    }];
  }, [hallazgos]);

  return (
    <div className="flex flex-col lg:flex-row gap-5 mt-2 flex-1 overflow-hidden animate-fade-in">

      {/* ── COLUMNA IZQUIERDA: Odontograma y Hallazgos ────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200/80
                      shadow-card overflow-hidden min-w-0">

        {/* Barra de filtros superior */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <i className="bi bi-funnel text-slate-400 text-xs" />
          <span className="text-xs font-bold text-slate-500 mr-1">Filtro de vista:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all outline-none cursor-pointer
                            ${activeFilter === f
                              ? 'bg-primary-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/60'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Contenedor del Odontograma con Scroll */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-between">
          {showHistorial ? (
            <div className="w-full max-w-md my-auto text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-3">
                <i className="bi bi-clock-history text-2xl" />
              </div>
              <h6 className="font-bold text-slate-800 text-base font-display">
                {activeFilter === 'Realizado' ? 'Historial de Tratamientos Realizados' : 'Tratamientos Programados'}
              </h6>
              <p className="text-xs text-slate-400 mt-1">
                Expediente histórico para {cita.nombreCompletoPaciente}.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* Leyenda de colores del odontograma */}
              <div className="flex items-center gap-5 mb-3 px-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-red-100 border-2 border-red-500 flex-shrink-0" />
                  Hallazgo Registrado
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-blue-100 border-2 border-primary-500 flex-shrink-0" />
                  Pieza Seleccionada
                </span>
              </div>

              {/* Render del odontograma SVG responsivo */}
              <div className="odontograma-fit">
                <Odontogram
                  onChange={onOdontogramChange}
                  theme="light"
                  notation="FDI"
                  teethConditions={teethConditions}
                  showLabels={hallazgos?.length > 0}
                />
              </div>

              <p className="text-center text-[11px] font-semibold text-slate-400 mt-3">
                Haz clic en una o varias piezas dentales para asignarles tratamiento en el panel derecho.
              </p>
            </div>
          )}
        </div>

        {/* Lista de Hallazgos registrados */}
        <div className="border-t border-slate-100 px-5 py-3 max-h-48 overflow-y-auto bg-slate-50/30">
          <HallazgosList
            hallazgos={hallazgos}
            onCambiarEstado={onCambiarEstado}
            onEliminar={onEliminarHallazgo}
          />
        </div>
      </div>

      {/* ── COLUMNA DERECHA: Panel de asignación de tratamiento ───────────────── */}
      <aside className="w-full lg:w-84 flex-shrink-0 flex flex-col bg-white rounded-3xl
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