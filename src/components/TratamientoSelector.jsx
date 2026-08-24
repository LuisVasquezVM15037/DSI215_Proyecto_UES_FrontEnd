import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Selector de tratamientos con búsqueda y formulario de creación inline.
 *
 * FIX BUG-07: interfaz alineada con cómo lo llama StepOdontograma.
 * El fetch de creación sube al hook useTratamientos (principio SRP).
 *
 * Props:
 *   tratamientos  - lista del catálogo
 *   selectedId    - string ID seleccionado
 *   onSelect      - (id: string) => void
 *   onCrear       - async (datos) => void  — el hook hace el fetch
 *   crearLoading  - boolean: spinner mientras se crea
 */
const TratamientoSelector = ({
  tratamientos = [],
  selectedId,
  onSelect,
  onCrear,
  crearLoading = false,
}) => {
  const [open,      setOpen]      = useState(false);
  const [busqueda,  setBusqueda]  = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [formError, setFormError] = useState('');
  const [nuevo,     setNuevo]     = useState({
    nombreTratamiento:      '',
    descripcionTratamiento: '',
    costoTratamiento:       '',
  });

  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false); setShowForm(false); setBusqueda('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtrados = tratamientos.filter(t =>
    t.nombreTratamiento.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.descripcionTratamiento?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const seleccionado = tratamientos.find(t => String(t.idTratamiento) === selectedId);

  const handleCrear = async () => {
    if (!nuevo.nombreTratamiento.trim() || !nuevo.costoTratamiento) {
      setFormError('Nombre y costo son obligatorios.');
      return;
    }
    setFormError('');
    try {
      await onCrear(nuevo);
      setNuevo({ nombreTratamiento: '', descripcionTratamiento: '', costoTratamiento: '' });
      setShowForm(false);
      setOpen(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div ref={ref} className="relative">

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-white
                   border border-slate-200 rounded-xl text-sm text-left
                   hover:border-primary-300 focus:outline-none focus:ring-2
                   focus:ring-primary-500 transition-colors"
      >
        <span className={seleccionado ? 'text-slate-800 font-medium' : 'text-slate-400'}>
          {seleccionado ? seleccionado.nombreTratamiento : 'Seleccione un tratamiento...'}
        </span>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'} text-slate-400 text-xs flex-shrink-0`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50
                        bg-white border border-slate-200 rounded-xl
                        shadow-xl shadow-slate-200/50 overflow-hidden animate-fade-in">

          {/* Buscador */}
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
              <i className="bi bi-search text-slate-400 text-xs flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar tratamiento..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
                className="bg-transparent text-sm outline-none w-full text-slate-700
                           placeholder-slate-400"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-52 overflow-y-auto">
            {filtrados.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No se encontró "{busqueda}"
              </p>
            ) : filtrados.map(t => {
              const isSelected = selectedId === String(t.idTratamiento);
              return (
                <button
                  key={t.idTratamiento}
                  type="button"
                  onClick={() => { onSelect(String(t.idTratamiento)); setOpen(false); setBusqueda(''); }}
                  className={`w-full text-left px-4 py-2.5 transition-colors border-l-2
                              ${isSelected
                                ? 'bg-primary-50 border-l-primary-500'
                                : 'hover:bg-slate-50 border-l-transparent'}`}
                >
                  <p className={`text-sm font-semibold leading-tight
                                 ${isSelected ? 'text-primary-700' : 'text-slate-700'}`}>
                    {t.nombreTratamiento}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.descripcionTratamiento} — <strong>${t.costoTratamiento}</strong>
                  </p>
                </button>
              );
            })}
          </div>

          {/* Crear nuevo */}
          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setShowForm(p => !p); setFormError(''); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold
                         text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <i className={`bi bi-${showForm ? 'x-circle' : 'plus-circle'}`} />
              {showForm ? 'Cancelar nuevo tratamiento' : 'Crear tratamiento nuevo'}
            </button>
          </div>

          {/* Formulario inline */}
          {showForm && (
            <div
              className="border-t border-slate-100 p-4 bg-slate-50 space-y-2"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-xs font-bold text-primary-700">Nuevo tratamiento</p>
              {formError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <i className="bi bi-exclamation-circle" />{formError}
                </p>
              )}
              {[
                { placeholder: 'Nombre del tratamiento *',   field: 'nombreTratamiento',      type: 'text'   },
                { placeholder: 'Descripción (opcional)',      field: 'descripcionTratamiento', type: 'text'   },
                { placeholder: 'Costo base ($) *',           field: 'costoTratamiento',       type: 'number' },
              ].map(({ placeholder, field, type }) => (
                <input
                  key={field}
                  type={type}
                  placeholder={placeholder}
                  value={nuevo[field]}
                  onChange={e => setNuevo(p => ({ ...p, [field]: e.target.value }))}
                  min={type === 'number' ? '0' : undefined}
                  step={type === 'number' ? '0.01' : undefined}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg
                             bg-white outline-none focus:ring-2 focus:ring-primary-500
                             focus:border-transparent transition-all"
                />
              ))}
              <button
                type="button"
                onClick={handleCrear}
                disabled={crearLoading}
                className="w-full py-2 bg-primary-600 text-white text-xs font-semibold
                           rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {crearLoading ? 'Guardando...' : 'Guardar y seleccionar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TratamientoSelector;
