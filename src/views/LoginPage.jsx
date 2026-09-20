import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

/**
 * =============================================================================
 * VISTA: LoginPage
 * =============================================================================
 * 
 * Propósito:
 *   Punto de entrada para la autenticación de usuarios en el sistema DentalCare.
 *   Provee una interfaz dividida en dos paneles: un panel lateral institucional con
 *   la propuesta de valor y módulos del sistema, y un panel interactivo que captura
 *   las credenciales del usuario (identificador y contraseña), gestiona la visibilidad
 *   del campo secreto, valida la completitud de los datos y coordina la autenticación
 *   con el backend. Al autenticar con éxito, persiste la sesión (token JWT y metadatos)
 *   mediante el hook useAuth() y redirige al usuario hacia el panel de control principal (/dashboard).
 * 
 * Ubicación y Rol:
 *   src/views/LoginPage.jsx
 *   Capa de Vistas / Páginas de Autenticación y Acceso Público.
 * 
 * Trazabilidad (Referencias):
 *   - Invocado desde:
 *     * src/App.jsx (Definido como elemento para las rutas "/" y "/login").
 *   - Consume:
 *     * react-router-dom (useNavigate para la redirección post-autenticación).
 *     * src/context/AuthContext.jsx (useAuth para autenticación y sincronización reactiva).
 *     * src/components/ui/Button.jsx (Botón de acción con soporte para estado de carga).
 * 
 * Parámetros y Retornos:
 *   @returns {JSX.Element} Vista completa de inicio de sesión con branding y formulario reactivo.
 * =============================================================================
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estados locales para la gestión de formulario, visibilidad y retroalimentación
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]     = useState(false);
  const [error,      setError]       = useState('');
  const [loading,    setLoading]     = useState(false);

  /**
   * Procesa el envío del formulario de credenciales.
   * Realiza una validación previa no vacía, activa el bloqueo visual de carga,
   * despacha la autenticación mediante useAuth y transfiere el flujo a /dashboard.
   * 
   * @param {React.FormEvent<HTMLFormElement>} e - Evento de submit del formulario.
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    // Verificación sintáctica preventiva de campos requeridos
    if (!identifier.trim() || !password) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Envía credenciales al backend y sincroniza inmediatamente el estado de autenticación global
      await login(identifier.trim(), password);
      // Transfiere la navegación al panel principal
      navigate('/dashboard');
    } catch (err) {
      // Captura mensajes estructurados devueltos por la capa de servicios o el servidor
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">

      {/* ── Panel izquierdo: Branding de alto nivel ────────────────────────── */}
      <div className="hidden lg:flex w-[48%] flex-col justify-between p-12
                      bg-gradient-to-br from-slate-900 via-primary-950 to-dental-900
                      text-white relative overflow-hidden">

        {/* Círculos decorativos de fondo con desenfoque suave */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-12 -left-16 w-80 h-80 bg-dental-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-12 w-64 h-64 bg-primary-400/5 rounded-full blur-2xl" />
        </div>

        {/* Encabezado del panel de marca */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-500 to-dental-400
                            flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-primary-500/25">
              DC
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight font-display text-white">DentalCare</span>
              <span className="text-xs text-dental-300 font-semibold ml-1.5 px-2 py-0.5 rounded-full bg-dental-900/60 border border-dental-500/30">
                v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Sección central con valor del producto */}
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-dental-200 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-dental-400 animate-pulse" />
            Gestión Odontológica Inteligente
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-4 font-display">
            Precisión clínica y control total para tu clínica dental.
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Expedientes digitales, odontograma normado en tiempo real, prescripción electrónica y control de agenda centralizado.
          </p>

          {/* Tarjetas de beneficios */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <i className="bi bi-diagram-3 text-dental-300 text-lg block mb-1" />
              <p className="font-bold text-white">Odontograma FDI</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Seguimiento por pieza</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <i className="bi bi-calendar-check text-primary-300 text-lg block mb-1" />
              <p className="font-bold text-white">Agenda en Tiempo Real</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Citas y reprogramación</p>
            </div>
          </div>
        </div>

        {/* Footer institucional */}
        <div className="relative z-10 flex items-center gap-3 pt-6 border-t border-white/10">
          <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-dental-300">
            <i className="bi bi-mortarboard" />
          </div>
          <p className="text-xs text-slate-400 leading-tight">
            Universidad de El Salvador · Diseño de Sistemas II<br />
            <span className="text-slate-500">Proyecto de Cátedra — Ciclo 02-2026</span>
          </p>
        </div>
      </div>

      {/* ── Panel derecho: Formulario de inicio de sesión ──────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Tarjeta contenedor */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10">

            {/* Logo y saludo */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4 border border-primary-100 shadow-xs">
                <i className="bi bi-person-lock text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 font-display">Bienvenido de nuevo</h2>
              <p className="text-slate-500 text-xs mt-1.5">
                Ingresa tus credenciales para acceder a la plataforma clínica
              </p>
            </div>

            {/* Alerta de error */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200
                              rounded-2xl text-xs text-red-700 font-medium mb-6 animate-fade-in">
                <i className="bi bi-exclamation-triangle-fill flex-shrink-0 text-sm" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate className="space-y-4.5">

              {/* Input Identificador / Usuario */}
              <div>
                <label htmlFor="identifier" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Correo electrónico o Usuario
                </label>
                <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white border border-slate-200
                                rounded-xl hover:border-slate-300 focus-within:border-primary-500
                                focus-within:ring-4 focus-within:ring-primary-500/10 transition-all duration-200 shadow-xs">
                  <i className="bi bi-person text-slate-400 flex-shrink-0" />
                  <input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="usuario@dentalcare.com"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    disabled={loading}
                    required
                    className="flex-1 text-sm bg-transparent outline-none text-slate-800
                               placeholder-slate-400 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Input Contraseña */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white border border-slate-200
                                rounded-xl hover:border-slate-300 focus-within:border-primary-500
                                focus-within:ring-4 focus-within:ring-primary-500/10 transition-all duration-200 shadow-xs">
                  <i className="bi bi-lock text-slate-400 flex-shrink-0" />
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="flex-1 text-sm bg-transparent outline-none text-slate-800
                               placeholder-slate-400 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                  >
                    <i className={`bi bi-eye${showPwd ? '-slash' : ''} text-sm`} />
                  </button>
                </div>
              </div>

              {/* Recordarme y Olvido de contraseña */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500/20 cursor-pointer"
                  />
                  <span className="text-xs text-slate-500 font-medium">Recordar sesión</span>
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón de Ingreso */}
              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  size="lg"
                  iconRight={<i className="bi bi-arrow-right" />}
                >
                  Ingresar al Sistema
                </Button>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            ¿Problemas para acceder? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
