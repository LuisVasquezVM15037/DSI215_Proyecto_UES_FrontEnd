import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../services/notificacion.service';
import { getUserRole } from '../services/auth.service';
import Swal from 'sweetalert2';

/**
 * Página completa del Centro de Notificaciones.
 * DENTALCARE-71 (PBI-Secret-16)
 */
export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const userRole = getUserRole() || '';
  const navigate = useNavigate();

  const cargarNotificaciones = async () => {
    setLoading(true);
    try {
      const res = await getNotificaciones({
        rol: userRole,
        soloNoLeidas,
        limit: 50,
      });
      if (res && res.notificaciones) {
        setNotificaciones(res.notificaciones);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, [soloNoLeidas]);

  const handleMarcarLeida = async (id) => {
    try {
      await marcarNotificacionLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasNotificacionesLeidas({ rol: userRole });
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      Swal.fire({
        icon: 'success',
        title: 'Bandeja actualizada',
        text: 'Todas las notificaciones han sido marcadas como leídas.',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filtradas = notificaciones.filter((n) => {
    const coincideTipo = filtroTipo === 'TODOS' || n.tipo === filtroTipo;
    const coincideBusqueda =
      busqueda.trim() === '' ||
      n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.mensaje.toLowerCase().includes(busqueda.toLowerCase());
    return coincideTipo && coincideBusqueda;
  });

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'CITA_PROXIMA':
        return { label: 'Cita Próxima', color: 'bg-amber-100 text-amber-800 ring-amber-300' };
      case 'LISTA_ESPERA':
        return { label: 'Lista de Espera', color: 'bg-blue-100 text-blue-800 ring-blue-300' };
      case 'STOCK_CRITICO':
        return { label: 'Stock Crítico', color: 'bg-red-100 text-red-800 ring-red-300' };
      case 'RENDIMIENTO':
        return { label: 'Rendimiento', color: 'bg-emerald-100 text-emerald-800 ring-emerald-300' };
      default:
        return { label: 'Sistema', color: 'bg-slate-100 text-slate-700 ring-slate-300' };
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-primary-100 text-primary-700 font-bold text-lg">
              <i className="bi bi-bell-fill" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-800">
              Centro de Notificaciones y Eventos
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Historial de avisos clínicos, agenda médica, inventario y rendimiento
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleMarcarTodas}
            className="px-3.5 py-2 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <i className="bi bi-check2-all" /> Marcar todas leídas
          </button>
          <button
            type="button"
            onClick={cargarNotificaciones}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refrescar notificaciones"
          >
            <i className="bi bi-arrow-clockwise text-sm" />
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Filtros por Categoría */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'TODOS', label: 'Todas' },
            { id: 'CITA_PROXIMA', label: 'Citas' },
            { id: 'LISTA_ESPERA', label: 'Lista Espera' },
            { id: 'STOCK_CRITICO', label: 'Stock' },
            { id: 'RENDIMIENTO', label: 'Rendimiento' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFiltroTipo(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filtroTipo === cat.id
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Toggle no leídas y buscador */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={soloNoLeidas}
              onChange={(e) => setSoloNoLeidas(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded-md focus:ring-primary-500 cursor-pointer"
            />
            Solo no leídas
          </label>

          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar en avisos..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 w-44"
            />
          </div>
        </div>
      </div>

      {/* Lista de Notificaciones */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <i className="bi bi-arrow-repeat animate-spin text-2xl block mb-2 text-primary-600" />
            Cargando notificaciones...
          </div>
        ) : filtradas.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <i className="bi bi-bell-slash text-4xl block mb-2 text-slate-300" />
            No se encontraron notificaciones con los criterios seleccionados.
          </div>
        ) : (
          filtradas.map((notif) => {
            const badge = getTipoBadge(notif.tipo);
            const fechaStr = notif.fechaCreacion
              ? new Date(notif.fechaCreacion).toLocaleString('es-SV', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : '';

            return (
              <div
                key={notif.id}
                className={`p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors ${
                  !notif.leida ? 'bg-primary-50/20' : ''
                }`}
              >
                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ring-1 flex-shrink-0 ${badge.color}`}
                >
                  {badge.label}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-xs font-bold text-slate-800">{notif.titulo}</h3>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {fechaStr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    {notif.mensaje}
                  </p>

                  <div className="flex items-center gap-3">
                    {notif.rutaRedireccion && (
                      <button
                        type="button"
                        onClick={() => navigate(notif.rutaRedireccion)}
                        className="text-xs font-bold text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Ir al módulo <i className="bi bi-arrow-right" />
                      </button>
                    )}
                    {!notif.leida && (
                      <button
                        type="button"
                        onClick={() => handleMarcarLeida(notif.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <i className="bi bi-check2" /> Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
