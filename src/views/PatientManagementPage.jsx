import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatientManagement } from '../hooks/usePatientManagement';
import SearchInput from '../components/ui/SearchInput';
import Button from '../components/ui/Button';
import AvatarBadge from '../components/ui/AvatarBadge';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { LoadingSpinner, EmptyState } from '../components/ui/LoadingSpinner';

/**
 * Esquema de validación declarativa Zod para expedientes de pacientes
 */
const patientSchema = z.object({
  nombrePaciente: z.string().trim().min(1, 'El nombre del paciente es obligatorio.'),
  apellidoPaciente: z.string().trim().min(1, 'El apellido del paciente es obligatorio.'),
  numeroIdentidadPaciente: z.string().trim().min(1, 'El DUI o documento de identidad es obligatorio.'),
  fechaNacimientoPaciente: z.string().optional().nullable(),
  telefonoPaciente: z.string().optional().nullable(),
  emailPaciente: z
    .string()
    .optional()
    .nullable()
    .refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'El correo electrónico no tiene un formato válido.',
    }),
  contactoEmergencia: z.string().optional().nullable(),
  alergias: z.string().optional().nullable(),
});

/**
 * =============================================================================
 * VISTA: PatientManagementPage
 * =============================================================================
 * 
 * Propósito:
 *   Gestión integral de expedientes clínicos de pacientes siguiendo la arquitectura
 *   de interfaz Maestro-Detalle (Master-Detail).
 *   - Panel Maestro (Lateral): Proporciona un listado reactivo con búsqueda en tiempo
 *     real (por nombre completo o documento DUI), avatares con iniciales automáticas,
 *     conteo de expedientes totales y botón para conmutar a nuevo registro.
 *   - Panel Detalle (Principal): Despliega el formulario de administración estructurado
 *     en tres bloques semánticos: datos de identificación personal, canales de contacto
 *     y alertas médicas/alergias preexistentes (fundamentales para la seguridad clínica).
 *   Soporta creación, actualización y baja lógica de pacientes integrando confirmaciones nativas.
 * 
 * Ubicación y Rol:
 *   src/views/PatientManagementPage.jsx
 *   Capa de Vistas / Páginas de Gestión de Pacientes (Ruta protegida: /pacientes).
 * 
 * Trazabilidad (Referencias):
 *   - Invocado desde:
 *     * src/App.jsx (Asociado a la ruta "/pacientes" envuelto por ProtectedRoute y Layout).
 *   - Consume:
 *     * src/hooks/usePatientManagement.js (Hook orquestador de estado, CRUD y validaciones).
 *     * src/components/ui/SearchInput.jsx (Caja de búsqueda con limpieza rápida).
 *     * src/components/ui/Button.jsx (Botones de comando y estados de carga).
 *     * src/components/ui/AvatarBadge.jsx (Iniciales de avatar para cada paciente).
 *     * src/components/ui/Input.jsx (Entradas de texto, fecha, teléfono y DUI).
 *     * src/components/ui/Textarea.jsx (Área de texto para alergias y condiciones).
 *     * src/components/ui/LoadingSpinner.jsx (Spinners y vistas de lista vacía).
 * 
 * Parámetros y Retornos:
 *   @returns {JSX.Element} Interfaz maestro-detalle para administración de expedientes.
 * =============================================================================
 */
const PatientManagementPage = () => {
  // Desestructura el estado de la colección, formulario y manejadores del hook especializado
  const {
    patients, selectedId, formData, loading, isEditing,
    searchTerm, setSearchTerm,
    handleSelect, handleChange,
    handleSubmit, handleCancel, handleDelete,
  } = usePatientManagement();

  // Integración de React Hook Form para validación declarativa
  const {
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: formData,
  });

  // Sincroniza los valores del formulario al seleccionar otro paciente o limpiar el formulario
  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  /**
   * Manejador que actualiza simultáneamente el estado de React Hook Form y el hook orquestador
   */
  const onFieldChange = (name) => (e) => {
    setValue(name, e.target.value, { shouldValidate: true });
    handleChange(e);
  };

  /**
   * Envía los datos validados de manera segura a la capa de persistencia
   */
  const onSave = (validData) => {
    handleSubmit(validData);
  };

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
          <form
            onSubmit={handleFormSubmit(onSave)}
            noValidate
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 md:p-8 space-y-6"
          >
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
                  value={watch('nombrePaciente')}
                  error={errors.nombrePaciente?.message}
                  onChange={onFieldChange('nombrePaciente')}
                />
                <Input
                  label="Apellido"
                  required
                  name="apellidoPaciente"
                  placeholder="ej. Pérez Gómez"
                  value={watch('apellidoPaciente')}
                  error={errors.apellidoPaciente?.message}
                  onChange={onFieldChange('apellidoPaciente')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="DUI / Documento de Identidad"
                  required
                  name="numeroIdentidadPaciente"
                  placeholder="00000000-0"
                  value={watch('numeroIdentidadPaciente')}
                  error={errors.numeroIdentidadPaciente?.message}
                  onChange={onFieldChange('numeroIdentidadPaciente')}
                />
                <Input
                  type="date"
                  label="Fecha de Nacimiento"
                  name="fechaNacimientoPaciente"
                  value={watch('fechaNacimientoPaciente') ?? ''}
                  error={errors.fechaNacimientoPaciente?.message}
                  onChange={onFieldChange('fechaNacimientoPaciente')}
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
                  value={watch('telefonoPaciente') ?? ''}
                  error={errors.telefonoPaciente?.message}
                  onChange={onFieldChange('telefonoPaciente')}
                />
                <Input
                  type="email"
                  label="Correo Electrónico"
                  name="emailPaciente"
                  placeholder="paciente@correo.com"
                  icon={<i className="bi bi-envelope" />}
                  value={watch('emailPaciente') ?? ''}
                  error={errors.emailPaciente?.message}
                  onChange={onFieldChange('emailPaciente')}
                />
              </div>

              <Input
                label="Contacto de Emergencia"
                name="contactoEmergencia"
                placeholder="Nombre completo y teléfono de familiar o tutor"
                icon={<i className="bi bi-shield-exclamation" />}
                value={watch('contactoEmergencia') ?? ''}
                error={errors.contactoEmergencia?.message}
                onChange={onFieldChange('contactoEmergencia')}
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
                value={watch('alergias') ?? ''}
                error={errors.alergias?.message}
                onChange={onFieldChange('alergias')}
                helperText="Esta información se mostrará en los avisos prioritarios al iniciar la consulta odontológica."
              />
            </div>

            {/* Acciones de envío */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                {isEditing ? 'Guardar Cambios' : 'Registrar Expediente'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PatientManagementPage;
