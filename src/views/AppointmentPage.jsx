import React, { useState } from 'react';
import { useAgenda } from '../hooks/useAgenda';
import AppointmentCard from '../components/AppointmentCard';
import AppointmentForm from '../components/AppointmentForm';
import ReprogramModal from '../components/ReprogramModal';
import Button from '../components/ui/Button';
import { LoadingSpinner, EmptyState } from '../components/ui/LoadingSpinner';
import { formatFechaHeader, normalizarFecha, obtenerFechaLocalISO } from '../utils/cita.utils';
import 'bootstrap-icons/font/bootstrap-icons.css';
import SearchInput from '../components/ui/SearchInput';


// Configuración de cuántas semanas mostrar en la vista "Semana"

const WEEKS_BEFORE = 1; // semanas a mostrar antes de la seleccionada
const WEEKS_AFTER = 1;  // semanas a mostrar después de la seleccionada
// Esto da un total de (1 + 1 + 1) * 7 = 21 días en la vista semanal, centrados en la fecha seleccionada.
/** Devuelve el lunes de la semana que contiene la fecha dada */
const getLunesDeSemana = (date) => {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Genera los días de la vista "Semana", empezando en lunes y centrados
 * en la fecha seleccionada (incluye WEEKS_BEFORE semanas antes y
 * WEEKS_AFTER después).
 */
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

/** Construye las celdas del mes (lunes primero); null = relleno antes del día 1 */
const buildCalendar = (viewDate) => {
  const year = viewDate.getFullYear(); // El mes se obtiene dentro de la función para recalcular cada vez que cambie viewDate
  const month = viewDate.getMonth(); // El mes se obtiene dentro de la función para recalcular cada vez que cambie viewDate
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Días en el mes (calculado dinámicamente)
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7; // lunes = 0
  return [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
};

// Etiquetas de días para el calendario (lunes a domingo)
const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/**
 * Página de agenda de citas.
 * Lógica en useAgenda; vista en Tailwind.
 */
// TODO: agregar vista mensual (con menos detalle) y permitir arrastrar citas para reprogramar
const AppointmentPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date()); // fecha seleccionada para mostrar en el calendario y resumen
  const [showForm, setShowForm] = useState(false); // controla si se muestra el formulario de nueva/editar cita
  const [reprogramCita, setReprogramCita] = useState(null); // cita que se está reprogramando (para pasar al modal)
  const [activeTab, setActiveTab] = useState('dia'); // 'dia' | 'semana'
  const [viewDate, setViewDate] = useState(new Date()); // mes mostrado en el calendario
  const [searchTerm, setSearchTerm] = useState('');

  /// Hooks de datos y lógica
  const agenda = useAgenda(selectedDate);
  // Filtra pacientes cuyo nombre o DUI coincida con el término buscado
  const pacientesFiltrados = searchTerm.trim().length > 1
    ? agenda.pacientes.filter(p =>
        `${p.nombrePaciente} ${p.apellidoPaciente}`.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
       p.numeroIdentidadPaciente?.includes(searchTerm)
     )
    : [];
  // Generamos los días a mostrar en la vista semanal cada vez que cambia la fecha seleccionada
  const weekDays = getWeekDays(selectedDate);
// Generamos las celdas del calendario cada vez que cambia el mes mostrado
  const calendarCells = buildCalendar(viewDate);
  // Función para cambiar el mes mostrado en el calendario
  const cambiarMes = (delta) =>
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
// Funciones para manejar acciones de editar y crear citas
  const handleEditar = (cita) => {
    agenda.prepararEditarCita(cita);
    setShowForm(true);
  };
  // Función para manejar la creación de una nueva cita
  const handleNueva = () => {
    agenda.prepararNuevaCita();
    setShowForm(true);
  };
  // Función para manejar el éxito del formulario (tanto creación como edición)
  const handleFormSuccess = () => setShowForm(false);
  return (
    <div className="flex h-full p-5 gap-5 bg-surface overflow-hidden">

      {/* ── SIDEBAR IZQUIERDO: Calendario mini ─────────────────────────── */}
      <aside className="w-72 flex-shrink-0 flex flex-col gap-4">

        {/* Calendario del mes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4">

          {/* Navegación de mes */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Mes anterior"
            >
              <i className="bi bi-chevron-left" />
            </button>
            <h5 className="font-bold text-slate-800 text-sm capitalize">
              {viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h5>
            <button
              type="button"
              onClick={() => cambiarMes(1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Mes siguiente"
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>

          {/* Encabezado de días */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-semibold text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Cuadrícula de días */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;

              //Obtenemos la clave de fecha para este día y verificamos si es el día seleccionado o el día actual, y cuántas citas hay en ese día para mostrar el indicador.
              const key = obtenerFechaLocalISO(day);
              const isActive = normalizarFecha(selectedDate) === key;
              const isToday = key === obtenerFechaLocalISO(new Date());
              const count = agenda.citasPorFecha[key]?.length ?? 0;
              // Renderizamos el botón del día con estilos condicionales según si es el día seleccionado, el día actual, y mostrando un indicador si hay citas programadas para ese día.
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(new Date(day))}
                  className={`relative aspect-square flex items-center justify-center rounded-lg text-sm
                              transition-all duration-150
                              ${isActive
                      ? 'bg-primary-600 text-white font-bold shadow-sm shadow-primary-200'
                      : isToday
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'}`}
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

          {/* Acción */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleNueva}
            icon={<i className="bi bi-plus-lg" />}
            className="w-full mt-4"
          >
            Nueva cita
          </Button>
        </div>

        {/* Resumen del día seleccionado */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4">
          <h6 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Resumen del día
          </h6>
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { label: 'Total', val: agenda.citasDelDia.length, color: 'text-primary-600' },
              { label: 'Pendientes', val: agenda.citasDelDia.filter(c => ['PROGRAMADA', 'PENDIENTE'].includes(c.estadoCita)).length, color: 'text-amber-500' },
              { label: 'Completadas', val: agenda.citasDelDia.filter(c => ['COMPLETADA', 'FINALIZADA'].includes(c.estadoCita)).length, color: 'text-emerald-600' },
              { label: 'Canceladas', val: agenda.citasDelDia.filter(c => c.estadoCita === 'CANCELADA').length, color: 'text-red-500' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-2">
                <p className={`text-xl font-bold tabular-nums ${color}`}>{val}</p>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header del área */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0 gap-4">
          <div>
            <h4 className="font-bold text-slate-800 capitalize">
              {formatFechaHeader(obtenerFechaLocalISO(selectedDate))}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {agenda.citasDelDia.length} cita{agenda.citasDelDia.length !== 1 ? 's' : ''} programada{agenda.citasDelDia.length !== 1 ? 's' : ''}
            </p>
          </div>
            
        {/* Buscador de paciente */}
        <div className="relative w-72 flex-shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Buscar paciente en agenda..."
          />
          {pacientesFiltrados.length > 0 && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-40 bg-white
                            border border-slate-200 rounded-xl shadow-xl overflow-hidden">
              {pacientesFiltrados.map(p => {
                // Busca citas de este paciente y navega al día con más citas recientes
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
                      // Al hacer clic en un paciente, navegamos a la fecha de su próxima cita (si tiene), y limpiamos el término de búsqueda para cerrar el dropdown.
                      setSearchTerm('');
                    }}
                    // Mostramos el nombre del paciente, su número de identidad, y la fecha de su próxima cita (si tiene) para ayudar a identificarlo en la búsqueda.
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50
                              transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs
                                    font-bold flex items-center justify-center flex-shrink-0">
                      {p.nombrePaciente?.[0]}{p.apellidoPaciente?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {p.nombrePaciente} {p.apellidoPaciente}
                      </p>
                      
                      <p className="text-xs text-slate-400">
                        {proxima
                          ? `Próxima cita: ${normalizarFecha(proxima.fechaCita)}`
                          : 'Sin citas próximas'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

          {/* Tabs de vista */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {[['dia', 'bi-list-ul', 'Día'], ['semana', 'bi-grid', 'Semana']].map(([tab, icon, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            transition-all ${activeTab === tab
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className={`bi ${icon}`} />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          {agenda.loading && <LoadingSpinner text="Cargando citas..." />}

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
          {/* Si no estamos cargando, no se muestra el formulario, y estamos en la vista de día, mostramos las citas del día o un estado vacío si no hay y ademas un boton de crear citas*/}
          {!agenda.loading && !showForm && activeTab === 'dia' && (
            agenda.citasDelDia.length === 0
              ? <EmptyState
                icon="bi-calendar-x"
                title="Sin citas para este día"
                description="No hay citas programadas."
                action={<Button size="sm" onClick={handleNueva} icon={<i className="bi bi-plus" />}>Agendar cita</Button>}
              />
              : <div className="space-y-1">
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
          )}

          {!agenda.loading && !showForm && activeTab === 'semana' && (
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {weekDays.map(day => {
                const key = obtenerFechaLocalISO(day);
                const citas = agenda.citasPorFecha[key] ?? [];
                return (
                  <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-card p-4">
                    <div className="mb-3 pb-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-primary-700 uppercase tracking-wide">
                        {day.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    {citas.length === 0
                      ? <p className="text-xs text-slate-400 py-2 text-center">Sin citas</p>
                      : citas.map(app => (
                        <AppointmentCard
                          key={app.idCitas}
                          app={app}
                          compact
                          onEditar={handleEditar}
                          onCancelar={agenda.handleCancelar}
                        />
                      ))}
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