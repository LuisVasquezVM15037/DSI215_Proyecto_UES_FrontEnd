/**
 * Barra de búsqueda reutilizable con ícono lupa, micro-transición y botón de limpiar.
 */
const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
  className = '',
}) => (
  <div className={`flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-slate-200
                   rounded-xl hover:border-slate-300 focus-within:border-primary-500
                   focus-within:ring-4 focus-within:ring-primary-500/10
                   transition-all duration-200 shadow-xs ${className}`}>
    <i className="bi bi-search text-slate-400 text-xs flex-shrink-0" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400
                 outline-none min-w-0"
    />
    {value && onClear && (
      <button
        type="button"
        onClick={onClear}
        aria-label="Limpiar búsqueda"
        className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400
                   hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
      >
        <i className="bi bi-x text-sm" />
      </button>
    )}
  </div>
);

export default SearchInput;
