import React, { useState } from 'react';
import { restablecerPassword } from '../../services/seguridad.service';
import Button from '../ui/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Modal para que el Administrador TI restablezca la contraseña de un usuario (DENTALCARE-93).
 */
const ModalRestablecerPassword = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [copiadoClave, setCopiadoClave] = useState(false);
  const [copiadoEnlace, setCopiadoEnlace] = useState(false);

  if (!isOpen || !user) return null;

  const handleEjecutarReset = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await restablecerPassword(user.idUsuario);
      setResultado(res.data);
    } catch (err) {
      setError(err.message || 'No fue posible restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarClave = () => {
    if (!resultado?.claveProvisional) return;
    navigator.clipboard.writeText(resultado.claveProvisional);
    setCopiadoClave(true);
    setTimeout(() => setCopiadoClave(false), 2000);
  };

  const handleCopiarEnlace = () => {
    if (!resultado?.enlaceRestablecimiento) return;
    navigator.clipboard.writeText(resultado.enlaceRestablecimiento);
    setCopiadoEnlace(true);
    setTimeout(() => setCopiadoEnlace(false), 2000);
  };

  const handleCerrar = () => {
    setResultado(null);
    setError('');
    setCopiadoClave(false);
    setCopiadoEnlace(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">

        {/* Encabezado */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-primary-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
              <i className="bi bi-key-fill text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">Restablecer Contraseña</h3>
              <p className="text-xs text-amber-200">Asistencia administrativa de credenciales</p>
            </div>
          </div>
          <button
            onClick={handleCerrar}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <i className="bi bi-x-lg text-lg" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {!resultado ? (
            /* Vista de confirmación previa */
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                <i className="bi bi-info-circle-fill text-amber-600 text-base flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Esta acción generará una <strong>clave temporal aleatoria</strong> y un token criptográfico
                  con <strong>24 horas de validez</strong>. La cuenta quedará configurada para exigir el cambio
                  de contraseña en su próximo inicio de sesión.
                </div>
              </div>

              {/* Ficha del usuario */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Nombre Completo:</span>
                  <span className="font-semibold text-slate-800">{user.nombreUsuario} {user.apellidoUsuario}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Usuario:</span>
                  <span className="font-mono font-medium text-slate-700">{user.usernameUsuario}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Correo Electrónico:</span>
                  <span className="font-medium text-slate-800">{user.emailUsuario}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Rol Clínico:</span>
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-800 font-semibold rounded-md">
                    {user.rol || 'PERSONAL'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-3 justify-end">
                <Button variant="secondary" onClick={handleCerrar} disabled={loading}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleEjecutarReset}
                  loading={loading}
                  icon={<i className="bi bi-arrow-repeat" />}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Restablecer Contraseña Ahora
                </Button>
              </div>
            </div>
          ) : (
            /* Vista de resultado con credenciales generadas */
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <i className="bi bi-check-circle-fill text-emerald-600 text-base" />
                <span className="font-semibold">¡Contraseña restablecida con éxito!</span>
              </div>

              {/* Clave Provisional */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Contraseña Provisional Generada
                </label>
                <div className="flex items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg">
                  <span className="font-mono text-base font-bold text-primary-700 tracking-wider">
                    {resultado.claveProvisional}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopiarClave}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <i className={`bi ${copiadoClave ? 'bi-check2 text-emerald-600' : 'bi-clipboard'}`} />
                    {copiadoClave ? '¡Copiada!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Enlace de Restablecimiento */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Enlace Directo de Recuperación (Vence en 24h)
                </label>
                <div className="flex items-center justify-between gap-2 bg-white p-2.5 border border-slate-200 rounded-lg">
                  <span className="font-mono text-xs text-slate-600 truncate flex-1">
                    {resultado.enlaceRestablecimiento}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopiarEnlace}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex-shrink-0"
                  >
                    <i className={`bi ${copiadoEnlace ? 'bi-check2 text-emerald-600' : 'bi-link-45deg'}`} />
                    {copiadoEnlace ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Vista previa de notificación por correo */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-blue-800 font-semibold mb-1">
                  <i className="bi bi-envelope-check-fill text-blue-600" />
                  Notificación enviada al correo del usuario:
                </div>
                <p className="text-slate-600 font-mono text-[11px] leading-relaxed bg-white/70 p-2 rounded-lg border border-blue-100">
                  {resultado.mensajeNotificacion}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleCerrar} icon={<i className="bi bi-check-lg" />}>
                  Finalizar y Cerrar
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ModalRestablecerPassword;
