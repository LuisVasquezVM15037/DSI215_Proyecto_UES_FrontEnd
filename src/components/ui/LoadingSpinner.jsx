import React from 'react';

/** Spinner de carga centrado con texto opcional */
//Usado para estados de carga dentro de secciones de la página
export const LoadingSpinner = ({ text = 'Cargando...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-16 gap-3 animate-fade-in ${className}`}>
    <div className="relative flex items-center justify-center">
      <div className="w-9 h-9 border-3 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
      <div className="absolute w-2 h-2 rounded-full bg-primary-500" />
    </div>
    {text && <p className="text-xs font-semibold text-slate-500 tracking-tight">{text}</p>}
  </div>
);

export const EmptyState = ({ icon, title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-14 px-4 gap-2.5 text-center animate-fade-in ${className}`}>
    {icon && (
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
        <i className={`bi ${icon} text-2xl`} />
      </div>
    )}
    <h6 className="font-bold text-slate-700 text-sm">{title}</h6>
    {description && <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);
