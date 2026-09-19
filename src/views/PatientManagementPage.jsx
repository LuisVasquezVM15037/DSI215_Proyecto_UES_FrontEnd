import React from 'react';
import { usePatientManagement } from '../hooks/usePatientManagement';
import SearchInput from '../components/ui/SearchInput';
import Button from '../components/ui/Button';
import AvatarBadge from '../components/ui/AvatarBadge';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { LoadingSpinner, EmptyState } from '../components/ui/LoadingSpinner';

/**
 * Página de gestión de expedientes clínicos de pacientes (Patrón Maestro-Detalle).
 */
const PatientManagementPage = () => {
  const {
    patients, selectedId, formData, loading, isEditing,
    searchTerm, setSearchTerm,
    handleSelect, handleChange,
    handleSubmit, handleCancel, handleDelete,
  } = usePatientManagement();

  return (
    <div className="flex flex-col md:flex-row h-full bg-surface overflow-hidden">

      {/* ── LISTA MAESTRA (Izquierda) ───────────────────────────────────────── */}
      <aside className="w-full md:w-84 lg:w-96 flex-shrink-0 flex flex-col border-r border-slate-200/80 bg-white">
        
        {/* Cabecera del listado */}
        <div className="p-4 border-b border-slate-100 flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h5 className="font-extrabold text-slate-800 text-base font-display">Expedientes</h5>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                {patients.length}
              </span>
            </div>
            <Button
              size="xs"
              onClick={handleCancel}
              icon={<i className="bi bi-person-plus-fill" />}
            >
              Nuevo Paciente
            </Button>
          </div>

          <SearchInput
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Buscar por nombre o DUI..."
          />
        </div>

        {/* Listado scrolleable de pacientes */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loading && patients.length === 0 && (
            <LoadingSpinner text="Consultando expedientes..." />
          )}

          {!loading && patients.length === 0 && (
            <EmptyState
              icon="bi-people"
              title="No hay pacientes registrados"
              description={searchTerm ? `Sin resultados para "${searchTerm}".` : 'Registra el primer expediente clínico.'}
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
                className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left
                            transition-all duration-150 outline-none cursor-pointer
                            ${isSelected
                              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/20'
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-100'}`}
              >
                <AvatarBadge
                  initials={initials}
                  size="sm"
                  className={isSelected ? 'ring-white/40' : ''}
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate leading-snug
                                 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {p.nombrePaciente} {p.apellidoPaciente}
                  </p>
                  <p className={`text-xs truncate font-medium mt-0.5
                                 ${isSelected ? 'text-primary-100' : 'text-slate-400'}`}>
                    DUI: {p.numeroIdentidadPaciente || 'Sin documento'}
                  </p>
                </div>
                <i className={`bi bi-chevron-right text-xs ${isSelected ? 'text-white' : 'text-slate-300'}`} />
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── FORMULARIO / EXPEDIENTE DETALLE (Derecha) ───────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-surface">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Encabezado del detalle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-bold mb-1">
                <i className="bi bi-file-earmark-medical" />
                {isEditing ? 'Expediente Activo' : 'Nuevo Registro'}
              </div>
              <h4 className="text-xl font-extrabold text-slate-800 font-display">
                {isEditing ? `${formData.nombrePaciente} ${formData.apellidoPaciente}` : 'Registro de Paciente'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing ? 'Consulta o actualiza los datos clínicos del expediente.' : 'Ingresa la información básica y médica del paciente.'}
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

          {/* Tarjeta de Formulario estructurada */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 md:p-8 space-y-6">

            {/* Sección 1: Identificación básica */}
            <div className="space-y-4">
              <h6 className="text-xs font-bold text-primary-700 uppercase tracking-wider flex items-center gap-2">
                <i className="bi bi-person-vcard text-sm" />
                1. Datos de Identificación
              </h6>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  required
                  name="nombrePaciente"
                  placeholder="ej. Juan Carlos"
                  value={formData.nombrePaciente}
                  onChange={handleChange}
                />
                <Input
                  label="Apellido"
                  required
                  name="apellidoPaciente"
                  placeholder="ej. Pérez Gómez"
                  value={formData.apellidoPaciente}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="DUI / Documento de Identidad"
                  required
                  name="numeroIdentidadPaciente"
                  placeholder="00000000-0"
                  value={formData.numeroIdentidadPaciente}
                  onChange={handleChange}
                />
                <Input
                  type="date"
                  label="Fecha de Nacimiento"
                  name="fechaNacimientoPaciente"
                  value={formData.fechaNacimientoPaciente}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h6 className="text-xs font-bold text-primary-700 uppercase tracking-wider flex items-center gap-2">
                <i className="bi bi-telephone text-sm" />
                2. Contacto y Comunicación
              </h6>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Teléfono Principal"
                  name="telefonoPaciente"
                  placeholder="7000-0000"
                  icon={<i className="bi bi-phone" />}
                  value={formData.telefonoPaciente}
                  onChange={handleChange}
                />
                <Input
                  type="email"
                  label="Correo Electrónico"
                  name="emailPaciente"
                  placeholder="paciente@correo.com"
                  icon={<i className="bi bi-envelope" />}
                  value={formData.emailPaciente}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Contacto de Emergencia"
                name="contactoEmergencia"
                placeholder="Nombre completo y teléfono de familiar o tutor"
                icon={<i className="bi bi-shield-exclamation" />}
                value={formData.contactoEmergencia}
                onChange={handleChange}
              />
            </div>

            {/* Sección 3: Alergias y notas médicas */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h6 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
                <i className="bi bi-exclamation-octagon text-sm" />
                3. Alertas Médicas y Alergias
              </h6>

              <Textarea
                name="alergias"
                label="Alergias Conocidas o Condiciones Preexistentes"
                rows={3}
                placeholder="Indicar si el paciente padece de hipertensión, diabetes, alergia a la penicilina, anestésicos, etc..."
                value={formData.alergias}
                onChange={handleChange}
                helperText="Esta información se mostrará en los avisos prioritarios al iniciar la consulta odontológica."
              />
            </div>

            {/* Acciones de envío */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} loading={loading}>
                {isEditing ? 'Guardar Cambios' : 'Registrar Expediente'}
              </Button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientManagementPage;
