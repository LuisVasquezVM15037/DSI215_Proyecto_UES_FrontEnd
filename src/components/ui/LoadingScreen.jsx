import React from 'react';

/** Pantalla de carga de toda la aplicación — usada como fallback de React.Suspense */
//fallback de React.Suspense mientras se cargan rutas o componentes con lazy loading.

/* Ejemplo de uso en App.jsx:
 *   <React.Suspense fallback={<LoadingScreen />}>
 *     <Routes>...</Routes>
 *   </React.Suspense> */
 
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600
                      rounded-full animate-spin" style={{ borderWidth: '3px' }} />
      <p className="text-sm text-slate-500 font-medium">Cargando DentalCare...</p>
    </div>
  </div>
);

export default LoadingScreen;
