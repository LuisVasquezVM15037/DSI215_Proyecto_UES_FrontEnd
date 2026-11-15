import { useState, useEffect } from 'react';
import {
  getUsuarios, getRoles,
  createUsuario, updateUsuario, deleteUsuario,
} from '../services/usuario.service';
import { alertSuccess, alertError, confirmDeactivate } from '../utils/alert.utils';
import { getUserIdentifier } from '../services/auth.service';

const FORM_INICIAL = {
  nombreUsuario:   '',
  apellidoUsuario: '',
  usernameUsuario: '',
  emailUsuario:    '',
  password:        '',
  idRol:           1,
  esActivo:        true,
  especialidadOdontologo: '',
  jvpoId:                 '',
  fotoPerfilUrl:          '',
};

/**
 * Hook del módulo de gestión de usuarios.
 * FIX BUG-01: un único useEffect que carga usuarios y roles en paralelo.
 */
export const useUserManagement = () => {
  const [users,      setUsers]      = useState([]);
  const [roles,      setRoles]      = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [formData,   setFormData]   = useState(FORM_INICIAL);
  const [loading,    setLoading]    = useState(false);

  // FIX BUG-01: un solo useEffect, carga en paralelo
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

  const refetch = async () => {
    try {
      const usrs = await getUsuarios();
      setUsers(usrs ?? []);
    } catch (err) {
      alertError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idRol' ? parseInt(value) : value,
    }));
  };

  const handleSelect = (user) => {
    setSelectedId(user.idUsuario);
    setFormData({
      nombreUsuario:   user.nombreUsuario,
      apellidoUsuario: user.apellidoUsuario,
      usernameUsuario: user.usernameUsuario,
      emailUsuario:    user.emailUsuario,
      password:        '',
      idRol:   roles.find(r => r.nombreRol === user.rol)?.idRol ?? roles[0]?.idRol ?? 1,
      esActivo: user.esActivo,
      especialidadOdontologo: user.especialidadOdontologo ?? '',
      jvpoId:                 user.jvpoId ?? '',
      fotoPerfilUrl:          user.fotoPerfilUrl ?? '',
    });
  };

  const handleCancel = () => {
    setSelectedId(null);
    setFormData(FORM_INICIAL);
  };

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

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      await updateUsuario(selectedId, payload);
      alertSuccess('Usuario actualizado', 'Los cambios se guardaron correctamente.');

      // Si el usuario actualizado es el usuario logueado en la sesión actual, actualizar su avatar en vivo en el Layout
      const currentIdentifier = (getUserIdentifier() || '').toLowerCase().trim();
      const currentNombre = (getUserName() || '').toLowerCase().trim();
      const updatedUsername = (payload.usernameUsuario || '').toLowerCase().trim();
      const updatedEmail = (payload.emailUsuario || '').toLowerCase().trim();
      const updatedNombre = `${payload.nombreUsuario || ''} ${payload.apellidoUsuario || ''}`.toLowerCase().trim();

      const esMismoUsuario = (currentIdentifier && (updatedUsername === currentIdentifier || updatedEmail === currentIdentifier)) ||
                             (currentNombre && (updatedNombre === currentNombre || updatedUsername === currentNombre));

      if (esMismoUsuario) {
        if (payload.fotoPerfilUrl) {
          localStorage.setItem('userAvatar', payload.fotoPerfilUrl);
        } else {
          localStorage.removeItem('userAvatar');
        }
        window.dispatchEvent(new Event('user-avatar-changed'));
      }

      await refetch();
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
