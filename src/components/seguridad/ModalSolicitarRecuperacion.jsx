import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitarRecuperacionPassword } from '../../services/auth.service';
import { alertSuccess, alertError } from '../../utils/alert.utils';

export default function ModalSolicitarRecuperacion({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identificador.trim()) {
      alertError('Por favor ingrese su correo electrónico institucional o usuario.');
      return;
    }

    setLoading(true);
    try {
      const resp = await solicitarRecuperacionPassword(identificador.trim());
      setResultado(resp);
      alertSuccess(
        'Se han generado las credenciales de recuperación.',
        'Solicitud Procesada'
      );
    } catch (err) {
      alertError(err.message || 'Error al solicitar recuperación de contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleIrAlEnlace = () => {
    if (resultado?.token) {
      onClose();
      navigate(`/reset-password?token=${resultado.token}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-md w-full overflow-hidden">
        {/* Encabezado */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shadow-xs">
              <i className="bi bi-key-fill"></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Recuperar Acceso</h3>
              <p className="text-[11px] text-slate-400">Restablecimiento seguro de contraseña</p>
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

        {/* Contenido */}
        <div className="p-6">
          {!resultado ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Ingresa tu correo electrónico institucional o tu nombre de usuario. Te enviaremos un enlace seguro para restablecer tu contraseña.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico o Usuario *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">
                    <i className="bi bi-envelope-at"></i>
                  </span>
                  <input
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="ej. recepcion@dentalcare.com o recepcionista1"
                    required
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
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
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send"></i>
                      <span>Enviar Instrucciones</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5">
                <i className="bi bi-check-circle-fill text-emerald-600 text-base mt-0.5"></i>
                <div>
                  <strong className="block font-bold">Solicitud Generada Exitosamente</strong>
                  <span>
                    Se ha emitido el token de recuperación temporal para la cuenta vinculada a <strong>{resultado.email}</strong>.
                  </span>
                </div>
              </div>

              {resultado.claveProvisional && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <span className="text-slate-500 block text-[11px]">Clave temporal provisional:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm select-all bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                    {resultado.claveProvisional}
                  </span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleIrAlEnlace}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>Continuar a Pantalla de Restablecimiento</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
