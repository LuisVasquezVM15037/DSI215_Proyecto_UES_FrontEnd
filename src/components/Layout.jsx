import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { getUserName, getUserRole, clearSession } from '../services/auth.service';
import { confirmDialog } from '../utils/alert.utils';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ROLES, normalizeRole } from '../constants/roles.constants';

//Este es el componente de Layout principal que envuelve toda la aplicación. Contiene la estructura de la interfaz, incluyendo la barra lateral de navegación, el encabezado y el área de contenido donde se renderizan las rutas hijas mediante <Outlet />. También maneja la lógica del menú de usuario y el cierre de sesión.

// Configuración de rutas para la barra lateral, cada una con su ícono y etiqueta.
const NAV_ITEMS = [
  {
    // Para que todos los roles puedan ver el dashboard
    path:  '/dashboard',
    icon:  'bi-house',
    label: 'Inicio',
  },
  {
    // Para que solo el admin y la secretaria puedan ver la agenda
    path:  '/agenda',
    icon:  'bi-calendar3',
    label: 'Agenda',    
    allowedRoles: [ROLES.ADMIN, ROLES.SECRETARIA],
  },
  {
     // Para que solo el admin y la secretaria puedan ver los pacientes
    path:         '/pacientes',
    icon:         'bi-people',
    label:        'Pacientes',
    allowedRoles: [ROLES.ADMIN, ROLES.SECRETARIA],
  },
  {
     // Para que solo el admin y odontologo puedan ver las consultas
    path:         '/consulta',
    icon:         'bi-heart-pulse',
    label:        'Consultas',
    allowedRoles: [ROLES.ADMIN, ROLES.ODONTOLOGO],
  },
  {
     // Para que solo el admin pueda ver los usuarios
    path:         '/usuarios',
    icon:         'bi-person-badge',
    label:        'Usuarios',
    allowedRoles: [ROLES.ADMIN],
  },
  {
     // Para que solo el admin pueda ver la revision de los accesos
    path:         '/revisar-accesos',
    icon:         'bi-shield-check',
    label:        'Revisar Accesos',
    allowedRoles: [ROLES.ADMIN],
  },
];

// El componente Layout es el contenedor principal de la aplicación, que incluye la barra lateral de navegación, el encabezado y el área de contenido donde se renderizan las rutas hijas.
const Layout = () => {
  const navigate  = useNavigate(); // Hook de React Router para programáticamente cambiar de ruta.
  const location  = useLocation();// Hook de React Router para obtener información sobre la ruta actual, útil para determinar qué enlace de navegación está activo.
  const [menuOpen, setMenuOpen] = useState(false); // Estado local para controlar si el menú de usuario (dropdown) está abierto o cerrado.
  const menuRef   = useRef(null); // Referencia al contenedor del menú de usuario, utilizada para detectar clics fuera del menú y cerrarlo automáticamente.

// Memoizado: localStorage no cambia durante la sesión
const userName = useMemo(() => getUserName(), []);
// Normaliza el rol obtenido del storage para comparaciones consistentes en el filtro de la sidebar del layout
const userRole = useMemo(() => normalizeRole(getUserRole()), []);



// PBI REVISAR ACCESOS
  // Las iniciales se generan tomando la primera letra de cada palabra en el nombre del usuario, convirtiéndolas a mayúsculas y limitando a las primeras dos letras. Esto se muestra en el avatar del menú de usuario.
  const initials = useMemo(() =>
    userName.split(' ').map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join(''),
    [userName],
  );
//
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); // Si el clic es fuera del menú, se cierra el menú estableciendo `menuOpen` a false.
    };
    // Se agrega un event listener al documento para detectar clics en cualquier parte de la página. Si el clic ocurre fuera del menú de usuario, se cierra el menú.
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // La función `handleLogout` se encarga de manejar el proceso de cierre de sesión. Primero, cierra el menú de usuario. Luego, muestra un cuadro de diálogo de confirmación para asegurarse de que el usuario desea cerrar sesión. Si el usuario confirma, se limpia la sesión (eliminando tokens o datos relacionados) y se redirige al usuario a la página de inicio (ruta '/').
  const handleLogout = async () => {
    setMenuOpen(false);
    const confirmed = await confirmDialog('¿Cerrar sesión?', '¿Estás seguro que deseas salir del sistema?', 'Sí, salir');
    if (!confirmed) return;
    clearSession();
    navigate('/');
  };

  // El componente retorna la estructura JSX que define la interfaz de usuario. La barra lateral de navegación se construye iterando sobre `NAV_ITEMS` para crear botones de navegación. El encabezado muestra el nombre del sistema y un menú de usuario con opciones. El área principal utiliza `<Outlet />` para renderizar las rutas hijas según la ruta activa.
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className="flex flex-col w-[60px] bg-white border-r border-slate-100
                        shadow-card flex-shrink-0 z-20">
        {/* El Logo de la aplicación */}
        <button
          onClick={() => navigate('/dashboard')} // Al hacer clic, se redirige a la página de inicio (ruta '/dashboard').
          aria-label="Ir al inicio"
          className="h-14 flex items-center justify-center text-primary-600 font-black
                     text-lg tracking-tight hover:bg-primary-50 transition-colors
                     border-b border-slate-100"
        >
          {/*El logo de la aplicación es un botón que redirige a la página de inicio (ruta '/dashboar */}
          DC
        </button>

        {/* Nav */}
        <nav className="flex-1 flex flex-col items-center gap-1.5 py-3" aria-label="Navegación principal">
          {/* Se itera sobre cada elemento de `NAV_ITEMS`, filtrando según el rol del usuario, para crear un botón de navegación en la barra lateral. Se determina si el enlace está activo comparando la ruta actual con la ruta del enlace. Si el enlace está activo, se aplican estilos diferentes para resaltarlo visualmente. */}
          {NAV_ITEMS
            .filter(({ allowedRoles }) =>
             !allowedRoles || allowedRoles.includes(userRole)
              )
             .map(({ path, icon, label }) => {
            const isActive = location.pathname === path ||
              (path !== '/dashboard' && location.pathname.startsWith(path));
            return (
              // Cada botón de navegación tiene un ícono y una etiqueta, y al hacer clic se navega a la ruta correspondiente. El botón también tiene atributos de accesibilidad como `aria-label` y `aria-current` para mejorar la experiencia de usuarios con tecnologías asistivas.
              <button
                key={path}
                onClick={() => navigate(path)}
                title={label}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                            transition-all duration-150 focus-visible:outline-2
                            focus-visible:outline-primary-500
                            ${isActive // Si el enlace está activo, se aplican estilos para resaltarlo (fondo primario, texto blanco y sombra). Si no está activo, se aplican estilos de texto gris con efectos hover para indicar que es interactivo.
                              ? 'bg-primary-600 text-white shadow-md shadow-primary-200/50'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                            }`}
              >
                {/*El ícono se muestra utilizando la clase de Bootstrap Icons correspondiente al valor de `icon` definido en `NAV_ITEMS`. */}
                <i className={`bi ${icon}`} /> 
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {/*El botón de configuración en el pie de la barra lateral, que actualmente no tiene funcionalidad asignada pero está preparado para futuras implementaciones. Tiene estilos que cambian al pasar el mouse para indicar que es interactivo. */}
        <div className="pb-4 flex justify-center">
          <button
            title="Configuración"
            aria-label="Configuración"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg
                       text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <i className="bi bi-gear" />
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center
                           justify-between px-5 flex-shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2">
            {/* // Logo de la aplicación */}
            <span className="font-bold text-primary-700 tracking-tight">DentalCare</span>
            <span className="text-slate-300 text-sm font-normal">ERP</span>
          </div>
            {/* // El área del encabezado a la derecha contiene un botón de notificaciones (ícono de campana) y un menú de usuario representado por un avatar con las iniciales del usuario. Al hacer clic en el avatar, se despliega un menú con opciones relacionadas con la cuenta del usuario, incluyendo la opción de cerrar sesión. */}
          <div className="flex items-center gap-2">
            {/* Campana */}
            {/* // El botón de notificaciones, que actualmente no tiene funcionalidad asignada pero está preparado para futuras implementaciones. Tiene estilos que cambian al pasar el mouse para indicar que es interactivo. */}
            <button
              aria-label="Notificaciones"
              className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100
                         hover:text-slate-600 flex items-center justify-center transition-colors"
            >
              <i className="bi bi-bell text-sm" />
            </button>

            {/* Avatar con dropdown */}
            {/* // El menú de usuario, que muestra las iniciales del usuario en un círculo. Al hacer clic, se despliega un menú con información del usuario y la opción de cerrar sesión. El menú se cierra automáticamente al hacer clic fuera de él gracias al event listener configurado en el useEffect. */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(p => !p)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Menú de cuenta"
                className="w-8 h-8 rounded-full bg-primary-600 text-white text-xs font-bold
                           flex items-center justify-center hover:bg-primary-700
                           transition-colors select-none ring-2 ring-white"
              >
                {/* // Las iniciales del usuario se muestran dentro del avatar, que es un círculo con fondo primario y texto blanco. Al hacer clic en el avatar, se alterna la visibilidad del menú de usuario. El botón también tiene atributos de accesibilidad para indicar que es un menú desplegable y para describir su función a los usuarios de tecnologías asistivas. */}
                {initials}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute top-[calc(100%+8px)] right-0 w-56 bg-white
                             rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-100
                             overflow-hidden z-50 animate-fade-in"
                >
                  {/* Info del usuario */}
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100
                                  flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-600 text-white text-xs
                                    font-bold flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                      <p className="text-xs text-slate-500 truncate">{userRole}</p>
                    </div>
                  </div>

                  {/* Cerrar sesión */}
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium
                               text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <i className="bi bi-box-arrow-right" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenido de la ruta activa */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
