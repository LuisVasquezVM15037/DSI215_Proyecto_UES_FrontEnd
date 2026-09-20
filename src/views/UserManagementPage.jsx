import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserManagement } from '../hooks/useUserManagement';
import Button from '../components/ui/Button';
import AvatarBadge from '../components/ui/AvatarBadge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { LoadingSpinner, EmptyState } from '../components/ui/LoadingSpinner';

/**
 * Generador de esquema de validación Zod con reglas dinámicas según modo y rol
 */
const getUserSchema = (isEditing, esOdontologo) =>
  z.object({
    nombreUsuario: z.string().trim().min(1, 'El nombre es obligatorio.'),
    apellidoUsuario: z.string().trim().min(1, 'El apellido es obligatorio.'),
    usernameUsuario: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres.'),
    emailUsuario: z.string().trim().email('El correo electrónico no tiene un formato válido.'),
    password: isEditing
      ? z.string().optional()
      : z.string().min(6, 'La contraseña debe contener al menos 6 caracteres.'),
    idRol: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== null, {
      message: 'Debe seleccionar un rol asignado.',
    }),
    especialidadOdontologo: esOdontologo
      ? z.string().trim().min(1, 'La especialidad es obligatoria para odontólogos.')
      : z.string().optional().nullable(),
    jvpoId: esOdontologo
      ? z.string().trim().min(1, 'El número de JVPO es obligatorio para odontólogos.')
      : z.string().optional().nullable(),
    esActivo: z.boolean().optional(),
  });

/**
 * Mapa de estilos visuales para los distintivos de rol en la lista maestra.
 * Asigna una paleta cromática diferenciada según el nivel de privilegios.
 */
const ROLE_BADGES = {
  ADMIN:         'bg-purple-50 text-purple-700 ring-1 ring-purple-200/60',
  ODONTOLOGO:    'bg-sky-50 text-sky-700 ring-1 ring-sky-200/60',
  RECEPCIONISTA: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200/60',
  GERENTE:       'bg-slate-100 text-slate-700 ring-1 ring-slate-200/60',
};

/**
 * =============================================================================
 * VISTA: UserManagementPage
 * =============================================================================
 * 
 * Propósito:
 *   Administración centralizada de usuarios, colaboradores y control de acceso basado
 *   en roles (RBAC) para el personal de la clínica dental.
 *   Utiliza el patrón de arquitectura de interfaz Maestro-Detalle:
 *   - Maestro (Izquierda): Listado del personal con iniciales, rol institucional,
 *     nombre de usuario y estado (activo/inactivo).
 *   - Detalle (Derecha): Formulario reactivo para alta o modificación de credenciales,
 *     gestión de contraseñas (opcional en actualización), asignación de rol en el sistema,
 *     captura de licencia profesional (JVPO y especialidad médica para odontólogos)
 *     y activación/desactivación de cuentas.
 * 
 * Ubicación y Rol:
 *   src/views/UserManagementPage.jsx
 *   Capa de Vistas / Páginas de Administración de Personal (Ruta protegida: /usuarios).
 * 
 * Trazabilidad (Referencias):
 *   - Invocado desde:
 *     * src/App.jsx (Asociado a la ruta "/usuarios" restringido a ADMIN y GERENTE).
 *   - Consume:
 *     * src/hooks/useUserManagement.js (Hook de gestión de usuarios, roles y CRUD).
 *     * src/components/ui/Button.jsx (Botones de acción, guardado y desactivación).
 *     * src/components/ui/AvatarBadge.jsx (Iniciales de avatar con indicador de estado).
 *     * src/components/ui/Input.jsx (Campos de texto para nombres, credenciales y contraseñas).
 *     * src/components/ui/Select.jsx (Selector de rol institucional).
 *     * src/components/ui/LoadingSpinner.jsx (Spinners y estado vacío de personal).
 * 
 * Parámetros y Retornos:
 *   @returns {JSX.Element} Panel de gestión administrativa de usuarios y roles.
 * =============================================================================
 */
const UserManagementPage = () => {
  // Desestructura estado, colecciones de catálogo y manejadores desde el hook
  const {
    users, roles, selectedId, formData, loading, isEditing,
    handleSelect, handleChange,
    handleSubmit, handleCancel, handleDelete,
  } = useUserManagement();

  // Determina si el rol actualmente seleccionado corresponde al perfil clínico odontológico
  const rolSeleccionado = roles.find(r => String(r.idRol) === String(formData.idRol));
  const esOdontologo = rolSeleccionado?.nombreRol === 'ODONTOLOGO';

  // Memoización del esquema dinámico según contexto de edición y rol
  const currentSchema = useMemo(
    () => getUserSchema(isEditing, esOdontologo),
    [isEditing, esOdontologo],
  );

  // Integración de React Hook Form para validación declarativa
  const {
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: formData,
  });

  // Sincronización de campos de React Hook Form al seleccionar usuario o limpiar
  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  /**
   * Actualiza el valor en React Hook Form y en el estado orquestador
   */
  const onFieldChange = (name) => (e) => {
    setValue(name, e.target.value, { shouldValidate: true });
    handleChange(e);
  };

  /**
   * Envía los datos validados a la capa de persistencia
   */
  const onSave = (validData) => {
    handleSubmit(validData);
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-surface overflow-hidden">

      {/* ── LISTA MAESTRA DE USUARIOS (Izquierda) ───────────────────────────── */}
      <aside className="w-full md:w-84 lg:w-96 flex-shrink-0 flex flex-col border-r border-slate-200/80 bg-white">
        
        {/* Cabecera */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <h5 className="font-extrabold text-slate-800 text-base font-display">Personal</h5>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
              {users.length}
            </span>
          </div>
          <Button
            size="xs"
            onClick={handleCancel}
            icon={<i className="bi bi-person-plus-fill" />}
          >
            Nuevo Usuario
          </Button>
        </div>

        {/* Listado de usuarios */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loading && users.length === 0 && <LoadingSpinner text="Cargando personal..." />}

          {!loading && users.length === 0 && (
            <EmptyState
              icon="bi-people"
              title="No hay usuarios registrados"
            />
          )}

          {users.map(u => {
            const initials = `${u.nombreUsuario?.[0] ?? ''}${u.apellidoUsuario?.[0] ?? ''}`;
            const isSelected = selectedId === u.idUsuario;
            const roleKey = String(u.rol || '').toUpperCase();
            const roleBadgeClass = ROLE_BADGES[roleKey] || 'bg-slate-50 text-slate-600';

            return (
              <button
                key={u.idUsuario}
                type="button"
                onClick={() => handleSelect(u)}
                className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left
                            transition-all duration-150 outline-none cursor-pointer
                            ${isSelected
                              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/20'
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-100'}`}
              >
                <AvatarBadge
                  initials={initials}
                  size="sm"
                  inactive={!u.esActivo}
                  className={isSelected ? 'ring-white/40' : ''}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold truncate leading-snug
                                   ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {u.nombreUsuario} {u.apellidoUsuario}
                    </p>
                    {!u.esActivo && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold flex-shrink-0
                                        ${isSelected ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}>
                        Inactivo
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full
                                     ${isSelected ? 'bg-white/20 text-white' : roleBadgeClass}`}>
                      {u.rol || 'Sin rol'}
                    </span>
                    <span className={`text-[11px] truncate ${isSelected ? 'text-primary-100' : 'text-slate-400'}`}>
                      @{u.usernameUsuario}
                    </span>
                  </div>
                </div>

                <i className={`bi bi-chevron-right text-xs ${isSelected ? 'text-white' : 'text-slate-300'}`} />
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── FORMULARIO DETALLE (Derecha) ───────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-surface">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Encabezado */}
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-bold mb-1">
                <i className="bi bi-person-badge" />
                {isEditing ? 'Detalles del Colaborador' : 'Nuevo Acceso'}
              </div>
              <h4 className="text-xl font-extrabold text-slate-800 font-display">
                {isEditing ? `${formData.nombreUsuario} ${formData.apellidoUsuario}` : 'Registrar Colaborador'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing ? 'Gestiona los roles, accesos y permisos en el sistema.' : 'Crea credenciales para un nuevo miembro del equipo clínico.'}
              </p>
            </div>

            {isEditing && selectedId && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(
                  selectedId,
                  `${formData.nombreUsuario} ${formData.apellidoUsuario}`
                )}
                icon={<i className="bi bi-person-slash" />}
              >
                Desactivar Usuario
              </Button>
            )}
          </div>

          {/* Tarjeta de Formulario */}
          <form
            onSubmit={handleFormSubmit(onSave)}
            noValidate
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 md:p-8 space-y-5"
          >
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                required
                name="nombreUsuario"
                placeholder="ej. María"
                value={watch('nombreUsuario')}
                error={errors.nombreUsuario?.message}
                onChange={onFieldChange('nombreUsuario')}
              />
              <Input
                label="Apellido"
                required
                name="apellidoUsuario"
                placeholder="ej. González"
                value={watch('apellidoUsuario')}
                error={errors.apellidoUsuario?.message}
                onChange={onFieldChange('apellidoUsuario')}
              />
            </div>

            {/* Username y Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre de Usuario (Login)"
                required
                name="usernameUsuario"
                placeholder="mgonzalez"
                icon={<i className="bi bi-at" />}
                value={watch('usernameUsuario')}
                error={errors.usernameUsuario?.message}
                onChange={onFieldChange('usernameUsuario')}
              />
              <Input
                type="email"
                label="Correo Electrónico"
                required
                name="emailUsuario"
                placeholder="usuario@dentalcare.com"
                icon={<i className="bi bi-envelope" />}
                value={watch('emailUsuario')}
                error={errors.emailUsuario?.message}
                onChange={onFieldChange('emailUsuario')}
              />
            </div>

            {/* Contraseña */}
            <Input
              type="password"
              label={`Contraseña ${isEditing ? '(opcional)' : ''}`}
              required={!isEditing}
              name="password"
              placeholder={isEditing ? '••••••••' : 'Contraseña segura (mínimo 6 caracteres)'}
              helperText={isEditing ? 'Deja este campo en blanco si no deseas cambiar la contraseña actual.' : undefined}
              value={watch('password') ?? ''}
              error={errors.password?.message}
              onChange={onFieldChange('password')}
              autoComplete="new-password"
            />

            {/* Rol en el sistema */}
            <Select
              label="Rol Asignado"
              required
              name="idRol"
              value={watch('idRol')}
              error={errors.idRol?.message}
              onChange={onFieldChange('idRol')}
            >
              {roles.map(r => (
                <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>
              ))}
            </Select>

            {/* Campos exclusivos para Odontólogo */}
            {esOdontologo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                <Input
                  label="Especialidad Odontológica"
                  required
                  name="especialidadOdontologo"
                  placeholder="ej. Ortodoncia, Endodoncia..."
                  value={watch('especialidadOdontologo') ?? ''}
                  error={errors.especialidadOdontologo?.message}
                  onChange={onFieldChange('especialidadOdontologo')}
                />
                <Input
                  label="Número de JVPO"
                  required
                  name="jvpoId"
                  placeholder="ej. JVPO-1234"
                  value={watch('jvpoId') ?? ''}
                  error={errors.jvpoId?.message}
                  onChange={onFieldChange('jvpoId')}
                />
              </div>
            )}

            {/* Estado Activo / Inactivo */}
            {isEditing && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <input
                  type="checkbox"
                  id="esActivo"
                  name="esActivo"
                  checked={watch('esActivo') ?? true}
                  onChange={e => {
                    setValue('esActivo', e.target.checked);
                    handleChange({ target: { name: 'esActivo', value: e.target.checked } });
                  }}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500/20 cursor-pointer"
                />
                <label htmlFor="esActivo" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Usuario Activo (Habilitado para iniciar sesión en DentalCare ERP)
                </label>
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                {isEditing ? 'Guardar Cambios' : 'Crear Colaborador'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserManagementPage;
