/**
 * Propósito:
 * Componente modal accesible y reutilizable que implementa un cuadro de diálogo flotante (overlay).
 * Bloquea el scroll del cuerpo del documento mientras está activo, soporta cierre interactivo
 * mediante tecla de escape (Escape key) o clic sobre el fondo oscurecido (backdrop), y proporciona
 * divisiones claras para cabecera, cuerpo con scroll interno y pie de acciones.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ui/Modal.jsx'. Componente de orquestación visual en la capa
 * de primitivas de interfaz de usuario.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/components/ReprogramModal.jsx'
 *   - 'src/views/AppointmentPage.jsx'
 *   - 'src/views/PatientManagementPage.jsx'
 *   - 'src/views/UserManagementPage.jsx'
 * - Consume:
 *   - React ('useEffect').
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del diálogo modal.
 * @param {boolean} props.isOpen - Controla si el modal se encuentra renderizado y visible.
 * @param {() => void} props.onClose - Callback invocado al solicitar el cierre (clic exterior, tecla Escape o botón de salida).
 * @param {string} props.title - Título semántico principal expuesto en el encabezado.
 * @param {string} [props.subtitle] - Texto explicativo secundario que acompaña al título.
 * @param {React.ReactNode} props.children - Contenido dinámico del cuerpo del modal.
 * @param {React.ReactNode} [props.footer] - Botones o acciones finales situados en el pie del diálogo.
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Escala del ancho máximo del contenedor modal.
 * @returns {JSX.Element|null} Elemento de diálogo modal o null si isOpen es falso.
 */

import React, { useEffect } from 'react';

// Escala de ancho máximo según el tipo de formulario o visualización a desplegar
const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, title, subtitle, children, footer, size = 'md' }) => {
  // Manejo de efectos colaterales en el DOM global: bloqueo del scroll y detector de tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    
    // Evita el desplazamiento accidental de la página de fondo
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Restauración limpia del scroll y desuscripción del listener al desmontar o cerrar
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Si no está activo, se omite por completo del árbol de renderizado para optimizar recursos
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
        // Detiene la propagación para que los clics internos no cierren el modal
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera del diálogo con título accesible y botón de cierre rápido */}
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

        {/* Cuerpo con scroll vertical interno si el contenido excede la altura de la ventana */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Pie de modal opcional para agrupamiento de botones de acción */}
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
