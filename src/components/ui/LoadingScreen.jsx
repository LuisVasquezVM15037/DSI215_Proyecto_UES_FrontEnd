/**
 * Propósito:
 * Pantalla completa de carga inicial (Splash Screen / Fallback de Suspense).
 * Se presenta al usuario mientras se descargan dinámicamente los chunks de código
 * de las vistas perezosas (lazy-loaded routes) o durante la verificación primaria de sesión.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ui/LoadingScreen.jsx'. Elemento de carga de nivel de aplicación
 * dentro de la capa de componentes de presentación base.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/App.jsx' (como prop de fallback en el límite <Suspense> global).
 * - Consume:
 *   - React.
 *
 * Parámetros y Retornos:
 * @returns {JSX.Element} Vista de pantalla completa con logotipo clínico, efecto shimmer y texto de estado.
 */

import React from 'react';

const LoadingScreen = () => (
  // Contenedor de pantalla completa fijado al viewport con fondo translúcido y efecto backdrop-blur
  <div className="flex items-center justify-center h-screen w-screen bg-slate-50/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-5 p-8 rounded-3xl bg-white/80 backdrop-blur-md shadow-card border border-slate-200/60 max-w-xs text-center animate-fade-in-up">
      {/* Contenedor del logotipo del sistema con pulso de radar animado */}
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-dental-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-primary-500/20">
          <i className="bi bi-heart-pulse-fill" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-primary-500/30 animate-ping opacity-30" />
      </div>
      
      {/* Título de la aplicación y mensaje de espera */}
      <div className="space-y-1">
        <h3 className="font-heading font-bold text-slate-800 text-base">DentalCare ERP</h3>
        <p className="text-xs text-slate-400 font-medium animate-pulse">Cargando aplicación clínica...</p>
      </div>

      {/* Barra de progreso indeterminada con animación de gradiente lineal (shimmer) */}
      <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="w-full h-full bg-primary-600 rounded-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-primary-500 via-dental-400 to-primary-600" />
      </div>
    </div>
  </div>
);

export default LoadingScreen;
