/**
 * Propósito:
 * Componente interactivo de entrada de búsqueda con iconografía integrada,
 * micro-transición de foco y botón interactivo para limpiar el contenido actual.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ui/SearchInput.jsx'. Primitiva de filtrado y búsqueda dentro
 * de la capa de componentes de presentación base.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/AppointmentPage.jsx'
 *   - 'src/views/PatientManagementPage.jsx'
 *   - 'src/views/UserManagementPage.jsx'
 *   - 'src/views/ConsultaIndexPage.jsx'
 * - Consume:
 *   - React.
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del campo de búsqueda.
 * @param {string} props.value - Valor actual del término de búsqueda (controlado).
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - Manejador de evento al escribir texto.
 * @param {() => void} [props.onClear] - Manejador para reiniciar el texto de búsqueda al presionar el botón de limpieza.
 * @param {string} [props.placeholder='Buscar...'] - Texto provisional indicador dentro del input.
 * @param {string} [props.className=''] - Clases complementarias para el contenedor principal.
 * @returns {JSX.Element} Barra de búsqueda interactiva con botón de borrado rápido.
 */

import React from 'react';

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
    {/* Icono decorativo de lupa */}
    <i className="bi bi-search text-slate-400 text-xs flex-shrink-0" />
    
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400
                 outline-none min-w-0"
    />
    
    {/* Botón de reseteo visible únicamente cuando existe texto ingresado y un callback onClear provisto */}
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
