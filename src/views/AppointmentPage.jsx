import React, { useState } from 'react';
import { useAgenda } from '../hooks/useAgenda';
import AppointmentCard from '../components/AppointmentCard';
import AppointmentForm from '../components/AppointmentForm';
import ReprogramModal from '../components/ReprogramModal';
import Button from '../components/ui/Button';
import { LoadingSpinner, EmptyState } from '../components/ui/LoadingSpinner';
import { formatFechaHeader, normalizarFecha, obtenerFechaLocalISO } from '../utils/cita.utils';
import SearchInput from '../components/ui/SearchInput';
import AvatarBadge from '../components/ui/AvatarBadge';

const WEEKS_BEFORE = 1;
const WEEKS_AFTER = 1;

const getLunesDeSemana = (date) => {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekDays = (anchorDate) => {
  const inicio = getLunesDeSemana(anchorDate);
  inicio.setDate(inicio.getDate() - WEEKS_BEFORE * 7);
  const total = (WEEKS_BEFORE + 1 + WEEKS_AFTER) * 7;
  return Array.from({ length: total }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(d.getDate() + i);
    return d;
  });
};

const buildCalendar = (viewDate) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  return [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
};

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/**
 * Página de agenda de citas moderna con vistas Día y Semana, mini-calendario y búsqueda rápida.
 */
const AppointmentPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [reprogramCita, setReprogramCita] = useState(null);
  const [activeTab, setActiveTab] = useState('dia');
  const [viewDate, setViewDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const agenda = useAgenda(selectedDate);

  const pacientesFiltrados = searchTerm.trim().length > 1
    ? agenda.pacientes.filter(p =>
        `${p.nombrePaciente} ${p.apellidoPaciente}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numeroIdentidadPaciente?.includes(searchTerm)
      )
    : [];

  const weekDays = getWeekDays(selectedDate);
  const calendarCells = buildCalendar(viewDate);

  const cambiarMes = (delta) =>
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  const handleEditar = (cita) => {
    agenda.prepararEditarCita(cita);
    setShowForm(true);
  };

  const handleNueva = () => {
    agenda.prepararNuevaCita();
    setShowForm(true);
  };

  const handleFormSuccess = () => setShowForm(false);

  return (
    <div className="flex flex-col lg:flex-row h-full p-5 md:p-6 gap-6 bg-surface overflow-hidden">

      {/* ── SIDEBAR IZQUIERDO: Calendario mini y Resumen ──────────────────── */}
      <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">

        {/* Calendario del mes */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-5">

          {/* Navegación de mes */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              aria-label="Mes anterior"
            >
              <i className="bi bi-chevron-left text-xs" />
            </button>
            <h5 className="font-bold text-slate-800 text-sm capitalize font-display">
              {viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h5>
            <button
              type="button"
              onClick={() => cambiarMes(1)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              aria-label="Mes siguiente"
            >
              <i className="bi bi-chevron-right text-xs" />
            </button>
          </div>

          {/* Encabezado de días */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAY_LABELS.map((d, i) => (
              <div key={i} className="text-center text-[11px] font-bold text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Cuadrícula de días */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;

              const key = obtenerFechaLocalISO(day);
              const isActive = normalizarFecha(selectedDate) === key;
              const isToday = key === obtenerFechaLocalISO(new Date());
              const count = agenda.citasPorFecha[key]?.length ?? 0;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(new Date(day))}
                  className={`relative aspect-square flex items-center justify-center rounded-xl text-xs font-semibold
                              transition-all duration-150 outline-none
                              ${isActive
                                ? 'bg-primary-600 text-white font-bold shadow-md shadow-primary-500/25 scale-105'
                                : isToday
                                  ? 'bg-primary-50 text-primary-700 font-bold ring-1 ring-primary-300/60'
                                  : 'text-slate-700 hover:bg-slate-100 active:scale-95'}`}
                >
                  {day.getDate()}
                  {count > 0 && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full
                                      ${isActive ? 'bg-white' : 'bg-primary-500'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Botón de acción principal */}
          <div className="mt-5">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleNueva}
              icon={<i className="bi bi-plus-lg" />}
            >
              Nueva Cita
            </Button>
          </div>
        </div>

        {/* Resumen del día seleccionado */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-5">
          <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5">
            Métricas del Día
          </h6>
          <div className="grid grid-cols-2 gap-2.5 text-center">
            {[
              { label: 'Total', val: agenda.citasDelDia.length, color: 'text-primary-700', bg: 'bg-primary-50' },
              { label: 'Pendientes', val: agenda.citasDelDia.filter(c => ['PROGRAMADA', 'PENDIENTE'].includes(c.estadoCita)).length, color: 'text-amber-700', bg: 'bg-amber-50' },
              { label: 'Completadas', val: agenda.citasDelDia.filter(c => ['COMPLETADA', 'FINALIZADA'].includes(c.estadoCita)).length, color: 'text-emerald-700', bg: 'bg-emerald-50' },
              { label: 'Canceladas', val: agenda.citasDelDia.filter(c => c.estadoCita === 'CANCELADA').length, color: 'text-red-600', bg: 'bg-red-50' },
            ].map(({ label, val, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-3 border border-black/5`}>
                <p className={`text-xl font-extrabold tabular-nums leading-none ${color}`}>{val}</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL: Vistas y Detalle ───────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header superior del área */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 flex-shrink-0">
          <div>
            <h4 className="font-extrabold text-slate-800 text-lg sm:text-xl capitalize font-display">
              {formatFechaHeader(obtenerFechaLocalISO(selectedDate))}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {agenda.citasDelDia.length} {agenda.citasDelDia.length === 1 ? 'cita programada' : 'citas programadas'} para esta fecha
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Buscador de paciente con desplegable reactivo */}
            <div className="relative w-64 md:w-72 flex-shrink-0">
              <SearchInput
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
                placeholder="Buscar paciente..."
              />
              {pacientesFiltrados.length > 0 && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-40 bg-white
                                border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-scale-in max-h-64 overflow-y-auto">
                  {pacientesFiltrados.map(p => {
                    const citasPaciente = agenda.appointments.filter(
                      c => c.idPaciente === p.idPaciente
                    );
                    const proxima = citasPaciente
                      .sort((a, b) => new Date(a.fechaCita) - new Date(b.fechaCita))
                      .find(c => normalizarFecha(c.fechaCita) >= obtenerFechaLocalISO(new Date()));

                    return (
                      <button
                        key={p.idPaciente}
                        type="button"
                        onClick={() => {
                          if (proxima) {
                            const fecha = normalizarFecha(proxima.fechaCita);
                            const [y, m, d] = fecha.split('-').map(Number);
                            setSelectedDate(new Date(y, m - 1, d));
                            setViewDate(new Date(y, m - 1, d));
                          }
                          setSearchTerm('');
                        }}
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
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {proxima
                              ? `Próxima cita: ${normalizarFecha(proxima.fechaCita)}`
                              : 'Sin citas futuras'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selector segmentado Día / Semana */}
            <div className="flex items-center gap-1 bg-slate-100/90 rounded-2xl p-1 border border-slate-200/60">
              {[
                ['dia', 'bi-list-ul', 'Día'],
                ['semana', 'bi-grid-fill', 'Semana']
              ].map(([tab, icon, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold
                              transition-all duration-150 outline-none cursor-pointer
                              ${activeTab === tab
                                ? 'bg-white text-slate-800 shadow-xs scale-100'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
                >
                  <i className={`bi ${icon} text-[11px]`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenedor scrolleable de citas */}
        <div className="flex-1 overflow-y-auto pr-1">
          {agenda.loading && <LoadingSpinner text="Consultando programación..." />}

          {!agenda.loading && showForm && (
            <AppointmentForm
              isEditing={agenda.isEditing}
              date={selectedDate}
              formData={agenda.formData}
              pacientes={agenda.pacientes}
              odontologos={agenda.odontologos}
              loading={agenda.loading}
              onChange={agenda.handleChange}
              onSubmit={() => agenda.handleSubmit(handleFormSuccess)}
              onCancelar={() => setShowForm(false)}
            />
          )}

          {!agenda.loading && !showForm && activeTab === 'dia' && (
            agenda.citasDelDia.length === 0 ? (
              <EmptyState
                icon="bi-calendar-x"
                title="Sin citas programadas para este día"
                description="No se registran pacientes agendados en esta fecha. Puedes programar una cita ahora mismo."
                action={
                  <Button
                    size="sm"
                    onClick={handleNueva}
                    icon={<i className="bi bi-plus-lg" />}
                  >
                    Agendar Cita
                  </Button>
                }
              />
            ) : (
              <div className="space-y-1.5">
                {agenda.citasDelDia.map(app => (
                  <AppointmentCard
                    key={app.idCitas}
                    app={app}
                    onEditar={handleEditar}
                    onCancelar={agenda.handleCancelar}
                    onReprogram={(cita) => { agenda.setSelectedCita(cita); setReprogramCita(cita); }}
                  />
                ))}
              </div>
            )
          )}

          {!agenda.loading && !showForm && activeTab === 'semana' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {weekDays.map(day => {
                const key = obtenerFechaLocalISO(day);
                const citas = agenda.citasPorFecha[key] ?? [];
                const isCurrentSelected = normalizarFecha(selectedDate) === key;

                return (
                  <div
                    key={key}
                    className={`bg-white rounded-3xl border p-4 shadow-card flex flex-col transition-all
                                ${isCurrentSelected ? 'border-primary-400 ring-2 ring-primary-100' : 'border-slate-200/80'}`}
                  >
                    <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 uppercase tracking-tight font-display">
                          {day.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {citas.length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                      {citas.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center italic">Sin citas</p>
                      ) : (
                        citas.map(app => (
                          <AppointmentCard
                            key={app.idCitas}
                            app={app}
                            compact
                            onEditar={handleEditar}
                            onCancelar={agenda.handleCancelar}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de reprogramación */}
      <ReprogramModal
        cita={reprogramCita}
        loading={agenda.loading}
        onConfirmar={(data) => agenda.handleReprogramar(reprogramCita?.idCitas, data, () => setReprogramCita(null))}
        onCerrar={() => setReprogramCita(null)}
      />
    </div>
  );
};

export default AppointmentPage;