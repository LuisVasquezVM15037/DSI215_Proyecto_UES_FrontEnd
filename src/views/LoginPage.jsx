import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginService, saveSession } from '../services/auth.service';
import Button from '../components/ui/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Página de login.
 * La lógica de autenticación vive en auth.service.js.
 * Este componente solo maneja el estado del formulario y la navegación.
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]     = useState(false);
  const [error,      setError]       = useState('');
  const [loading,    setLoading]     = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await loginService(identifier.trim(), password);
      saveSession(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* ── Panel izquierdo: branding ────────────────────────────────────── */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12
                      bg-gradient-to-br from-primary-800 via-primary-700 to-dental-600
                      text-white relative overflow-hidden">

        {/* Decoración de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute bottom-12 -left-16 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 right-8 w-32 h-32 bg-dental-400/20 rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="text-3xl font-black tracking-tight mb-2">DentalCare.</div>
          <div className="w-8 h-0.5 bg-dental-400 rounded-full" />
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Sistema integral de<br />gestión clínica y<br />
            <span className="text-dental-300">odontograma digital.</span>
          </h2>
          <p className="text-primary-200 text-sm leading-relaxed max-w-xs">
            Gestiona pacientes, agenda citas y registra consultas con un flujo
            clínico completo desde un solo lugar.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <i className="bi bi-shield-check text-dental-300 text-sm" />
          </div>
          <span className="text-xs text-primary-300">Diseño de Sistemas I - Universidad de El Salvador <br /> Derechos Reservados / Ciclo 01-2026</span>
        </div>
      </div>

      {/* ── Panel derecho: formulario ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm">

          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-2xl font-black text-primary-700">DentalCare.</span>
          </div>

          <div className="text-center mb-8">  
            <img
            src="/img/dentalcare.png"
            alt="DentalCare Clínica Odontológica"
            className="w-52 mx-auto mb-4"         // Se agrega estas lineas de código para agregar el logo de la clinica
            style = {{mixBlendMode: 'multiply'}}
             />
            <h2 className="text-2xl font-bold text-slate-800">Bienvenido de nuevo</h2>
            <p className="text-slate-500 text-sm mt-1">Ingresa tus credenciales para acceder al panel.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200
                            rounded-xl text-sm text-red-700 mb-5">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-4">

            {/* Usuario / Email */}
            <div>
              <label htmlFor="identifier"
                className="block text-xs font-medium text-slate-600 mb-1">
                Correo electrónico o Usuario
              </label>
              <div className="flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-200
                              rounded-xl focus-within:ring-2 focus-within:ring-primary-500
                              focus-within:border-transparent transition-all">
                <i className="bi bi-person text-slate-400 flex-shrink-0" />
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="ejemplo@dentalcare.com"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  disabled={loading}
                  required
                  className="flex-1 text-sm bg-transparent outline-none text-slate-800
                             placeholder-slate-400 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password"
                className="block text-xs font-medium text-slate-600 mb-1">
                Contraseña
              </label>
              <div className="flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-200
                              rounded-xl focus-within:ring-2 focus-within:ring-primary-500
                              focus-within:border-transparent transition-all">
                <i className="bi bi-lock text-slate-400 flex-shrink-0" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
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

            {/* Recordarme / Olvidé */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 accent-primary-600" />
                <span className="text-xs text-slate-500">Recordarme</span>
              </label>
              <button
                type="button"
                className="text-xs text-primary-600 hover:text-primary-800 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Ingresar al Sistema
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            ¿Problemas de acceso? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
