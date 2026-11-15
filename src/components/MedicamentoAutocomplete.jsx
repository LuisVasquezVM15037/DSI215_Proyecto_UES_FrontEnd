import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * Componente de autocompletado para selección rápida de medicamentos (Punto 4).
 * Reemplaza el <select> tradicional por un buscador reactivo con teclado y filtros.
 */
export default function MedicamentoAutocomplete({
  medicamentos = [],
  selectedId,
  onSelect,
  placeholder = 'Buscar medicamento por nombre o componente...',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const seleccionado = useMemo(() => {
    return medicamentos.find(m => String(m.idMedicamento) === String(selectedId));
  }, [medicamentos, selectedId]);

  // Si cambia el seleccionado externamente, sincronizar el texto
  useEffect(() => {
    if (seleccionado) {
      setBusqueda(`${seleccionado.nombreMedicamento} — ${seleccionado.concentracion}`);
    } else if (!open) {
      setBusqueda('');
    }
  }, [seleccionado, open]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        if (seleccionado) {
          setBusqueda(`${seleccionado.nombreMedicamento} — ${seleccionado.concentracion}`);
        } else {
          setBusqueda('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [seleccionado]);

  // Filtrado reactivo sin duplicados
  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return medicamentos.slice(0, 30);
    return medicamentos.filter(m => {
      const nombre = (m.nombreMedicamento || '').toLowerCase();
      const comp = (m.componenteActivo || '').toLowerCase();
      const conc = (m.concentracion || '').toLowerCase();
      return nombre.includes(q) || comp.includes(q) || conc.includes(q);
    });
  }, [medicamentos, busqueda]);

  const handleSelect = (med) => {
    onSelect(med.idMedicamento);
    setBusqueda(`${med.nombreMedicamento} — ${med.concentracion}`);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    onSelect('');
    setBusqueda('');
    setOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filtrados.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : filtrados.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtrados.length) {
        handleSelect(filtrados[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-8 pr-8 py-2 text-xs border rounded-xl bg-white outline-none transition-all ${
            open
              ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-xs'
              : 'border-slate-200 hover:border-slate-300'
          } ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-slate-800'}`}
        />
        {selectedId && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            title="Limpiar selección"
          >
            <i className="bi bi-x-circle-fill"></i>
          </button>
        )}
      </div>

      {open && !disabled && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto animate-scale-in p-1">
          {filtrados.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">
              <i className="bi bi-capsule text-base block mb-1 text-slate-300"></i>
              No se encontraron medicamentos coincidentes.
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtrados.map((m, idx) => {
                const isSelected = String(m.idMedicamento) === String(selectedId);
                const isActive = idx === activeIndex;

                return (
                  <button
                    key={m.idMedicamento}
                    type="button"
                    onClick={() => handleSelect(m)}
                    className={`w-full px-3 py-2 text-left rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-primary-50 text-primary-900'
                        : isSelected
                        ? 'bg-primary-100/60 text-primary-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate flex items-center gap-1.5">
                        <i className="bi bi-capsule text-primary-500 text-[11px]"></i>
                        <span>{m.nombreMedicamento}</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          ({m.concentracion})
                        </span>
                      </div>
                      {m.componenteActivo && (
                        <p className="text-[10px] text-slate-400 truncate pl-4">
                          P.A.: {m.componenteActivo}
                        </p>
                      )}
                    </div>
                    {m.stockActual != null && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2 ${
                        m.stockActual > 5
                          ? 'bg-slate-100 text-slate-600'
                          : m.stockActual > 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        Stock: {m.stockActual}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
