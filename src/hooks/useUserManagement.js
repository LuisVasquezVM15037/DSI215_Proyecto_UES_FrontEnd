/**
 * Propósito:
 * Hook de gestión y administración de usuarios, credenciales y asignación de roles.
 * Coordina la carga inicial concurrente de cuentas de usuario y catálogo de roles,
 * gestiona el formulario controlado para altas y modificaciones (incluyendo datos específicos
 * para odontólogos como especialidad y registro JVPO), y provee desactivación lógica
 * mediante confirmaciones de seguridad.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/hooks/useUserManagement.js'. Hook de lógica de administración dentro
 * de la capa de hooks de control de usuarios.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/views/UserManagementPage.jsx'
 * - Consume:
 *   - 'src/services/usuario.service.js' ('getUsuarios', 'getRoles', 'createUsuario', 'updateUsuario', 'deleteUsuario')
 *   - 'src/utils/alert.utils.js' ('alertSuccess', 'alertError', 'confirmDeactivate')
 *
 * Parámetros y Retornos:
 * @returns {Object} Estado del módulo de administración de usuarios y métodos de gestión:
 *   - users {Array<Object>}: Lista de usuarios registrados en el sistema.
 *   - roles {Array<Object>}: Catálogo de roles de autorización disponibles (ej. Admin, Odontólogo, Secretaria).
 *   - selectedId {number|null}: Identificador del usuario en edición o null en modo alta.
 *   - formData {Object}: Estado controlado de los campos del formulario de usuario.
 *   - loading {boolean}: Indicador de operación en red en curso.
 *   - isEditing {boolean}: Bandera binaria indicadora de si la vista se encuentra en modo edición.
 *   - handleSelect {Function}: Carga el usuario seleccionado en el formulario.
 *   - handleChange {Function}: Manejador genérico de campos de texto y selección de rol.
 *   - handleSubmit {Function}: Despacha la creación o actualización según 'isEditing'.
 *   - handleCancel {Function}: Restablece el formulario al estado inicial.
 *   - handleDelete {Function}: Desactiva al usuario tras confirmación explícita.
 */

import { useState, useEffect } from 'react';
import {
  getUsuarios, getRoles,
  createUsuario, updateUsuario, deleteUsuario,
} from '../services/usuario.service';
import { alertSuccess, alertError, confirmDeactivate } from '../utils/alert.utils';

// Estructura limpia para el registro o reseteo de cuentas de usuario
const FORM_INICIAL = {
  nombreUsuario:          '',
  apellidoUsuario:        '',
  usernameUsuario:        '',
  emailUsuario:           '',
  password:               '',
  idRol:                  1,
  esActivo:               true,
  especialidadOdontologo: '',
  jvpoId:                 '',
};

export const useUserManagement = () => {
  const [users,      setUsers]      = useState([]);
  const [roles,      setRoles]      = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [formData,   setFormData]   = useState(FORM_INICIAL);
  const [loading,    setLoading]    = useState(false);

  // Carga inicial concurrente de usuarios y catálogo de roles para optimizar latencia
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [usrs, rols] = await Promise.all([getUsuarios(), getRoles()]);
        setUsers(usrs  ?? []);
        setRoles(rols  ?? []);
      } catch (err) {
        alertError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  /**
   * Refresca la lista de usuarios tras operaciones de alta, actualización o baja lógica
   */
  const refetch = async () => {
    try {
      const usrs = await getUsuarios();
      setUsers(usrs ?? []);
    } catch (err) {
      alertError(err.message);
    }
  };

  /**
   * Manejador controlado que asegura la conversión numérica del identificador de rol
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idRol' ? parseInt(value, 10) : value,
    }));
  };

  /**
   * Carga los datos del usuario en el formulario y resuelve el identificador numérico de su rol
   */
  const handleSelect = (user) => {
    setSelectedId(user.idUsuario);
    setFormData({
      nombreUsuario:          user.nombreUsuario,
      apellidoUsuario:        user.apellidoUsuario,
      usernameUsuario:        user.usernameUsuario,
      emailUsuario:           user.emailUsuario,
      password:               '', // La contraseña no se precarga por motivos estrictos de seguridad
      idRol:                  roles.find(r => r.nombreRol === user.rol)?.idRol ?? roles[0]?.idRol ?? 1,
      esActivo:               user.esActivo,
      especialidadOdontologo: user.especialidadOdontologo ?? '',
      jvpoId:                 user.jvpoId ?? '',
    });
  };

  /**
   * Reinicia el formulario al modo de alta nuevo
   */
  const handleCancel = () => {
    setSelectedId(null);
    setFormData(FORM_INICIAL);
  };

  /**
   * Registra una nueva cuenta de usuario en la plataforma
   */
  const handleCreate = async () => {
    setLoading(true);
    try {
      const data = await createUsuario(formData);
      alertSuccess('Usuario creado', `"${data.usernameUsuario}" registrado correctamente.`);
      await refetch();
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza los datos del usuario. Si el campo password está vacío, se omite del payload
   * para conservar la contraseña preexistente sin sobreescribirla.
   */
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      await updateUsuario(selectedId, payload);
      alertSuccess('Usuario actualizado', 'Los cambios se guardaron correctamente.');
      await refetch();
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inhabilita lógicamente la cuenta del usuario tras confirmación modal
   */
  const handleDelete = async (id, nombre) => {
    const confirmed = await confirmDeactivate(nombre);
    if (!confirmed) return;
    setLoading(true);
    try {
      await deleteUsuario(id);
      alertSuccess('Usuario desactivado', 'El usuario fue inhabilitado correctamente.');
      await refetch();
      if (selectedId === id) handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = selectedId !== null;
  const handleSubmit = () => isEditing ? handleUpdate() : handleCreate();

  return {
    users, roles, selectedId, formData, loading, isEditing,
    handleSelect, handleChange,
    handleSubmit, handleCancel, handleDelete,
  };
};