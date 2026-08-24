import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Barra de búsqueda reutilizable con ícono lupa y botón de limpiar.
 */
const SearchInput = ({
  value, //Valor actual del input (controlado desde el padre).
  onChange, //Callback al escribir: recibe el evento nativo (e.target.value).
  onClear, //Callback al presionar X para limpiar. Si no se pasa, el botón X no aparece.
  placeholder = 'Buscar...', //Texto de placeholder. Default: 'Buscar...'
  className = '', //Clases adicionales para ajustar tamaño o margen externo.
}) => (
  <div className={`flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200
                   rounded-xl hover:border-primary-300 focus-within:ring-2
                   focus-within:ring-primary-500 focus-within:border-transparent
                   transition-all ${className}`}>
    <i className="bi bi-search text-slate-400 text-sm flex-shrink-0" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400
                 outline-none min-w-0"
    />
    {value && onClear && (
      <button
        type="button"
        onClick={onClear}
        aria-label="Limpiar búsqueda"
        className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
      >
        <i className="bi bi-x text-sm" />
      </button>
    )}
  </div>
);

export default SearchInput;
