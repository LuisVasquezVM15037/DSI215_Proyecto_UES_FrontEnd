import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsultaIndex } from '../hooks/useConsultaIndex';
import { formatHora, getEstadoConfig } from '../utils/cita.utils';
import { ESTADOS_INICIABLES } from '../constants/estados.constants';
import StatusBadge from '../components/ui/StatusBadge';
import AvatarBadge from '../components/ui/AvatarBadge';
import SearchInput from '../components/ui/SearchInput';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { LoadingSpinner, EmptyState } from '../components/ui/LoadingSpinner';
import 'bootstrap-icons/font/bootstrap-icons.css';

const StatCard = ({ value, label, color, icon }) => (
  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-card flex-1">
    <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
      <i className={`bi ${icon} ${color} text-base`} />
    </div>
    <div>
      <p className={`text-2xl font-bold tabular-nums leading-none ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  </div>
);

/**
 * Página principal del módulo de consultas.
 * Toda la lógica de datos vive en useConsultaIndex.
 */
const ConsultaIndexPage = () => {
  const navigate = useNavigate();
  const {
    citasDeHoy, loading, stats,
    searchTerm, setSearchTerm,
    pacientesFiltrados,
    showHistorial, handleCerrarHistorial,
    pacienteSeleccionado, citasPaciente,
    handleBuscarHistorial,
  } = useConsultaIndex();

  return (
    <div className="flex flex-col h-full p-5 bg-surface">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 animate-fade-in-down">
        <div>
          <h4 className="text-lg font-bold text-slate-800">Gestión de Consultas</h4>
          <p className="text-xs text-slate-500 mt-0.5 capitalize">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>

        {/* Buscador de historial */}
        <div className="relative w-72 flex-shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Buscar historial de paciente..."
          />
          {pacientesFiltrados.length > 0 && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-40 bg-white
                            border border-slate-200 rounded-xl shadow-xl overflow-hidden">
              {pacientesFiltrados.map(p => (
                <button
                  key={p.idPaciente}
                  type="button"
                  onClick={() => handleBuscarHistorial(p)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50
                             transition-colors text-left"
                >
                  <AvatarBadge
                    initials={`${p.nombrePaciente?.[0] ?? ''}${p.apellidoPaciente?.[0] ?? ''}`}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {p.nombrePaciente} {p.apellidoPaciente}
                    </p>
                    <p className="text-xs text-slate-400">DUI: {p.numeroIdentidadPaciente}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 animate-fade-in">
        <StatCard value={stats.total}        label="Citas hoy"      color="text-primary-600"  icon="bi-calendar3"          />
        <StatCard value={stats.pendientes}   label="Pendientes"     color="text-amber-500"    icon="bi-clock"              />
        <StatCard value={stats.completadas}  label="Completadas"    color="text-emerald-600"  icon="bi-check-circle"       />
        <StatCard value={stats.noAsistieron} label="No asistieron"  color="text-red-500"      icon="bi-person-x"           />
      </div>

      {/* Lista de citas */}
      <div className="flex-1 overflow-y-auto">
        {loading && <LoadingSpinner text="Cargando citas del día..." />}

        {!loading && citasDeHoy.length === 0 && (
          <EmptyState
            icon="bi-calendar-x"
            title="No hay citas para hoy"
            description="No tienes citas programadas para el día de hoy."
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {citasDeHoy.map(cita => {
            const puedeIniciar = ESTADOS_INICIABLES.includes(cita.estadoCita);
            return (
              <div key={cita.idCitas}
                className="bg-white rounded-2xl border border-slate-200 shadow-card p-4
                           flex flex-col gap-3 animate-fade-in-up hover:shadow-card-md
                           hover:border-primary-200 transition-all">

                {/* Hora */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-700
                                bg-primary-50 px-2.5 py-1 rounded-lg self-start">
                  <i className="bi bi-clock text-[10px]" />
                  {formatHora(cita.horaInicioCita)} — {formatHora(cita.horaFinCita)}
                </div>

                {/* Paciente */}
                <div className="flex items-center gap-3">
                  <AvatarBadge
                    initials={cita.nombreCompletoPaciente?.[0] ?? '?'}
                    size="md"
                  />
                  <div className="min-w-0">
                    <h6 className="font-bold text-slate-800 text-sm truncate">
                      {cita.nombreCompletoPaciente}
                    </h6>
                    <p className="text-xs text-slate-400">DUI: {cita.numeroIdentidadPaciente}</p>
                  </div>
                </div>

                {/* Especialidad + estado */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
                    <i className="bi bi-person-badge flex-shrink-0" />
                    {cita.especialidadOdontologo}
                  </span>
                  <StatusBadge estado={cita.estadoCita} />
                </div>

                {/* Motivo cancelación */}
                {cita.motivoCancelacion && (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <i className="bi bi-info-circle flex-shrink-0" />
                    {cita.motivoCancelacion}
                  </p>
                )}

                {/* Botón de acción */}
                {puedeIniciar ? (
                  <Button fullWidth onClick={() => navigate(`/consulta/${cita.idCitas}`)}>
                    <i className="bi bi-play-circle" />Iniciar Consulta
                  </Button>
                ) : (
                  <Button variant="secondary" fullWidth onClick={() => navigate(`/consulta/${cita.idCitas}`)}>
                    <i className="bi bi-eye" />Ver Consulta
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de historial */}
      <Modal
        isOpen={showHistorial && !!pacienteSeleccionado}
        onClose={handleCerrarHistorial}
        title="Historial de consultas"
        subtitle={pacienteSeleccionado
          ? `${pacienteSeleccionado.nombrePaciente} ${pacienteSeleccionado.apellidoPaciente} — DUI: ${pacienteSeleccionado.numeroIdentidadPaciente}`
          : ''}
        size="md"
        footer={
          <Button variant="secondary" onClick={handleCerrarHistorial}>Cerrar</Button>
        }
      >
        {citasPaciente.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            Este paciente no tiene citas registradas.
          </p>
        ) : (
          <div className="space-y-3">
            {citasPaciente.map(c => {
              const fecha = Array.isArray(c.fechaCita)
                ? `${c.fechaCita[2]}/${c.fechaCita[1]}/${c.fechaCita[0]}`
                : c.fechaCita;
              return (
                <div key={c.idCitas}
                  className="flex items-center justify-between gap-3 p-3 bg-slate-50
                             border border-slate-200 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{fecha}</p>
                    <p className="text-xs text-slate-400">
                      {formatHora(c.horaInicioCita)} — {c.especialidadOdontologo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge estado={c.estadoCita} />
                    <Button
                      variant="outline" size="xs"
                      onClick={() => { handleCerrarHistorial(); navigate(`/consulta/${c.idCitas}`); }}
                    >
                      Ver detalle
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsultaIndexPage;
