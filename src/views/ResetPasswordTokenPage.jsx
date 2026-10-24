import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { validarTokenReset, cambiarPasswordObligatorio } from '../services/seguridad.service';
import Button from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Vista de restablecimiento de contraseña mediante token criptográfico (DENTALCARE-93).
 * Maneja la URL /reset-password?token=xyz
 */
const ResetPasswordTokenPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [verificando, setVerificando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userData, setUserData] = useState(null);

  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerificando(false);
      setTokenValido(false);
      setTokenError('No se proporcionó ningún token de restablecimiento en el enlace.');
      return;
    }

    const checkToken = async () => {
      try {
        const res = await validarTokenReset(token);
        if (res?.data?.valido) {
          setTokenValido(true);
          setUserData(res.data);
        } else {
          setTokenValido(false);
          setTokenError('El token no es válido o ya fue utilizado.');
        }
      } catch (err) {
        setTokenValido(false);
        setTokenError(err.message || 'El enlace ha expirado o no es válido.');
      } finally {
        setVerificando(false);
      }
    };

    checkToken();
  }, [token]);

  const longitudValida = passwordNueva.length >= 6;
  const coinciden = passwordNueva.length > 0 && passwordNueva === confirmarPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!longitudValida) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!coinciden) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await cambiarPasswordObligatorio({
        token,
        passwordNueva: passwordNueva.trim(),
        confirmarPasswordNueva: confirmarPassword.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (err) {
      setFormError(err.message || 'Error al guardar la nueva contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

        {/* Encabezado */}
        <div className="bg-gradient-to-r from-primary-800 to-dental-700 p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-3">
            <i className="bi bi-shield-check text-2xl text-dental-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Recuperación de Acceso</h2>
          <p className="text-xs text-primary-200 mt-1">DentalCare Clínica Odontológica</p>
        </div>

        <div className="p-6">
          {verificando && (
            <div className="py-8 text-center">
              <LoadingSpinner text="Validando token criptográfico de seguridad..." />
            </div>
          )}

          {!verificando && !tokenValido && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-shield-x text-3xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Enlace no Válido o Expirado</h3>
              <p className="text-xs text-slate-500 mb-6 px-4 leading-relaxed">
                {tokenError || 'El enlace para restablecer su contraseña ha expirado (validez de 24 horas) o ya fue utilizado.'}
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <i className="bi bi-arrow-left" /> Volver al Inicio de Sesión
              </Link>
            </div>
          )}

          {!verificando && tokenValido && success && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-check2-circle text-3xl" />
              </div>
              <h3 className="text-lg font-bold text-emerald-800 mb-2">¡Contraseña Restablecida!</h3>
              <p className="text-xs text-emerald-700 mb-4 px-2">
                Tu nueva contraseña se ha guardado exitosamente. Ahora puedes ingresar con tus credenciales actualizadas.
              </p>
              <p className="text-xs text-slate-400">Redirigiendo a la pantalla de acceso...</p>
            </div>
          )}

          {!verificando && tokenValido && !success && (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                <p className="font-semibold text-slate-800">{userData?.nombreCompleto || 'Usuario DentalCare'}</p>
                <p className="text-slate-500 mt-0.5">{userData?.email || userData?.username}</p>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill text-red-500 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                  <i className="bi bi-lock text-slate-400 flex-shrink-0" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                  <i className="bi bi-shield-check text-slate-400 flex-shrink-0" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Repite la contraseña"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    disabled={loading}
                    className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  disabled={!longitudValida || !coinciden}
                  icon={<i className="bi bi-check-lg" />}
                >
                  Confirmar Nueva Contraseña
                </Button>
              </div>

              <div className="text-center pt-1">
                <Link to="/" className="text-xs text-slate-400 hover:text-primary-600 transition-colors">
                  Cancelar y volver al login
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResetPasswordTokenPage;
