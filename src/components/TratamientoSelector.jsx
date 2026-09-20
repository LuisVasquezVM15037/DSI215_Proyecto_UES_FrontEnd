/**
 * Propósito:
 * Componente interactivo de selección de tratamientos odontológicos con filtrado en tiempo real
 * y formulario integrado (inline) para el alta rápida de nuevos procedimientos en el catálogo.
 * Soporta detección de clics externos para cierre automático y visualización de tarifas base.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/TratamientoSelector.jsx'. Componente de dominio clínico dentro
 * de la capa de componentes de presentación del odontograma.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/components/StepOdontograma.jsx'
 * - Consume:
 *   - React ('useState', 'useRef', 'useEffect').
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del selector.
 * @param {Array<Object>} [props.tratamientos=[]] - Catálogo disponible de tratamientos odontológicos.
 * @param {string} props.selectedId - Identificador del tratamiento seleccionado actualmente.
 * @param {(id: string) => void} props.onSelect - Callback ejecutado al escoger un procedimiento de la lista.
 * @param {(datos: { nombreTratamiento: string, descripcionTratamiento: string, costoTratamiento: string }) => Promise<any>} props.onCrear - Callback para crear un nuevo tratamiento.
 * @param {boolean} [props.crearLoading=false] - Indicador de guardado en progreso del nuevo tratamiento.
 * @returns {JSX.Element} Control desplegable con buscador y subformulario de creación inline.
 */

import React, { useState, useRef, useEffect } from 'react';

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

  // Detector de clics fuera del componente para cerrar el panel flotante de manera limpia
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowForm(false);
        setBusqueda('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtrado reactivo según coincidencia en nombre o descripción
  const filtrados = tratamientos.filter(t =>
    t.nombreTratamiento?.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.descripcionTratamiento?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Búsqueda del elemento seleccionado para desplegar su título en el botón principal
  const seleccionado = tratamientos.find(t => String(t.idTratamiento) === selectedId);

  /**
   * Valida y despacha la creación de un nuevo tratamiento al catálogo
   */
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
      setFormError(err.message || 'Error al registrar tratamiento.');
    }
  };

  return (
    <div ref={ref} className="relative">

      {/* Botón disparador principal (Trigger) */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white
                   border border-slate-200 rounded-xl text-sm text-left
                   hover:border-slate-300 focus:outline-none focus:ring-4
                   focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-xs cursor-pointer"
      >
        <span className={seleccionado ? 'text-slate-800 font-bold text-xs truncate' : 'text-slate-400 text-xs'}>
          {seleccionado ? seleccionado.nombreTratamiento : 'Selecciona un tratamiento...'}
        </span>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'} text-slate-400 text-[11px] flex-shrink-0`} />
      </button>

      {/* Menú flotante desplegable (Dropdown) */}
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50
                        bg-white border border-slate-200 rounded-2xl
                        shadow-xl overflow-hidden animate-scale-in">

          {/* Campo de búsqueda interna en tiempo real */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-slate-200">
              <i className="bi bi-search text-slate-400 text-xs flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar tratamiento..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
                className="bg-transparent text-xs outline-none w-full text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Lista scrolleable de opciones */}
          <div className="max-h-52 overflow-y-auto">
            {filtrados.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-5 italic">
                Sin resultados para "{busqueda}"
              </p>
            ) : filtrados.map(t => {
              const isSelected = selectedId === String(t.idTratamiento);
              return (
                <button
                  key={t.idTratamiento}
                  type="button"
                  onClick={() => { onSelect(String(t.idTratamiento)); setOpen(false); setBusqueda(''); }}
                  className={`w-full text-left px-4 py-2.5 transition-colors border-l-3
                              ${isSelected
                                ? 'bg-primary-50/80 border-l-primary-500'
                                : 'hover:bg-slate-50 border-l-transparent'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-bold leading-tight truncate
                                   ${isSelected ? 'text-primary-700' : 'text-slate-800'}`}>
                      {t.nombreTratamiento}
                    </p>
                    <span className="text-[11px] font-extrabold text-slate-700 px-1.5 py-0.5 rounded-md bg-slate-100 flex-shrink-0">
                      ${Number(t.costoTratamiento).toFixed(2)}
                    </span>
                  </div>
                  {t.descripcionTratamiento && (
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {t.descripcionTratamiento}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Botón para alternar la visualización del formulario inline de nuevo procedimiento */}
          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setShowForm(p => !p); setFormError(''); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold
                         text-primary-600 hover:bg-primary-50 rounded-xl transition-colors cursor-pointer"
            >
              <i className={`bi bi-${showForm ? 'x-circle' : 'plus-circle'}`} />
              <span>{showForm ? 'Cancelar registro' : 'Crear nuevo tratamiento'}</span>
            </button>
          </div>

          {/* Formulario embebido de captura rápida */}
          {showForm && (
            <div
              className="border-t border-slate-100 p-4 bg-slate-50 space-y-2.5"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-xs font-bold text-slate-700">Nuevo Tratamiento</p>
              {formError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <i className="bi bi-exclamation-circle" />{formError}
                </p>
              )}
              <input
                type="text"
                placeholder="Nombre del procedimiento *"
                value={nuevo.nombreTratamiento}
                onChange={e => setNuevo(p => ({ ...p, nombreTratamiento: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl
                           bg-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={nuevo.descripcionTratamiento}
                onChange={e => setNuevo(p => ({ ...p, descripcionTratamiento: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl
                           bg-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Costo base ($) *"
                value={nuevo.costoTratamiento}
                onChange={e => setNuevo(p => ({ ...p, costoTratamiento: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl
                           bg-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleCrear}
                disabled={crearLoading}
                className="w-full py-2 bg-primary-600 text-white text-xs font-bold
                           rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                {crearLoading ? 'Guardando...' : 'Guardar y Seleccionar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TratamientoSelector;
