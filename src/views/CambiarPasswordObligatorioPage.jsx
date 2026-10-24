import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cambiarPasswordObligatorio } from '../services/seguridad.service';
import { getUserIdentifier, getUserName, clearSession, setDebeCambiarPassword } from '../services/auth.service';
import Button from '../components/ui/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Vista de forzado de cambio de contraseña (DENTALCARE-93).
 * Se presenta al usuario inmediatamente tras el inicio de sesión si tiene la bandera debe_cambiar_password = true.
 */
const CambiarPasswordObligatorioPage = () => {
  const navigate = useNavigate();
  const userName = getUserName();
  const userIdentifier = getUserIdentifier();

  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validaciones reactivas (DENTALCARE-97)
  const [touched, setTouched] = useState({});

  const longitudValida = passwordNueva.length >= 6;
  const coinciden = passwordNueva.length > 0 && passwordNueva === confirmarPassword;
  const esDiferente = passwordNueva.length > 0 && passwordNueva !== passwordActual;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordActual.trim()) {
      setError('Por favor, ingresa tu contraseña provisional o actual.');
      return;
    }
    if (!longitudValida) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!coinciden) {
      setError('Las contraseñas no coinciden. Asegúrate de escribir la misma clave en ambos campos.');
      return;
    }
    if (passwordNueva === passwordActual) {
      setError('La nueva contraseña debe ser diferente a la contraseña provisional asignada.');
      return;
    }

    setLoading(true);
    try {
      await cambiarPasswordObligatorio({
        username: userIdentifier || undefined,
        passwordActual: passwordActual.trim(),
        passwordNueva: passwordNueva.trim(),
        confirmarPasswordNueva: confirmarPassword.trim(),
      });

      setSuccess(true);
      setDebeCambiarPassword(false);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1800);
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

        {/* Encabezado con identidad institucional */}
        <div className="bg-gradient-to-r from-primary-800 to-dental-700 p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-3">
            <i className="bi bi-shield-lock-fill text-2xl text-amber-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Actualización Obligatoria de Contraseña</h2>
          <p className="text-xs text-primary-200 mt-1">
            DentalCare ERP — Protocolo de Seguridad Institucional
          </p>
        </div>

        <div className="p-6">
          {/* Alerta de política */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-3">
            <i className="bi bi-exclamation-triangle-fill text-amber-500 text-base flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">¡Acceso Asistido Detectado!</p>
              <p className="text-amber-700 leading-relaxed">
                Hola <strong className="text-slate-800">{userName}</strong>. Tu contraseña fue restablecida
                o estás ingresando con una clave provisional. Por seguridad del centro clínico, debes definir
                una nueva contraseña personal antes de continuar.
              </p>
            </div>
          </div>

          {/* Notificación de Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <i className="bi bi-x-circle-fill text-red-500 text-sm flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Notificación de Éxito */}
          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <i className="bi bi-check-circle-fill text-4xl text-emerald-500 mb-2 inline-block" />
              <h3 className="text-base font-bold text-emerald-800">¡Contraseña Actualizada!</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Tus credenciales han sido renovadas con éxito. Redirigiendo a tu panel de trabajo...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Contraseña Actual / Provisional */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña Provisional o Actual <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center gap-2 px-3 py-2.5 bg-white border rounded-xl transition-all ${
                  touched.actual && !passwordActual
                    ? 'border-red-400 bg-red-50/30 ring-1 ring-red-400'
                    : 'border-slate-200 focus-within:ring-2 focus-within:ring-primary-500'
                }`}>
                  <i className="bi bi-key text-slate-400 flex-shrink-0" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Ingresa la clave temporal asignada"
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, actual: true }))}
                    disabled={loading}
                    className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nueva Contraseña Personal <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center gap-2 px-3 py-2.5 bg-white border rounded-xl transition-all ${
                  touched.nueva && !longitudValida
                    ? 'border-red-400 bg-red-50/30 ring-1 ring-red-400'
                    : 'border-slate-200 focus-within:ring-2 focus-within:ring-primary-500'
                }`}>
                  <i className="bi bi-lock text-slate-400 flex-shrink-0" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres alfanuméricos"
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, nueva: true }))}
                    disabled={loading}
                    className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
                  />
                </div>
                {touched.nueva && !longitudValida && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <i className="bi bi-exclamation-circle" /> La contraseña debe contener 6 o más caracteres.
                  </p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center gap-2 px-3 py-2.5 bg-white border rounded-xl transition-all ${
                  touched.confirmar && (!coinciden || !confirmarPassword)
                    ? 'border-red-400 bg-red-50/30 ring-1 ring-red-400'
                    : 'border-slate-200 focus-within:ring-2 focus-within:ring-primary-500'
                }`}>
                  <i className="bi bi-shield-check text-slate-400 flex-shrink-0" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Vuelve a escribir la nueva contraseña"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, confirmar: true }))}
                    disabled={loading}
                    className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
                  />
                </div>
                {touched.confirmar && confirmarPassword && !coinciden && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <i className="bi bi-exclamation-circle" /> Las contraseñas no coinciden.
                  </p>
                )}
              </div>

              {/* Indicadores de Seguridad */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="text-[11px] font-semibold text-slate-600 mb-1">Requisitos de seguridad:</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <i className={`bi ${longitudValida ? 'bi-check-circle-fill text-emerald-600' : 'bi-circle text-slate-300'}`} />
                  <span className={longitudValida ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    Al menos 6 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <i className={`bi ${coinciden ? 'bi-check-circle-fill text-emerald-600' : 'bi-circle text-slate-300'}`} />
                  <span className={coinciden ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    Las contraseñas coinciden
                  </span>
                </div>
              </div>

              {/* Botón de Guardado */}
              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  disabled={!longitudValida || !coinciden || !passwordActual}
                  icon={<i className="bi bi-lock-fill" />}
                >
                  Guardar y Acceder al Sistema
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-slate-400 hover:text-red-600 transition-colors inline-flex items-center gap-1"
                >
                  <i className="bi bi-box-arrow-left" /> Salir y cerrar sesión
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default CambiarPasswordObligatorioPage;
