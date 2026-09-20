import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsultaIndex } from '../hooks/useConsultaIndex';
import { formatHora } from '../utils/cita.utils';
import { ESTADOS_INICIABLES } from '../constants/estados.constants';
import StatusBadge from '../components/ui/StatusBadge';
import AvatarBadge from '../components/ui/AvatarBadge';
import SearchInput from '../components/ui/SearchInput';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { LoadingSpinner, EmptyState } from '../components/ui/LoadingSpinner';

/**
 * =============================================================================
 * COMPONENTE AUXILIAR: StatCard
 * =============================================================================
 * 
 * Propósito:
 *   Tarjeta de métrica simplificada para el encabezado del panel de consultas,
 *   presentando el recuento cuantitativo e ícono de estado correspondiente.
 * 
 * Parámetros y Retornos:
 *   @param {Object} props - Propiedades del componente.
 *   @param {number|string} props.value - Valor numérico del indicador.
 *   @param {string} props.label - Leyenda descriptiva del indicador.
 *   @param {string} props.color - Clase Tailwind para texto e ícono.
 *   @param {string} props.bgClass - Clase Tailwind para el contenedor del ícono.
 *   @param {string} props.icon - Clase de Bootstrap Icons.
 *   @returns {JSX.Element} Tarjeta visual con borde redondeado y sombra suave.
 */
const StatCard = ({ value, label, color, bgClass, icon }) => (
  <div className="flex items-center gap-3.5 p-4 bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-md transition-all">
    <div className={`w-11 h-11 rounded-2xl ${bgClass} flex items-center justify-center flex-shrink-0 text-base shadow-xs`}>
      <i className={`bi ${icon} ${color}`} />
    </div>
    <div className="min-w-0">
      <p className={`text-2xl font-extrabold tabular-nums leading-none tracking-tight ${color}`}>{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-1 truncate">{label}</p>
    </div>
  </div>
);

/**
 * =============================================================================
 * VISTA: ConsultaIndexPage
 * =============================================================================
 * 
 * Propósito:
 *   Tablero de control y cola de atención clínica diaria para odontólogos y asistentes.
 *   - Despliega las métricas consolidadas de la jornada: total de citas del día,
 *     pacientes en sala de espera (PENDIENTE), consultas finalizadas e inasistencias.
 *   - Provee una barra de búsqueda para auditar el historial de atenciones clínicas
 *     previas de cualquier paciente mediante un diálogo modal interactivo.
 *   - Presenta una cuadrícula de tarjetas de turnos clínicos que permite gestionar el
 *     check-in presencial del paciente y navegar directamente al expediente y
 *     odontograma activo (/consulta/:idCita).
 * 
 * Ubicación y Rol:
 *   src/views/ConsultaIndexPage.jsx
 *   Capa de Vistas / Páginas del Módulo Clínico (Ruta protegida: /consulta).
 * 
 * Trazabilidad (Referencias):
 *   - Invocado desde:
 *     * src/App.jsx (Asociado a la ruta "/consulta" dentro de Layout).
 *   - Consume:
 *     * react-router-dom (useNavigate para navegar a la consulta activa).
 *     * src/hooks/useConsultaIndex.js (Hook de citas del día, estadísticas y búsqueda de historial).
 *     * src/utils/cita.utils.js (formatHora para la conversión de horas ISO).
 *     * src/constants/estados.constants.js (ESTADOS_INICIABLES para discernir acción del botón).
 *     * src/components/ui/StatusBadge.jsx (Badge cromático de estado de cita).
 *     * src/components/ui/AvatarBadge.jsx (Avatar con inicial del paciente).
 *     * src/components/ui/SearchInput.jsx (Caja de búsqueda de historial de pacientes).
 *     * src/components/ui/Modal.jsx (Ventana modal para despliegue de historial clínico).
 *     * src/components/ui/Button.jsx (Botones de acción, inicio de consulta y cerrado).
 *     * src/components/ui/LoadingSpinner.jsx (LoadingSpinner y EmptyState informativos).
 * 
 * Parámetros y Retornos:
 *   @returns {JSX.Element} Vista de la cola de consultas clínicas diarias y modal de historial.
 * =============================================================================
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
    handleCheckIn,
    handleDeshacerCheckIn,
  } = useConsultaIndex();

  return (
    <div className="flex flex-col h-full p-5 md:p-8 bg-surface space-y-6 overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-bold mb-1">
            <i className="bi bi-heart-pulse-fill text-dental-500" />
            Flujo Clínico Activo
          </div>
          <h4 className="text-xl md:text-2xl font-extrabold text-slate-800 font-display">
            Gestión de Consultas Odontológicas
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>

        {/* Buscador de historial de paciente */}
        <div className="relative w-full sm:w-80 flex-shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Buscar historial clínico de paciente..."
          />
          {pacientesFiltrados.length > 0 && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-40 bg-white
                            border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-scale-in max-h-60 overflow-y-auto">
              {pacientesFiltrados.map(p => (
                <button
                  key={p.idPaciente}
                  type="button"
                  onClick={() => handleBuscarHistorial(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50
                             transition-colors text-left border-b border-slate-100 last:border-0"
                >
                  <AvatarBadge
                    initials={`${p.nombrePaciente?.[0] ?? ''}${p.apellidoPaciente?.[0] ?? ''}`}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {p.nombrePaciente} {p.apellidoPaciente}
                    </p>
                    <p className="text-[11px] text-slate-400">DUI: {p.numeroIdentidadPaciente}</p>
                  </div>
                  <i className="bi bi-clock-history text-slate-300 text-xs" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Métricas de hoy */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <StatCard
          value={stats.total}
          label="Citas de Hoy"
          color="text-primary-700"
          bgClass="bg-primary-50"
          icon="bi-calendar-event"
        />
        <StatCard
          value={stats.enEspera}
          label="En Sala de Espera"
          color="text-teal-700"
          bgClass="bg-teal-50"
          icon="bi-person-check-fill"
        />
        <StatCard
          value={stats.completadas}
          label="Atendidas"
          color="text-emerald-700"
          bgClass="bg-emerald-50"
          icon="bi-check-circle"
        />
        <StatCard
          value={stats.noAsistieron}
          label="Inasistencias"
          color="text-red-600"
          bgClass="bg-red-50"
          icon="bi-person-x"
        />
      </div>

      {/* Lista de citas activas */}
      <div className="flex-1 overflow-y-auto pr-1">
        {loading && <LoadingSpinner text="Cargando cola de atención clínica..." />}

        {!loading && citasDeHoy.length === 0 && (
          <EmptyState
            icon="bi-calendar-check"
            title="Sin consultas pendientes para hoy"
            description="No hay pacientes en espera de consulta odontológica en este momento."
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {citasDeHoy.map(cita => {
            const puedeIniciar = ESTADOS_INICIABLES.includes(cita.estadoCita);
            return (
              <div
                key={cita.idCitas}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-5
                           flex flex-col justify-between gap-4 hover:shadow-card-hover hover:border-primary-300
                           transition-all duration-200"
              >
                <div>
                  {/* Horario y Estado */}
                  <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700
                                    bg-primary-50 px-3 py-1 rounded-xl">
                      <i className="bi bi-clock text-[11px]" />
                      {formatHora(cita.horaInicioCita)} — {formatHora(cita.horaFinCita)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge estado={cita.estadoCita} />
                      {cita.estadoCita === 'PROGRAMADA' && (
                        <button
                          type="button"
                          onClick={() => handleCheckIn(cita)}
                          title="Registrar Check-in (Paciente en sala de espera)"
                          className="w-7 h-7 rounded-xl text-teal-600 hover:bg-teal-50 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                        >
                          <i className="bi bi-person-check-fill text-xs" />
                        </button>
                      )}
                      {cita.estadoCita === 'PENDIENTE' && (
                        <button
                          type="button"
                          onClick={() => handleDeshacerCheckIn(cita)}
                          title="Deshacer Check-in"
                          className="w-7 h-7 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                        >
                          <i className="bi bi-arrow-counterclockwise text-xs" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info del paciente */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <AvatarBadge
                      initials={cita.nombreCompletoPaciente?.[0] ?? '?'}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <h6 className="font-bold text-slate-800 text-sm truncate leading-snug">
                        {cita.nombreCompletoPaciente}
                      </h6>
                      <p className="text-xs text-slate-400 font-medium">DUI: {cita.numeroIdentidadPaciente}</p>
                    </div>
                  </div>

                  {/* Especialidad asignada */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                    <i className="bi bi-person-badge text-primary-600" />
                    <span className="truncate">{cita.especialidadOdontologo || 'Odontología General'}</span>
                  </div>

                  {cita.motivoCancelacion && (
                    <p className="text-xs text-red-500 flex items-center gap-1.5 mt-2 bg-red-50 p-2 rounded-xl">
                      <i className="bi bi-info-circle flex-shrink-0" />
                      {cita.motivoCancelacion}
                    </p>
                  )}
                </div>

                {/* Botón de acción */}
                <div className="pt-2 border-t border-slate-100">
                  {puedeIniciar ? (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => navigate(`/consulta/${cita.idCitas}`)}
                      icon={<i className="bi bi-play-circle-fill" />}
                    >
                      Iniciar Consulta
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => navigate(`/consulta/${cita.idCitas}`)}
                      icon={<i className="bi bi-eye-fill" />}
                    >
                      Ver Expediente / Consulta
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de historial clínico */}
      <Modal
        isOpen={showHistorial && !!pacienteSeleccionado}
        onClose={handleCerrarHistorial}
        title="Historial de Atenciones Clínicas"
        subtitle={pacienteSeleccionado
          ? `${pacienteSeleccionado.nombrePaciente} ${pacienteSeleccionado.apellidoPaciente} — DUI: ${pacienteSeleccionado.numeroIdentidadPaciente}`
          : ''}
        size="lg"
        footer={
          <Button variant="secondary" onClick={handleCerrarHistorial}>Cerrar</Button>
        }
      >
        {citasPaciente.length === 0 ? (
          <EmptyState
            icon="bi-journal-x"
            title="Sin consultas previas"
            description="Este paciente no tiene historial de citas en el sistema."
          />
        ) : (
          <div className="space-y-3">
            {citasPaciente.map(c => {
              const fecha = Array.isArray(c.fechaCita)
                ? `${c.fechaCita[2]}/${c.fechaCita[1]}/${c.fechaCita[0]}`
                : c.fechaCita;
              return (
                <div
                  key={c.idCitas}
                  className="flex items-center justify-between gap-3 p-4 bg-slate-50
                             border border-slate-200/80 rounded-2xl hover:bg-slate-100/70 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{fecha}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatHora(c.horaInicioCita)} — {c.especialidadOdontologo || 'General'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge estado={c.estadoCita} />
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => { handleCerrarHistorial(); navigate(`/consulta/${c.idCitas}`); }}
                    >
                      Ver Consulta
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
