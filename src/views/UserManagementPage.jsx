import React from 'react';
import { useUserManagement } from '../hooks/useUserManagement';
import Button from '../components/ui/Button';
import AvatarBadge from '../components/ui/AvatarBadge';
import { LoadingSpinner, EmptyState } from '../components/ui/LoadingSpinner';
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
 * Lógica en useUserManagement — FIX BUG-01 (doble fetch eliminado).
 */
const UserManagementPage = () => {
  const {
    users, roles, selectedId, formData, loading, isEditing,
    handleSelect, handleChange,
    handleSubmit, handleCancel, handleDelete,
  } = useUserManagement();

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
            const initials  = `${u.nombreUsuario?.[0] ?? ''}${u.apellidoUsuario?.[0] ?? ''}`;
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
                    {u.rol ?? 'Sin rol'} · @{u.usernameUsuario}
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
                  onChange={handleChange}
                />
              </div>
              <div>
                <FieldLabel required>Apellido</FieldLabel>
                <Input
                  name="apellidoUsuario"
                  placeholder="González"
                  value={formData.apellidoUsuario}
                  onChange={handleChange}
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
                  onChange={handleChange}
                />
              </div>
              <div>
                <FieldLabel required>Correo electrónico</FieldLabel>
                <Input
                  type="email"
                  name="emailUsuario"
                  placeholder="usuario@clinica.com"
                  value={formData.emailUsuario}
                  onChange={handleChange}
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
                placeholder={isEditing ? '••••••••' : 'Contraseña segura'}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            {/* Rol */}
            <div>
              <FieldLabel required>Rol en el sistema</FieldLabel>
              <Select name="idRol" value={formData.idRol} onChange={handleChange}>
                {roles.map(r => (
                  <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>
                ))}
              </Select>
            </div>

            {/* Estado (solo edición) */}
            {isEditing && (
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
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button fullWidth onClick={handleSubmit} loading={loading}>
                {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagementPage;
