import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { formatHora } from '../utils/cita.utils';
import StatusBadge from '../components/ui/StatusBadge';
import AvatarBadge from '../components/ui/AvatarBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

/**
 * =============================================================================
 * COMPONENTE AUXILIAR: StatCard
 * =============================================================================
 * 
 * Propósito:
 *   Renderiza una tarjeta métrica individual con conteo numérico destacado,
 *   etiqueta descriptiva e ícono temático con esquema de color personalizable.
 * 
 * Parámetros y Retornos:
 *   @param {Object} props - Propiedades del componente.
 *   @param {number|string} props.value - Valor cuantitativo a mostrar.
 *   @param {string} props.label - Título descriptivo de la métrica.
 *   @param {string} props.color - Clase de color de Tailwind para el texto e icono.
 *   @param {string} props.bgClass - Clase de fondo para el contenedor del icono.
 *   @param {string} props.icon - Nombre de la clase del icono de Bootstrap Icons.
 *   @returns {JSX.Element} Tarjeta métrica estilizada.
 */
const StatCard = ({ value, label, color, bgClass, icon }) => (
  <div className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-md transition-all">
    <div className={`w-11 h-11 rounded-xl ${bgClass} flex items-center justify-center flex-shrink-0 text-base shadow-xs`}>
      <i className={`bi ${icon} ${color}`} />
    </div>
    <div className="min-w-0">
      <span className={`text-2xl font-extrabold tabular-nums tracking-tight block leading-none ${color}`}>
        {value}
      </span>
      <span className="text-xs font-semibold text-slate-500 mt-1 block truncate">
        {label}
      </span>
    </div>
  </div>
);

/**
 * =============================================================================
 * COMPONENTE AUXILIAR: QuickAction
 * =============================================================================
 * 
 * Propósito:
 *   Botón interactivo de navegación rápida hacia los flujos centrales de la clínica
 *   (nuevo paciente, agendar cita, atender consultas y administración de usuarios).
 * 
 * Parámetros y Retornos:
 *   @param {Object} props - Propiedades del componente.
 *   @param {string} props.icon - Clase de Bootstrap Icons.
 *   @param {string} props.title - Título principal de la acción.
 *   @param {string} props.desc - Breve descripción del destino.
 *   @param {Function} props.onClick - Manejador de clic para enrutar o disparar acción.
 *   @param {string} props.colorClass - Clase Tailwind para el fondo del ícono.
 *   @param {string} props.borderHover - Clase Tailwind aplicada al estado hover del borde.
 *   @returns {JSX.Element} Botón de acceso directo con animación y microinteracción.
 */
const QuickAction = ({ icon, title, desc, onClick, colorClass, borderHover }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex items-start gap-4 p-5 bg-white rounded-3xl border border-slate-200/80
                shadow-card hover:shadow-card-hover hover:-translate-y-1 ${borderHover}
                transition-all duration-200 text-left w-full outline-none cursor-pointer`}
  >
    <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center
                     text-white text-xl flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
      <i className={`bi ${icon}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h5 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-primary-700 transition-colors">
          {title}
        </h5>
        <i className="bi bi-arrow-right text-xs text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
      </div>
      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed truncate">{desc}</p>
    </div>
  </button>
);

/**
 * =============================================================================
 * VISTA: DashboardPage
 * =============================================================================
 * 
 * Propósito:
 *   Panel de control y bienvenida principal del sistema DentalCare.
 *   Ofrece una visión general de la actividad de la clínica en la fecha actual:
 *   - Saludo contextual con el nombre del usuario autenticado y la fecha formateada.
 *   - Accesos directos a los módulos con mayor frecuencia de uso.
 *   - Listado en tiempo real de las citas programadas para el día de hoy, con hora,
 *     paciente, especialidad y estado visual.
 *   - Tarjetas métricas de síntesis con el desglose estadístico diario (citas totales,
 *     completadas, pendientes de atención y reprogramadas).
 * 
 * Ubicación y Rol:
 *   src/views/DashboardPage.jsx
 *   Capa de Vistas / Páginas (Ruta protegida: /dashboard).
 * 
 * Trazabilidad (Referencias):
 *   - Invocado desde:
 *     * src/App.jsx (Definido como elemento protegido dentro de Layout en /dashboard).
 *   - Consume:
 *     * react-router-dom (useNavigate para la navegación interna entre rutas).
 *     * src/hooks/useHomeDashboard.js (useHomeDashboard para la ingesta reactiva de datos).
 *     * src/utils/cita.utils.js (formatHora para la representación amigable de horarios).
 *     * src/components/ui/StatusBadge.jsx (Badge cromático de estado de cita).
 *     * src/components/ui/AvatarBadge.jsx (Inicial del paciente).
 *     * src/components/ui/LoadingSpinner.jsx (Indicador de carga durante consultas).
 * 
 * Parámetros y Retornos:
 *   @returns {JSX.Element} Vista del dashboard ejecutivo con tarjetas y métricas.
 * =============================================================================
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  // Consume el estado global del panel mediante el hook especializado
  const { citasHoy, loading, userName, today, stats } = useHomeDashboard();

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-7 animate-fade-in">

      {/* Saludo y cabecera de bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-900 via-primary-800 to-dental-800 text-white p-7 rounded-3xl shadow-xl shadow-primary-950/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-dental-200 mb-3 backdrop-blur-md">
            <i className="bi bi-activity text-dental-300" />
            Panel Clínico en Vivo
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">
            ¡Hola, {userName || 'Doctor(a)'}! 👋
          </h2>
          <p className="text-primary-100 text-xs md:text-sm mt-1 capitalize">
            Resumen de actividad para hoy, {today}.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/consulta')}
            className="px-4 py-2.5 rounded-xl bg-white text-primary-800 text-xs font-bold
                       shadow-sm hover:bg-primary-50 transition-all active:scale-95 flex items-center gap-2"
          >
            <i className="bi bi-play-circle-fill text-dental-600 text-sm" />
            Atender Consultas
          </button>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 px-1">
          Acciones Frecuentes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon="bi-person-plus-fill"
            title="Nuevo Paciente"
            desc="Crear expediente clínico"
            colorClass="bg-primary-600"
            borderHover="hover:border-primary-300"
            onClick={() => navigate('/pacientes')}
          />
          <QuickAction
            icon="bi-calendar-plus-fill"
            title="Agendar Cita"
            desc="Programar nueva atención"
            colorClass="bg-dental-600"
            borderHover="hover:border-dental-300"
            onClick={() => navigate('/agenda')}
          />
          <QuickAction
            icon="bi-heart-pulse-fill"
            title="Consultas de Hoy"
            desc="Atención y odontograma"
            colorClass="bg-blue-600"
            borderHover="hover:border-blue-300"
            onClick={() => navigate('/consulta')}
          />
          <QuickAction
            icon="bi-people-fill"
            title="Gestión de Personal"
            desc="Administrar usuarios del sistema"
            colorClass="bg-slate-700"
            borderHover="hover:border-slate-400"
            onClick={() => navigate('/usuarios')}
          />
        </div>
      </div>

      {/* Widgets principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Widget: Próximas citas */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
              <h5 className="font-bold text-slate-800 text-sm">Próximas citas para hoy</h5>
            </div>
            <button
              type="button"
              onClick={() => navigate('/agenda')}
              className="text-xs text-primary-600 hover:text-primary-800 font-semibold transition-colors flex items-center gap-1"
            >
              Ver agenda completa <i className="bi bi-arrow-right text-[11px]" />
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            {loading && <LoadingSpinner text="Consultando citas del día..." />}

            {!loading && citasHoy.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <i className="bi bi-calendar2-check text-xl" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Sin citas pendientes hoy</p>
                <p className="text-xs text-slate-400 mt-0.5">No hay citas programadas para el resto de la jornada.</p>
              </div>
            )}

            {!loading && citasHoy.length > 0 && (
              <ul className="space-y-2.5">
                {citasHoy.map(cita => (
                  <li
                    key={cita.idCitas}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all duration-150"
                  >
                    <div className="px-2.5 py-1 rounded-xl bg-primary-50 text-primary-700 font-bold text-xs tabular-nums flex items-center gap-1 flex-shrink-0">
                      <i className="bi bi-clock text-[10px]" />
                      {formatHora(cita.horaInicioCita)}
                    </div>

                    <AvatarBadge
                      initials={`${cita.nombreCompletoPaciente?.[0] ?? '?'}`}
                      size="sm"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {cita.nombreCompletoPaciente}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {cita.especialidadOdontologo || 'Odontología General'}
                      </p>
                    </div>

                    <StatusBadge estado={cita.estadoCita} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Widget: Resumen estadístico del día */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden flex flex-col">
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
            <h5 className="font-bold text-slate-800 text-sm">Resumen de Hoy</h5>
          </div>

          <div className="p-5 grid grid-cols-2 gap-3 flex-1">
            <StatCard
              value={stats.total}
              label="Programadas"
              color="text-primary-700"
              bgClass="bg-primary-50"
              icon="bi-calendar-event"
            />
            <StatCard
              value={stats.completadas}
              label="Completadas"
              color="text-emerald-700"
              bgClass="bg-emerald-50"
              icon="bi-check2-circle"
            />
            <StatCard
              value={stats.pendientes}
              label="Pendientes"
              color="text-amber-700"
              bgClass="bg-amber-50"
              icon="bi-hourglass-split"
            />
            <StatCard
              value={stats.reprogramadas}
              label="Reprogramadas"
              color="text-violet-700"
              bgClass="bg-violet-50"
              icon="bi-arrow-repeat"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
