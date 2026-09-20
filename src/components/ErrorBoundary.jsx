/**
 * Propósito:
 * Componente institucional de captura de excepciones no controladas en el ciclo de vida
 * de renderizado de React (ErrorBoundary). Previene la caída total de la aplicación ("pantalla blanca"),
 * salvaguarda la experiencia de usuario y despliega una interfaz de rescate clínico (Fallback UI)
 * que permite reintentar la operación o recargar la sesión manteniendo la integridad visual del sistema.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ErrorBoundary.jsx'. Componente de infraestructura y resiliencia
 * en la capa raíz de componentes de presentación.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/App.jsx' (Envoltura perimetral del árbol de enrutamiento).
 * - Consume:
 *   - React ('Component').
 *   - 'src/components/ui/Button.jsx'.
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del contenedor de error.
 * @param {React.ReactNode} props.children - Árbol de componentes hijos protegidos.
 * @param {React.ReactNode} [props.fallback] - Interfaz de respaldo personalizada opcional.
 * @returns {JSX.Element} Vista de rescate institucional ante excepciones o componentes hijos normales.
 */

import React, { Component } from 'react';
import Button from './ui/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Actualiza el estado reactivo para que el siguiente renderizado muestre la interfaz de rescate
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Captura detalles técnicos de la excepción y de la traza de componentes para telemetría
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[DentalCare ErrorBoundary] Excepción no controlada en el árbol de componentes:', error, errorInfo);
  }

  /**
   * Restablece el estado del ErrorBoundary para intentar re-renderizar el componente
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Fuerza la recarga completa del documento en el navegador
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * Redirige al punto de acceso principal de la plataforma
   */
  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Si el consumidor proporcionó un fallback personalizado, se prioriza
      if (fallback) {
        return fallback;
      }

      // Interfaz de rescate institucional estandarizada
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 select-none animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-card p-8 text-center space-y-5">
            {/* Emblema visual de alerta institucional */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
              <i className="bi bi-shield-exclamation text-3xl" />
            </div>

            {/* Título y descripción explicativa */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-red-600 tracking-wider uppercase bg-red-50 px-2.5 py-0.5 rounded-full">
                Incidencia del Sistema
              </span>
              <h2 className="text-xl font-extrabold text-slate-800 font-display pt-1">
                Interrupción en el Módulo
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ha ocurrido una excepción inesperada durante la ejecución visual.
                Los datos clínicos del expediente están protegidos en el servidor.
              </p>
            </div>

            {/* Traza resumida del error (visible para diagnóstico técnico) */}
            {error && (
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-left max-h-28 overflow-y-auto">
                <p className="text-[11px] font-mono font-semibold text-red-700 truncate">
                  {error.toString()}
                </p>
                {errorInfo?.componentStack && (
                  <p className="text-[10px] font-mono text-slate-400 mt-1 whitespace-pre-wrap leading-tight">
                    {errorInfo.componentStack.slice(0, 200)}...
                  </p>
                )}
              </div>
            )}

            {/* Acciones de recuperación asistida */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={this.handleReset}
                icon={<i className="bi bi-arrow-clockwise" />}
              >
                Reintentar
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={this.handleReload}
                icon={<i className="bi bi-arrow-repeat" />}
              >
                Recargar
              </Button>
            </div>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="text-xs text-slate-400 hover:text-primary-600 font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <i className="bi bi-house text-[11px]" />
              Volver al Panel Principal
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
