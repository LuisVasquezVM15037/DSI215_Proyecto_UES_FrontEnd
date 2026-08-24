import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { formatHora, getEstadoConfig } from '../utils/cita.utils';
import StatusBadge from '../components/ui/StatusBadge';
import AvatarBadge from '../components/ui/AvatarBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import 'bootstrap-icons/font/bootstrap-icons.css';

const StatCard = ({ value, label, color }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl
                  border border-slate-200 shadow-card flex-1">
    <span className={`text-3xl font-bold tabular-nums ${color}`}>{value}</span>
    <span className="text-xs text-slate-500 mt-1 text-center leading-tight">{label}</span>
  </div>
);

const QuickAction = ({ icon, title, desc, onClick, colorClass }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200
                shadow-card cursor-pointer hover:shadow-card-md hover:-translate-y-0.5
                hover:border-primary-200 transition-all duration-200 text-left w-full`}
  >
    <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center
                     text-white text-xl flex-shrink-0 shadow-sm`}>
      <i className={`bi ${icon}`} />
    </div>
    <div>
      <h5 className="font-semibold text-slate-800 text-sm leading-tight">{title}</h5>
      <span className="text-xs text-slate-400">{desc}</span>
    </div>
  </button>
);

/**
 * Página principal del dashboard.
 * Toda la lógica de datos vive en useHomeDashboard.
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { citasHoy, loading, userName, today, stats } = useHomeDashboard();

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Saludo */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Hola, {userName}! 👋</h2>
        <p className="text-sm text-slate-500 mt-0.5 capitalize">
          Aquí tienes el resumen de tu clínica para hoy, {today}.
        </p>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickAction icon="bi-person-plus"  title="Registrar Paciente"  desc="Crear nuevo expediente clínico"   colorClass="bg-primary-600"  onClick={() => navigate('/pacientes')} />
        <QuickAction icon="bi-calendar-event" title="Agenda de Citas"   desc="Ver programaciones de hoy"        colorClass="bg-dental-600"   onClick={() => navigate('/agenda')} />
        <QuickAction icon="bi-heart-pulse"  title="Iniciar Consulta"    desc="Ver citas del día y atender"      colorClass="bg-violet-600"   onClick={() => navigate('/consulta')} />
        <QuickAction icon="bi-book"        title="Panel de Administración"    desc="Reportes, Inventarios ..." colorClass="bg-slate-700"    onClick={() => navigate('/Administracion')} />
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Widget: Próximas citas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h5 className="font-bold text-slate-800 text-sm">Próximas citas de hoy</h5>
            <button
              type="button"
              onClick={() => navigate('/agenda')}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors"
            >
              Ver toda la agenda →
            </button>
          </div>
          <div className="p-4">
            {loading && <LoadingSpinner text="Cargando citas..." />}
            {!loading && citasHoy.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">
                No hay citas programadas para hoy.
              </p>
            )}
            <ul className="space-y-3">
              {citasHoy.map(cita => (
                <li key={cita.idCitas}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="text-xs font-bold text-primary-600 tabular-nums w-16 flex-shrink-0">
                    {formatHora(cita.horaInicioCita)}
                  </span>
                  <AvatarBadge
                    initials={`${cita.nombreCompletoPaciente?.[0] ?? '?'}`}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {cita.nombreCompletoPaciente}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{cita.especialidadOdontologo}</p>
                  </div>
                  <StatusBadge estado={cita.estadoCita} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Widget: Resumen del día */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h5 className="font-bold text-slate-800 text-sm">Resumen de hoy</h5>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <StatCard value={stats.total}         label="Programadas"   color="text-primary-600" />
            <StatCard value={stats.completadas}   label="Completadas"   color="text-emerald-600" />
            <StatCard value={stats.pendientes}    label="Pendientes"    color="text-amber-500"   />
            <StatCard value={stats.reprogramadas} label="Reprogramadas" color="text-violet-600"  />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
