import React from 'react';

/** Pantalla de carga de toda la aplicación — usada como fallback de React.Suspense */
//fallback de React.Suspense mientras se cargan rutas o componentes con lazy loading.

/* Ejemplo de uso en App.jsx:
 *   <React.Suspense fallback={<LoadingScreen />}>
 *     <Routes>...</Routes>
 *   </React.Suspense> */
 
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-slate-50/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-5 p-8 rounded-3xl bg-white/80 backdrop-blur-md shadow-card border border-slate-200/60 max-w-xs text-center animate-fade-in-up">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-dental-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-primary-500/20">
          <i className="bi bi-heart-pulse-fill" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-primary-500/30 animate-ping opacity-30" />
      </div>
      
      <div className="space-y-1">
        <h3 className="font-heading font-bold text-slate-800 text-base">DentalCare ERP</h3>
        <p className="text-xs text-slate-400 font-medium animate-pulse">Cargando aplicación clínica...</p>
      </div>

      <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="w-full h-full bg-primary-600 rounded-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-primary-500 via-dental-400 to-primary-600" />
      </div>
    </div>
  </div>
);

export default LoadingScreen;
