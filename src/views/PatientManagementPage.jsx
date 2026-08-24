import React from 'react';
import { usePatientManagement } from '../hooks/usePatientManagement';
import SearchInput from '../components/ui/SearchInput';
import Button from '../components/ui/Button';
import AvatarBadge from '../components/ui/AvatarBadge';
import { LoadingSpinner, EmptyState } from '../components/ui/LoadingSpinner';
import { normalizarFechaNacimiento } from '../utils/cita.utils';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-medium text-slate-600 mb-1">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const Input = ({ ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                text-slate-800 placeholder-slate-400 outline-none
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all ${props.className ?? ''}`}
  />
);

/**
 * Página de gestión de pacientes — layout maestro/detalle.
 * Lógica en usePatientManagement.
 */
const PatientManagementPage = () => {
  const {
    patients, selectedId, formData, loading, isEditing,
    searchTerm, setSearchTerm,
    handleSelect, handleChange,
    handleSubmit, handleCancel, handleDelete,
  } = usePatientManagement();

  return (
    <div className="flex h-full bg-surface overflow-hidden">

      {/* ── LISTA (izquierda) ──────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-bold text-slate-800 text-sm">Expedientes</h5>
            <Button
              size="xs"
              onClick={handleCancel}
              icon={<i className="bi bi-plus-lg" />}
            >
              Nuevo
            </Button>
          </div>
          <SearchInput
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Buscar paciente..."
          />
        </div>

        {/* Lista de pacientes */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading && patients.length === 0 && (
            <LoadingSpinner text="Cargando expedientes..." />
          )}
          {!loading && patients.length === 0 && (
            <EmptyState
              icon="bi-people"
              title="No se encontraron pacientes"
              description={searchTerm ? `Sin resultados para "${searchTerm}".` : 'Registra el primer paciente.'}
            />
          )}
          {patients.map(p => {
            const initials = `${p.nombrePaciente?.[0] ?? ''}${p.apellidoPaciente?.[0] ?? ''}`;
            const isSelected = selectedId === p.idPaciente;
            return (
              <button
                key={p.idPaciente}
                type="button"
                onClick={() => handleSelect(p)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                            transition-all
                            ${isSelected
                              ? 'bg-primary-600 text-white shadow-sm shadow-primary-200/50'
                              : 'hover:bg-slate-50 text-slate-700'}`}
              >
                <AvatarBadge initials={initials} size="sm"
                  className={isSelected ? 'bg-white/20' : ''} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate leading-tight
                                 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {p.nombrePaciente} {p.apellidoPaciente}
                  </p>
                  <p className={`text-xs truncate ${isSelected ? 'text-primary-200' : 'text-slate-400'}`}>
                    {p.numeroIdentidadPaciente}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── FORMULARIO / DETALLE (derecha) ─────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">

          {/* Header del formulario */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-slate-800">
                {isEditing ? 'Editar Expediente' : 'Nuevo Paciente'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing ? 'Modifica los datos del paciente seleccionado.' : 'Completa los datos para registrar al paciente.'}
              </p>
            </div>
            {isEditing && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                icon={<i className="bi bi-trash" />}
              >
                Eliminar
              </Button>
            )}
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5">

            {/* Nombre y apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Nombre</FieldLabel>
                <Input
                  name="nombrePaciente"
                  placeholder="Juan"
                  value={formData.nombrePaciente}
                  onChange={handleChange}
                />
              </div>
              <div>
                <FieldLabel required>Apellido</FieldLabel>
                <Input
                  name="apellidoPaciente"
                  placeholder="Pérez"
                  value={formData.apellidoPaciente}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* DUI y teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>DUI / Número de Identidad</FieldLabel>
                <Input
                  name="numeroIdentidadPaciente"
                  placeholder="00000000-0"
                  value={formData.numeroIdentidadPaciente}
                  onChange={handleChange}
                />
              </div>
              <div>
                <FieldLabel>Teléfono</FieldLabel>
                <Input
                  name="telefonoPaciente"
                  placeholder="7777-7777"
                  value={formData.telefonoPaciente}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Fecha de nacimiento y email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Fecha de Nacimiento</FieldLabel>
                <Input
                  type="date"
                  name="fechaNacimientoPaciente"
                  value={formData.fechaNacimientoPaciente}
                  onChange={handleChange}
                />
              </div>
              <div>
                <FieldLabel>Correo Electrónico</FieldLabel>
                <Input
                  type="email"
                  name="emailPaciente"
                  placeholder="correo@ejemplo.com"
                  value={formData.emailPaciente}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contacto de emergencia */}
            <div>
              <FieldLabel>Contacto de Emergencia</FieldLabel>
              <Input
                name="contactoEmergencia"
                placeholder="Nombre y teléfono del contacto"
                value={formData.contactoEmergencia}
                onChange={handleChange}
              />
            </div>

            {/* Alergias */}
            <div>
              <FieldLabel>Alergias / Notas médicas</FieldLabel>
              <textarea
                name="alergias"
                rows={3}
                placeholder="Alergias conocidas, condiciones médicas relevantes..."
                value={formData.alergias}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                           text-slate-800 placeholder-slate-400 outline-none resize-none
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button fullWidth onClick={handleSubmit} loading={loading}>
                {isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientManagementPage;
