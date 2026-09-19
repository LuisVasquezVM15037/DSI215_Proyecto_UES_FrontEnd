import React, { useEffect } from 'react';

/**
 * Dialogo modal accesible y reutilizable.
 * Reemplaza todos los overlays inline del proyecto.
 *
 * @param {boolean} isOpen      - Controla visibilidad
 * @param {() => void} onClose  - Se llama al cerrar (backdrop click o botón X)
 * @param {string} title        - Título del modal
 * @param {string} [subtitle]   - Subtítulo (opcional)
 * @param {React.ReactNode} children - Contenido del modal
 * @param {React.ReactNode} [footer] - Pie del modal (botones de acción)
 * @param {'sm'|'md'|'lg'|'xl'} [size] - Ancho del modal
 */
const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, title, subtitle, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center
                 justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl border border-slate-100 w-full ${SIZES[size]}
                    max-h-[90vh] flex flex-col animate-scale-in overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h5 id="modal-title" className="font-bold text-slate-800 text-base tracking-tight">{title}</h5>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 flex items-center justify-center rounded-xl
                       text-slate-400 hover:text-slate-700 hover:bg-slate-200/60
                       transition-all active:scale-95"
          >
            <i className="bi bi-x-lg text-xs" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex gap-2.5 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
