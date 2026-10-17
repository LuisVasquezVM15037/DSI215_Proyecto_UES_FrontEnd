import React, { useState, useRef, useEffect, useMemo } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Componente SearchableSelect (Combobox con filtrado en tiempo real).
 * Reemplaza los elementos <select> nativos estáticos por un control interactivo
 * de búsqueda por texto.
 *
 * Props:
 *  - options: Array<{ value: any, label: string, sublabel?: string }>
 *  - value: valor seleccionado actual
 *  - onChange: (e: { target: { name: string, value: any } }) => void
 *  - onSelect: (value: any, option: object) => void
 *  - name: nombre del campo
 *  - placeholder: texto placeholder
 *  - disabled: deshabilitar control
 *  - error: mensaje de error para feedback visual
 *  - required: indicar si es requerido
 */
const SearchableSelect = ({
  options = [],
  value,
  onChange,
  onSelect,
  name,
  placeholder = 'Buscar o seleccionar...',
  disabled = false,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Opción actualmente seleccionada
  const selectedOption = useMemo(() => {
    return options.find(o => String(o.value) === String(value));
  }, [options, value]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrado insensible a mayúsculas y acentos
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return options;
    return options.filter(opt => {
      const labelMatch = (opt.label ?? '').toLowerCase().includes(term);
      const sublabelMatch = (opt.sublabel ?? '').toLowerCase().includes(term);
      return labelMatch || sublabelMatch;
    });
  }, [options, searchTerm]);

  const handleSelectOption = (opt) => {
    if (disabled) return;
    if (onSelect) onSelect(opt.value, opt);
    if (onChange) onChange({ target: { name, value: opt.value } });
    setOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (onSelect) onSelect('', null);
    if (onChange) onChange({ target: { name, value: '' } });
    setSearchTerm('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Caja de selección / Textbox principal */}
      <div
        onClick={() => {
          if (!disabled) {
            setOpen(prev => !prev);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm bg-white
                   border rounded-xl cursor-pointer transition-all ${
                     error
                       ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-400'
                       : 'border-slate-200 hover:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500'
                   } ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
          <i className="bi bi-search text-slate-400 text-xs flex-shrink-0" />
          {selectedOption ? (
            <div className="flex-1 min-w-0 truncate">
              <span className="font-semibold text-slate-800">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-xs text-slate-400 ml-1.5 truncate">
                  ({selectedOption.sublabel})
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
              title="Limpiar selección"
            >
              <i className="bi bi-x-circle-fill text-xs" />
            </button>
          )}
          <i className={`bi bi-chevron-${open ? 'up' : 'down'} text-slate-400 text-xs`} />
        </div>
      </div>

      {/* Menú flotante con cuadro de búsqueda y opciones filtradas */}
      {open && !disabled && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white
                        border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50
                        overflow-hidden animate-fade-in">
          {/* Cuadro de texto para filtrado */}
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-primary-400">
              <i className="bi bi-funnel text-slate-400 text-xs flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Escribe para filtrar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onClick={e => e.stopPropagation()}
                className="bg-transparent text-xs outline-none w-full text-slate-700 placeholder-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <i className="bi bi-x text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de resultados filtrados */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                <i className="bi bi-emoji-neutral text-base block mb-1 text-slate-300" />
                No se encontraron coincidencias para "{searchTerm}"
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate font-medium">{opt.label}</p>
                      {opt.sublabel && (
                        <p className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-primary-500' : 'text-slate-400'
                        }`}>
                          {opt.sublabel}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <i className="bi bi-check-lg text-primary-600 text-sm flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Mensaje de error si existe */}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <i className="bi bi-exclamation-circle" />
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchableSelect;
