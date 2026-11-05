import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotificaciones,
  getResumenNoLeidas,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../services/notificacion.service';
import { getUserRole } from '../services/auth.service';

/**
 * Componente Campana de Notificaciones con Badge reactivo y Dropdown interactivo.
 * DENTALCARE-71 (PBI-Secret-16)
 */
export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [noLeidas, setNoLeidas] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtroSoloNoLeidas, setFiltroSoloNoLeidas] = useState(false);
  const [cargando, setCargando] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const userRole = getUserRole() || '';

  // Polling para conteo de no leídas cada 30 segundos
  const fetchConteo = async () => {
    try {
      const res = await getResumenNoLeidas({ rol: userRole });
      if (res && res.contador !== undefined) {
        setNoLeidas(res.contador);
      }
    } catch {
      // Error silencioso en polling
    }
  };

  const fetchNotificaciones = async (soloNoLeidas = filtroSoloNoLeidas) => {
    setCargando(true);
    try {
      const res = await getNotificaciones({
        rol: userRole,
        soloNoLeidas,
        limit: 15,
      });
      if (res && res.notificaciones) {
        setNotificaciones(res.notificaciones);
        setNoLeidas(res.totalNoLeidas || 0);
      }
    } catch (e) {
      console.error('Error cargando notificaciones:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchConteo();
    const interval = setInterval(fetchConteo, 30000);
    return () => clearInterval(interval);
  }, [userRole]);

  useEffect(() => {
    if (isOpen) {
      fetchNotificaciones(filtroSoloNoLeidas);
    }
  }, [isOpen, filtroSoloNoLeidas]);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarcarLeida = async (e, id) => {
    e.stopPropagation();
    try {
      await marcarNotificacionLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasNotificacionesLeidas({ rol: userRole });
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickItem = (notif) => {
    if (!notif.leida) {
      marcarNotificacionLeida(notif.id).catch(() => {});
      setNoLeidas((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (notif.rutaRedireccion) {
      navigate(notif.rutaRedireccion);
    }
  };

  const getTipoIcono = (tipo) => {
    switch (tipo) {
      case 'CITA_PROXIMA':
        return 'bi-clock-history text-amber-500 bg-amber-50';
      case 'LISTA_ESPERA':
        return 'bi-person-lines-fill text-blue-500 bg-blue-50';
      case 'STOCK_CRITICO':
        return 'bi-exclamation-triangle text-red-500 bg-red-50';
      case 'RENDIMIENTO':
        return 'bi-graph-up-arrow text-emerald-500 bg-emerald-50';
      default:
        return 'bi-bell text-primary-500 bg-primary-50';
    }
  };

  const formatearTiempo = (fechaIso) => {
    if (!fechaIso) return '';
    const fecha = new Date(fechaIso);
    const ahora = new Date();
    const diffMins = Math.floor((ahora - fecha) / 60000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHoras = Math.floor(diffMins / 60);
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    return fecha.toLocaleDateString('es-SV', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón campana con badge */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notificaciones"
        title="Centro de Notificaciones"
        className="relative w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer outline-none"
      >
        <i className="bi bi-bell text-base" />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate__animated animate__fadeIn animate__faster">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">Notificaciones</span>
              {noLeidas > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-700">
                  {noLeidas} nuevas
                </span>
              )}
            </div>
            {noLeidas > 0 && (
              <button
                type="button"
                onClick={handleMarcarTodas}
                className="text-xs text-primary-600 hover:text-primary-800 font-semibold cursor-pointer"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* Filtros rápidos */}
          <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => setFiltroSoloNoLeidas(false)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                !filtroSoloNoLeidas
                  ? 'bg-slate-200/80 text-slate-800'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFiltroSoloNoLeidas(true)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filtroSoloNoLeidas
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              No leídas ({noLeidas})
            </button>
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {cargando ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <i className="bi bi-arrow-repeat animate-spin text-lg block mb-1" />
                Cargando notificaciones...
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <i className="bi bi-bell-slash text-2xl block mb-1 text-slate-300" />
                No hay notificaciones {filtroSoloNoLeidas ? 'sin leer' : ''}
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleClickItem(notif)}
                  className={`px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !notif.leida ? 'bg-primary-50/40' : ''
                  }`}
                >
                  {/* Ícono de tipo */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${getTipoIcono(
                      notif.tipo
                    )}`}
                  >
                    <i
                      className={`bi ${
                        notif.tipo === 'CITA_PROXIMA'
                          ? 'bi-clock-history'
                          : notif.tipo === 'LISTA_ESPERA'
                          ? 'bi-person-plus-fill'
                          : notif.tipo === 'STOCK_CRITICO'
                          ? 'bi-exclamation-diamond-fill'
                          : notif.tipo === 'RENDIMIENTO'
                          ? 'bi-graph-up'
                          : 'bi-bell-fill'
                      }`}
                    />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {notif.titulo}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatearTiempo(notif.fechaCreacion)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.mensaje}
                    </p>
                  </div>

                  {/* Botón individual marcar leída */}
                  {!notif.leida && (
                    <button
                      type="button"
                      title="Marcar como leída"
                      onClick={(e) => handleMarcarLeida(e, notif.id)}
                      className="text-slate-300 hover:text-primary-600 p-1 flex-shrink-0"
                    >
                      <i className="bi bi-check2-circle text-base" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/notificaciones');
              }}
              className="text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline cursor-pointer"
            >
              Ver bandeja completa de notificaciones &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
