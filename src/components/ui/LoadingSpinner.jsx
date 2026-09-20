/**
 * Propósito:
 * Módulo de utilidades visuales de estado que provee:
 * 1. 'LoadingSpinner': Indicador animado de espera para operaciones asíncronas dentro de vistas o paneles.
 * 2. 'EmptyState': Componente para estados vacíos que informa al usuario cuando no existen datos,
 *    ofreciendo opcionalmente una llamada a la acción (CTA).
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ui/LoadingSpinner.jsx'. Componentes de retroalimentación en la capa
 * de primitivas de presentación de interfaz de usuario.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/DashboardPage.jsx'
 *   - 'src/views/AppointmentPage.jsx'
 *   - 'src/views/PatientManagementPage.jsx'
 *   - 'src/views/UserManagementPage.jsx'
 *   - 'src/views/ConsultaIndexPage.jsx'
 *   - 'src/components/StepOdontograma.jsx'
 * - Consume:
 *   - React.
 */

import React from 'react';

/**
 * Indicador de progreso circular con animación CSS y mensaje descriptivo.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.text='Cargando...'] - Mensaje textual que acompaña al spinner.
 * @param {string} [props.className=''] - Clases utilitarias adicionales para el contenedor.
 * @returns {JSX.Element} Bloque centrado con spinner giratorio.
 */
export const LoadingSpinner = ({ text = 'Cargando...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-16 gap-3 animate-fade-in ${className}`}>
    <div className="relative flex items-center justify-center">
      {/* Anillo exterior con borde superior diferenciado que genera la rotación continua */}
      <div className="w-9 h-9 border-3 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
      {/* Núcleo central estático para balance visual */}
      <div className="absolute w-2 h-2 rounded-full bg-primary-500" />
    </div>
    {text && <p className="text-xs font-semibold text-slate-500 tracking-tight">{text}</p>}
  </div>
);

/**
 * Componente de estado vacío cuando una consulta o filtro no arroja resultados.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.icon] - Nombre del icono de Bootstrap Icons (ej. 'bi-folder-x').
 * @param {string} props.title - Título principal que resume la situación de ausencia de datos.
 * @param {string} [props.description] - Descripción o sugerencia complementaria.
 * @param {React.ReactNode} [props.action] - Botón interactivo opcional para crear registros o restablecer filtros.
 * @param {string} [props.className=''] - Clases CSS complementarias.
 * @returns {JSX.Element} Ilustración y texto informativo para guiar al usuario.
 */
export const EmptyState = ({ icon, title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-14 px-4 gap-2.5 text-center animate-fade-in ${className}`}>
    {icon && (
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
        <i className={`bi ${icon} text-2xl`} />
      </div>
    )}
    <h6 className="font-bold text-slate-700 text-sm">{title}</h6>
    {description && <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{description}</p>}
    {/* Botón o control de acción opcional para permitir la recuperación del flujo */}
    {action && <div className="mt-3">{action}</div>}
  </div>
);

