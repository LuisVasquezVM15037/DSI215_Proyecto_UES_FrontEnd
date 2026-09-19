import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { getUserName, getUserRole, clearSession } from '../services/auth.service';
import { confirmDialog } from '../utils/alert.utils';
import { ROLES, normalizeRole } from '../constants/roles.constants';

/**
 * Configuración central de rutas para la barra lateral con roles autorizados e iconos.
 */
const NAV_ITEMS = [
  {
    path:  '/dashboard',
    icon:  'bi-grid-1x2',
    label: 'Inicio',
  },
  {
    path:  '/agenda',
    icon:  'bi-calendar-check',
    label: 'Agenda',
    allowedRoles: [ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.GERENTE],
  },
  {
    path:  '/pacientes',
    icon:  'bi-people',
    label: 'Pacientes',
    allowedRoles: [ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.GERENTE],
  },
  {
    path:  '/consulta',
    icon:  'bi-heart-pulse',
    label: 'Consultas',
    allowedRoles: [ROLES.ADMIN, ROLES.ODONTOLOGO],
  },
  {
    path:  '/usuarios',
    icon:  'bi-person-badge',
    label: 'Usuarios',
    allowedRoles: [ROLES.ADMIN, ROLES.GERENTE],
  },
  {
    path:  '/revisar-accesos',
    icon:  'bi-shield-check',
    label: 'Revisar Accesos',
    allowedRoles: [ROLES.ADMIN],
  },
];

/**
 * Layout principal moderno con barra lateral interactiva y encabezado clínico.
 */
const Layout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef   = useRef(null);

  const userName = useMemo(() => getUserName(), []);
  const userRole = useMemo(() => normalizeRole(getUserRole()), []);

  const initials = useMemo(() =>
    userName.split(' ').map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join(''),
    [userName],
  );

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    const confirmed = await confirmDialog('¿Cerrar sesión?', '¿Estás seguro que deseas salir del sistema?', 'Sí, salir');
    if (!confirmed) return;
    clearSession();
    navigate('/');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className="flex flex-col w-[72px] bg-white border-r border-slate-200/80
                        shadow-card flex-shrink-0 z-20 transition-all">
        {/* Logo de la aplicación */}
        <div className="h-16 flex items-center justify-center border-b border-slate-100">
          <button
            onClick={() => navigate('/dashboard')}
            aria-label="Ir al inicio"
            title="DentalCare ERP"
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-dental-400
                       text-white font-extrabold text-sm tracking-tighter flex items-center justify-center
                       shadow-md shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            DC
          </button>
        </div>

        {/* Navegación vertical */}
        <nav className="flex-1 flex flex-col items-center gap-2 py-4" aria-label="Navegación principal">
          {NAV_ITEMS
            .filter(({ allowedRoles }) => !allowedRoles || allowedRoles.includes(userRole))
            .map(({ path, icon, label }) => {
              const isActive = location.pathname === path ||
                (path !== '/dashboard' && location.pathname.startsWith(path));

              return (
                <div key={path} className="relative group">
                  <button
                    onClick={() => navigate(path)}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      w-11 h-11 rounded-2xl flex items-center justify-center text-lg
                      transition-all duration-200 outline-none
                      ${isActive
                        ? 'bg-gradient-to-tr from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/30 scale-105'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/90 active:scale-95'
                      }
                    `}
                  >
                    <i className={`bi ${icon}`} />
                  </button>

                  {/* Tooltip flotante a la derecha */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5
                                  bg-slate-800 text-white text-xs font-semibold rounded-lg
                                  opacity-0 pointer-events-none group-hover:opacity-100
                                  transition-opacity duration-150 z-50 whitespace-nowrap shadow-lg">
                    {label}
                  </div>
                </div>
              );
            })}
        </nav>

        {/* Pie de la barra lateral */}
        <div className="pb-4 flex justify-center border-t border-slate-100 pt-3">
          <button
            title="Panel DentalCare"
            aria-label="Información del sistema"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-base
                       text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <i className="bi bi-shield-check" />
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER SUPERIOR */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center
                           justify-between px-6 flex-shrink-0 z-10">
          
          {/* Título y badge clínico */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-800 text-base tracking-tight font-display">
                DentalCare
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 ring-1 ring-primary-200/60">
                ERP Clínico
              </span>
            </div>

            <span className="hidden md:inline-block text-slate-300">/</span>

            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 capitalize">
              <i className="bi bi-calendar3 text-slate-400" />
              {todayFormatted}
            </span>
          </div>

          {/* Acciones del encabezado */}
          <div className="flex items-center gap-3">

            {/* Campana de notificaciones */}
            <button
              type="button"
              aria-label="Notificaciones"
              className="relative w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100
                         hover:text-slate-600 flex items-center justify-center transition-colors"
            >
              <i className="bi bi-bell text-sm" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-white" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* Dropdown de usuario */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(p => !p)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Menú de cuenta"
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-100/80
                           transition-all outline-none border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-dental-500
                                text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                    {userRole}
                  </p>
                </div>
                <i className={`bi bi-chevron-${menuOpen ? 'up' : 'down'} text-slate-400 text-[10px] hidden sm:inline`} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute top-[calc(100%+8px)] right-0 w-60 bg-white
                             rounded-2xl shadow-xl border border-slate-200/80
                             overflow-hidden z-50 animate-scale-in"
                >
                  {/* Tarjeta de información del usuario */}
                  <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-dental-500
                                    text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-100 text-primary-700">
                        {userRole}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="p-1.5">
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-xs font-semibold
                                 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                    >
                      <i className="bi bi-box-arrow-right text-sm" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Área de rutas hijas */}
        <div className="flex-1 overflow-auto bg-surface">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
