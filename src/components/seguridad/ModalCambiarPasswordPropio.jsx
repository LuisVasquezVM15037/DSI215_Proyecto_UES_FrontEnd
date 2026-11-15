import React, { useState } from 'react';
import { cambiarPasswordObligatorio } from '../../services/seguridad.service';
import { getUserIdentifier } from '../../services/auth.service';
import { alertSuccess, alertError } from '../../utils/alert.utils';

export default function ModalCambiarPasswordPropio({ isOpen, onClose }) {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmarPasswordNueva, setConfirmarPasswordNueva] = useState('');
  const [loading, setLoading] = useState(false);
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordActual.trim()) {
      alertError('Por favor ingrese su contraseña actual.');
      return;
    }
    if (passwordNueva.length < 6) {
      alertError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (passwordNueva !== confirmarPasswordNueva) {
      alertError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    if (passwordActual === passwordNueva) {
      alertError('La nueva contraseña debe ser diferente a la contraseña actual.');
      return;
    }

    setLoading(true);
    try {
      const username = getUserIdentifier();
      await cambiarPasswordObligatorio({
        username,
        passwordActual,
        passwordNueva,
        confirmarPasswordNueva,
      });

      alertSuccess('Su contraseña ha sido actualizada con éxito.', 'Contraseña Cambiada');
      setPasswordActual('');
      setPasswordNueva('');
      setConfirmarPasswordNueva('');
      onClose();
    } catch (err) {
      alertError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-md w-full overflow-hidden">
        {/* Encabezado */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shadow-xs">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Cambiar Contraseña</h3>
              <p className="text-[11px] text-slate-400">Actualiza tus credenciales de acceso</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors flex items-center justify-center cursor-pointer"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Contraseña Actual */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contraseña Actual *
            </label>
            <div className="relative">
              <input
                type={showActual ? 'text' : 'password'}
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                placeholder="Ingresa tu clave actual"
                required
                className="w-full px-3 py-2 pr-10 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={() => setShowActual(!showActual)}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                <i className={`bi bi-eye${showActual ? '-slash' : ''}`}></i>
              </button>
            </div>
          </div>

          {/* Contraseña Nueva */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nueva Contraseña *
            </label>
            <div className="relative">
              <input
                type={showNueva ? 'text' : 'password'}
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full px-3 py-2 pr-10 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={() => setShowNueva(!showNueva)}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                <i className={`bi bi-eye${showNueva ? '-slash' : ''}`}></i>
              </button>
            </div>
          </div>

          {/* Confirmar Nueva */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirmar Nueva Contraseña *
            </label>
            <input
              type={showNueva ? 'text' : 'password'}
              value={confirmarPasswordNueva}
              onChange={(e) => setConfirmarPasswordNueva(e.target.value)}
              placeholder="Vuelve a escribir la nueva contraseña"
              required
              minLength={6}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>
                  <span>Actualizar Contraseña</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
