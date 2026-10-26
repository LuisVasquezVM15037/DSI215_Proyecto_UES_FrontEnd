import React, { useState, useMemo } from 'react';
import { useUserManagement } from '../hooks/useUserManagement';
import Button from '../components/ui/Button';
import AvatarBadge from '../components/ui/AvatarBadge';
import { LoadingSpinner, EmptyState } from '../components/ui/LoadingSpinner';
import ModalRestablecerPassword from '../components/seguridad/ModalRestablecerPassword';
import { formatRoleName } from '../constants/roles.constants';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-medium text-slate-600 mb-1">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const Input = ({ error, ...props }) => (
  <div>
    <input
      {...props}
      className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white
                  text-slate-800 placeholder-slate-400 outline-none
                  focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  transition-all ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200'} ${props.className ?? ''}`}
    />
    {error && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <i className="bi bi-exclamation-circle" /> {error}
      </p>
    )}
  </div>
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
               text-slate-800 outline-none focus:ring-2 focus:ring-primary-500
               focus:border-transparent transition-all"
  >
    {children}
  </select>
);

/**
 * Página de gestión de usuarios del sistema.
 * Lógica en useUserManagement
 */
const UserManagementPage = () => {
  const {
    users, roles, selectedId, formData, loading, isEditing,
    handleSelect, handleChange,
    handleSubmit, handleCancel, handleDelete,
  } = useUserManagement();

  const [formErrors, setFormErrors] = React.useState({});
  const [showResetModal, setShowResetModal] = React.useState(false);

  const rolSeleccionado = roles.find(r => String(r.idRol) === String(formData.idRol));
  const esOdontologo = rolSeleccionado?.nombreRol === 'ODONTOLOGO';
  const selectedUser = users.find(u => u.idUsuario === selectedId);

  return (
    <div className="flex h-full bg-surface overflow-hidden">

      {/* ── LISTA (izquierda) ──────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">
        <div className="px-4 pt-5 pb-3 border-b border-slate-100 flex-shrink-0 flex items-center justify-between">
          <h5 className="font-bold text-slate-800 text-sm">Personal de clínica</h5>
          <Button
            size="xs"
            onClick={handleCancel}
            icon={<i className="bi bi-plus-lg" />}
          >
            Nuevo
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading && users.length === 0 && <LoadingSpinner text="Cargando usuarios..." />}
          {!loading && users.length === 0 && (
            <EmptyState
              icon="bi-people"
              title="No hay usuarios registrados"
            />
          )}
          {users.map(u => {
            const initials = `${u.nombreUsuario?.[0] ?? ''}${u.apellidoUsuario?.[0] ?? ''}`;
            const isSelected = selectedId === u.idUsuario;
            return (
              <button
                key={u.idUsuario}
                type="button"
                onClick={() => handleSelect(u)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                            transition-all
                            ${isSelected
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'hover:bg-slate-50 text-slate-700'}`}
              >
                <AvatarBadge initials={initials} size="sm" inactive={!u.esActivo} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold truncate leading-tight
                                   ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {u.nombreUsuario} {u.apellidoUsuario}
                    </p>
                    {!u.esActivo && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0
                                        ${isSelected ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${isSelected ? 'text-primary-200' : 'text-slate-400'}`}>
                    {formatRoleName(u.rol)} · @{u.usernameUsuario}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── FORMULARIO (derecha) ────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-slate-800">
                {isEditing ? 'Editar Usuario' : 'Registrar Usuario'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing
                  ? 'Modifica los datos del usuario seleccionado.'
                  : 'Crea un nuevo acceso al sistema.'}
              </p>
            </div>
            {isEditing && selectedId && (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowResetModal(true)}
                  icon={<i className="bi bi-key-fill text-amber-500" />}
                >
                  Restablecer Clave
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(
                    selectedId,
                    `${formData.nombreUsuario} ${formData.apellidoUsuario}`
                  )}
                  icon={<i className="bi bi-person-slash" />}
                >
                  Desactivar
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-5">

            {/* Nombre y apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Nombre</FieldLabel>
                <Input
                  name="nombreUsuario"
                  placeholder="María"
                  value={formData.nombreUsuario}
                  onChange={(e) => {
                    handleChange(e);
                    if (formErrors.nombreUsuario) setFormErrors(p => ({ ...p, nombreUsuario: '' }));
                  }}
                  error={formErrors.nombreUsuario}
                />
              </div>
              <div>
                <FieldLabel required>Apellido</FieldLabel>
                <Input
                  name="apellidoUsuario"
                  placeholder="González"
                  value={formData.apellidoUsuario}
                  onChange={(e) => {
                    handleChange(e);
                    if (formErrors.apellidoUsuario) setFormErrors(p => ({ ...p, apellidoUsuario: '' }));
                  }}
                  error={formErrors.apellidoUsuario}
                />
              </div>
            </div>

            {/* Username y email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Nombre de usuario</FieldLabel>
                <Input
                  name="usernameUsuario"
                  placeholder="mgonzalez"
                  value={formData.usernameUsuario}
                  onChange={(e) => {
                    handleChange(e);
                    if (formErrors.usernameUsuario) setFormErrors(p => ({ ...p, usernameUsuario: '' }));
                  }}
                  error={formErrors.usernameUsuario}
                />
              </div>
              <div>
                <FieldLabel required>Correo electrónico</FieldLabel>
                <Input
                  type="email"
                  name="emailUsuario"
                  placeholder="usuario@clinica.com"
                  value={formData.emailUsuario}
                  onChange={(e) => {
                    handleChange(e);
                    if (formErrors.emailUsuario) setFormErrors(p => ({ ...p, emailUsuario: '' }));
                  }}
                  error={formErrors.emailUsuario}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <FieldLabel required={!isEditing}>
                Contraseña {isEditing && <span className="text-slate-400 font-normal">(dejar vacío para no cambiar)</span>}
              </FieldLabel>
              <Input
                type="password"
                name="password"
                placeholder={isEditing ? '••••••••' : 'Mínimo 6 caracteres'}
                value={formData.password}
                onChange={(e) => {
                  handleChange(e);
                  if (formErrors.password) setFormErrors(p => ({ ...p, password: '' }));
                }}
                autoComplete="new-password"
                error={formErrors.password}
              />
            </div>

            {/* Rol */}
            <div>
              <FieldLabel required>Rol en el sistema</FieldLabel>
              <Select
                name="idRol"
                value={formData.idRol}
                onChange={(e) => {
                  handleChange(e);
                  if (formErrors.idRol) setFormErrors(p => ({ ...p, idRol: '' }));
                }}
              >
                <option value="">Selecciona un rol...</option>
                {roles.map(r => (
                  <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>
                ))}
              </Select>
              {formErrors.idRol && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <i className="bi bi-exclamation-circle" /> {formErrors.idRol}
                </p>
              )}
            </div>

            {/* Campos exclusivos de ODONTOLOGO */}
            {esOdontologo && (
              <div className="p-4 bg-dental-50/60 border border-dental-200 rounded-xl space-y-4">
                <p className="text-xs font-semibold text-dental-800 flex items-center gap-1.5">
                  <i className="bi bi-hospital" /> Datos profesionales de odontólogo
                </p>

                <div>
                  <FieldLabel required>Especialidad odontológica</FieldLabel>
                  <Input
                    name="especialidadOdontologo"
                    placeholder="ej. Ortodoncia, Endodoncia, General..."
                    value={formData.especialidadOdontologo}
                    onChange={(e) => {
                      handleChange(e);
                      if (formErrors.especialidadOdontologo) {
                        setFormErrors(p => ({ ...p, especialidadOdontologo: '' }));
                      }
                    }}
                    error={formErrors.especialidadOdontologo}
                  />
                </div>

                <div>
                  <FieldLabel required>Número de JVPO</FieldLabel>
                  <Input
                    name="jvpoId"
                    placeholder="ej. JVPO-12345"
                    value={formData.jvpoId}
                    onChange={(e) => {
                      handleChange(e);
                      if (formErrors.jvpoId) setFormErrors(p => ({ ...p, jvpoId: '' }));
                    }}
                    error={formErrors.jvpoId}
                  />
                </div>
              </div>
            )}

            {/* Estado y restablecimiento asistido (solo edición) */}
            {isEditing && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="esActivo"
                    name="esActivo"
                    checked={formData.esActivo}
                    onChange={e => handleChange({ target: { name: 'esActivo', value: e.target.checked } })}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <label htmlFor="esActivo" className="text-sm text-slate-700 font-medium cursor-pointer">
                    Usuario activo (puede iniciar sesión)
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <div>
                    <h6 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <i className="bi bi-shield-lock-fill text-amber-600" /> Asistencia de Contraseña (DENTALCARE-93)
                    </h6>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Genera una clave provisional y activa cambio obligatorio para el usuario.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    variant="secondary"
                    onClick={() => setShowResetModal(true)}
                    icon={<i className="bi bi-key-fill text-amber-600" />}
                    className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 flex-shrink-0"
                  >
                    Restablecer
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  const errors = {};
                  if (!formData.nombreUsuario?.trim()) errors.nombreUsuario = 'El nombre es obligatorio.';
                  if (!formData.apellidoUsuario?.trim()) errors.apellidoUsuario = 'El apellido es obligatorio.';
                  if (!formData.usernameUsuario?.trim() || formData.usernameUsuario.trim().length < 3) {
                    errors.usernameUsuario = 'El nombre de usuario debe tener al menos 3 caracteres.';
                  }
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!formData.emailUsuario?.trim() || !emailRegex.test(formData.emailUsuario.trim())) {
                    errors.emailUsuario = 'Ingresa un correo electrónico con formato válido.';
                  }
                  if (!isEditing && (!formData.password || formData.password.length < 6)) {
                    errors.password = 'La contraseña debe contener al menos 6 caracteres.';
                  }
                  if (!formData.idRol) {
                    errors.idRol = 'Debe seleccionar un rol para el usuario.';
                  }
                  if (esOdontologo) {
                    if (!formData.especialidadOdontologo?.trim()) {
                      errors.especialidadOdontologo = 'La especialidad es obligatoria para odontólogos.';
                    }
                    if (!formData.jvpoId?.trim()) {
                      errors.jvpoId = 'El número de JVPO es obligatorio para odontólogos.';
                    }
                  }

                  setFormErrors(errors);
                  if (Object.keys(errors).length === 0) {
                    handleSubmit();
                  }
                }}
                loading={loading}
              >
                {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Restablecimiento de Contraseña (DENTALCARE-93) */}
      <ModalRestablecerPassword
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagementPage;
