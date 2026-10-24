import React, { useState, useEffect } from 'react';
import {
  generarRespaldo,
  listarRespaldos,
  descargarRespaldo,
  restaurarRespaldo,
  restaurarDesdeArchivo,
} from '../services/seguridad.service';
import Button from '../components/ui/Button';
import { LoadingSpinner, EmptyState } from '../components/ui/LoadingSpinner';
import { alertSuccess, alertError } from '../utils/alert.utils';
import { getUserIdentifier } from '../services/auth.service';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Vista de Administración TI para Respaldos y Restauración de Base de Datos (Sprint 4).
 * Historias: DENTALCARE-53 (Ejecutar Respaldos) y DENTALCARE-64 (Restaurar Información).
 */
const MantenimientoRespaldosPage = () => {
  const [respaldos, setRespaldos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);

  // Estados para Modal de Doble Confirmación de Restauración
  const [modalRestaurarOpen, setModalRestaurarOpen] = useState(false);
  const [respaldoSeleccionado, setRespaldoSeleccionado] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmacionTexto, setConfirmacionTexto] = useState('');
  const [restaurando, setRestaurando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  // Estados para Restauración desde Archivo Externo
  const [modalUploadOpen, setModalUploadOpen] = useState(false);
  const [archivoSql, setArchivoSql] = useState(null);

  const adminUsername = getUserIdentifier();

  const cargarRespaldos = async () => {
    setLoading(true);
    try {
      const res = await listarRespaldos();
      setRespaldos(res?.data ?? []);
    } catch (err) {
      alertError(err.message || 'Error al listar los respaldos existentes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRespaldos();
  }, []);

  // ── Generar Respaldo Manual ───────────────────────────────────────────────
  const handleGenerarRespaldo = async () => {
    setGenerando(true);
    try {
      const res = await generarRespaldo();
      alertSuccess(
        'Respaldo Completado',
        `El archivo "${res.data?.nombreArchivo}" fue generado exitosamente (${res.data?.tamanioFormateado}).`
      );
      await cargarRespaldos();
    } catch (err) {
      alertError(err.message || 'Error al generar el respaldo de la base de datos.');
    } finally {
      setGenerando(false);
    }
  };

  // ── Descargar Archivo SQL ─────────────────────────────────────────────────
  const handleDescargar = async (respaldo) => {
    try {
      await descargarRespaldo(respaldo.id, respaldo.nombreArchivo);
    } catch (err) {
      alertError(err.message || 'Error al descargar el archivo de respaldo.');
    }
  };

  // ── Abrir Modal de Restauración ───────────────────────────────────────────
  const abrirModalRestauracion = (respaldo) => {
    setRespaldoSeleccionado(respaldo);
    setAdminPassword('');
    setConfirmacionTexto('');
    setErrorModal('');
    setModalRestaurarOpen(true);
  };

  const cerrarModalRestauracion = () => {
    if (restaurando) return;
    setModalRestaurarOpen(false);
    setRespaldoSeleccionado(null);
    setAdminPassword('');
    setConfirmacionTexto('');
    setErrorModal('');
  };

  // ── Ejecutar Restauración con Doble Confirmación (DENTALCARE-64) ───────────
  const handleEjecutarRestauracion = async () => {
    if (confirmacionTexto.trim() !== 'RESTAURAR') {
      setErrorModal('Debe escribir exactamente la palabra RESTAURAR en mayúsculas.');
      return;
    }
    if (!adminPassword.trim()) {
      setErrorModal('Debe ingresar su contraseña de Administrador.');
      return;
    }

    setRestaurando(true);
    setErrorModal('');
    try {
      await restaurarRespaldo(respaldoSeleccionado.id, {
        adminPassword: adminPassword.trim(),
        confirmacionTexto: confirmacionTexto.trim(),
        adminUsername,
      });

      alertSuccess(
        'Base de Datos Restaurada',
        'La base de datos se ha restablecido al punto de recuperación seleccionado.'
      );
      cerrarModalRestauracion();
      await cargarRespaldos();
    } catch (err) {
      setErrorModal(err.message || 'Error al restaurar la base de datos.');
    } finally {
      setRestaurando(false);
    }
  };

  // ── Ejecutar Restauración desde Archivo Externo ───────────────────────────
  const handleEjecutarRestauracionArchivo = async () => {
    if (!archivoSql) {
      setErrorModal('Seleccione un archivo con extensión .sql.');
      return;
    }
    if (confirmacionTexto.trim() !== 'RESTAURAR') {
      setErrorModal('Debe escribir exactamente la palabra RESTAURAR en mayúsculas.');
      return;
    }
    if (!adminPassword.trim()) {
      setErrorModal('Debe ingresar su contraseña de Administrador.');
      return;
    }

    setRestaurando(true);
    setErrorModal('');
    try {
      await restaurarDesdeArchivo(archivoSql, adminPassword.trim(), confirmacionTexto.trim(), adminUsername);
      alertSuccess('Base de Datos Restaurada', 'Restauración ejecutada exitosamente desde el archivo cargado.');
      setModalUploadOpen(false);
      setArchivoSql(null);
      setAdminPassword('');
      setConfirmacionTexto('');
      await cargarRespaldos();
    } catch (err) {
      setErrorModal(err.message || 'Error durante la restauración desde archivo.');
    } finally {
      setRestaurando(false);
    }
  };

  // Métricas de respaldos
  const totalRespaldos = respaldos.length;
  const ultimoRespaldo = respaldos[0]?.creadoEn
    ? new Date(respaldos[0].creadoEn).toLocaleString()
    : 'Ninguno registrado';
  const totalBytes = respaldos.reduce((acc, r) => acc + (r.tamanioBytes || 0), 0);
  const totalFormateado = (totalBytes / (1024 * 1024)).toFixed(2) + ' MB';

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">

      {/* ── Encabezado y Barra de Herramientas ──────────────────────────────── */}
      <header className="px-6 py-5 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-primary-50 text-primary-700 rounded-xl">
                <i className="bi bi-database-gear text-xl" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                  Gestión de Respaldos y Contingencia de Base de Datos
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generación de volcados completos MySQL y plan de recuperación ante desastres (Sprint 4)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setArchivoSql(null);
                setAdminPassword('');
                setConfirmacionTexto('');
                setErrorModal('');
                setModalUploadOpen(true);
              }}
              icon={<i className="bi bi-upload text-slate-500" />}
            >
              Cargar Respaldo .sql
            </Button>

            <Button
              size="sm"
              onClick={handleGenerarRespaldo}
              loading={generando}
              icon={<i className="bi bi-database-fill-down" />}
              className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
            >
              Generar Respaldo Manual
            </Button>
          </div>
        </div>

        {/* ── Tarjetas de Métricas Rápidas ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-lg flex-shrink-0">
              <i className="bi bi-archive-fill" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Copias Guardadas</p>
              <h4 className="text-lg font-bold text-slate-800">{totalRespaldos} {totalRespaldos === 1 ? 'respaldo' : 'respaldos'}</h4>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg flex-shrink-0">
              <i className="bi bi-clock-history" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Última Ejecución</p>
              <h4 className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{ultimoRespaldo}</h4>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg flex-shrink-0">
              <i className="bi bi-hdd-network" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Almacenamiento Total</p>
              <h4 className="text-lg font-bold text-slate-800">{totalFormateado}</h4>
            </div>
          </div>
        </div>
      </header>

      {/* ── Contenido Principal: Listado Histórico ─────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">

          {loading && respaldos.length === 0 && (
            <div className="py-16 text-center">
              <LoadingSpinner text="Cargando catálogo histórico de respaldos..." />
            </div>
          )}

          {!loading && respaldos.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-card">
              <EmptyState
                icon="bi-database"
                title="Aún no se han generado respaldos"
                description="Haz clic en 'Generar Respaldo Manual' para crear el primer volcado de seguridad de la base de datos."
              />
            </div>
          )}

          {respaldos.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <i className="bi bi-table text-slate-400" /> Registro Histórico de Respaldos
                </h5>
                <span className="text-xs text-slate-400 font-mono">
                  BD_DentalCareWeb (MySQL 8.0)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4"># ID</th>
                      <th className="py-3 px-4">Nombre del Archivo</th>
                      <th className="py-3 px-4">Tamaño</th>
                      <th className="py-3 px-4">Fecha y Hora</th>
                      <th className="py-3 px-4">Generado Por</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {respaldos.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-500">#{r.id}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-primary-700">
                          <i className="bi bi-filetype-sql text-slate-400 mr-1.5 text-sm" />
                          {r.nombreArchivo}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {r.tamanioFormateado}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(r.creadoEn).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {r.creadoPor || 'Administrador TI'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <i className="bi bi-check-circle-fill text-[10px]" />
                            {r.estado}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="xs"
                              variant="secondary"
                              onClick={() => handleDescargar(r)}
                              icon={<i className="bi bi-download text-primary-600" />}
                              title="Descargar archivo .sql"
                            >
                              Descargar
                            </Button>

                            <Button
                              size="xs"
                              onClick={() => abrirModalRestauracion(r)}
                              icon={<i className="bi bi-arrow-counterclockwise text-amber-500" />}
                              className="bg-white border-amber-300 text-amber-800 hover:bg-amber-50"
                              title="Restaurar base de datos a este punto"
                            >
                              Restaurar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── MODAL 1: DOBLE CONFIRMACIÓN DE RESTAURACIÓN (DENTALCARE-64) ─────── */}
      {modalRestaurarOpen && respaldoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-lg w-full overflow-hidden">

            {/* Cabecera Crítica */}
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
                  <i className="bi bi-exclamation-triangle-fill text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">ADVERTENCIA CRÍTICA: Restaurar BD</h3>
                  <p className="text-xs text-red-200">Operación de Contingencia y Recuperación</p>
                </div>
              </div>
              {!restaurando && (
                <button
                  onClick={cerrarModalRestauracion}
                  className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <i className="bi bi-x-lg text-lg" />
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Alerta Destructiva */}
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <i className="bi bi-shield-slash-fill text-red-600" /> SOBREESCRITURA TOTAL DE DATOS
                </p>
                <p className="leading-relaxed text-red-700">
                  La restauración reemplazará <strong>todas las tablas, pacientes, citas y registros clínicos</strong> por
                  el contenido del archivo seleccionado:
                </p>
                <p className="font-mono bg-white/80 p-2 rounded-lg border border-red-200 text-red-900 font-semibold truncate">
                  {respaldoSeleccionado.nombreArchivo} ({respaldoSeleccionado.tamanioFormateado})
                </p>
                <p className="text-[11px] font-semibold text-red-600">
                  ⚠️ Esta acción es IRREVERSIBLE.
                </p>
              </div>

              {errorModal && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-800 flex items-center gap-2">
                  <i className="bi bi-x-circle-fill text-red-600 flex-shrink-0" />
                  <span>{errorModal}</span>
                </div>
              )}

              {/* Paso 1: Palabra Clave */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Escribe la palabra <span className="font-mono text-red-600 bg-red-50 px-1 py-0.5 rounded">RESTAURAR</span> para desbloquear la acción:
                </label>
                <input
                  type="text"
                  placeholder="Escribe RESTAURAR"
                  value={confirmacionTexto}
                  onChange={(e) => setConfirmacionTexto(e.target.value)}
                  disabled={restaurando}
                  className={`w-full px-3 py-2 text-sm border rounded-xl outline-none font-mono transition-all ${
                    confirmacionTexto === 'RESTAURAR'
                      ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500'
                      : 'border-slate-200 focus:border-red-400'
                  }`}
                />
              </div>

              {/* Paso 2: Contraseña de Administrador */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Contraseña del Administrador Actual:
                </label>
                <input
                  type="password"
                  placeholder="Tu contraseña de administrador"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  disabled={restaurando}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-3 justify-end">
                <Button variant="secondary" onClick={cerrarModalRestauracion} disabled={restaurando}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleEjecutarRestauracion}
                  loading={restaurando}
                  disabled={confirmacionTexto.trim() !== 'RESTAURAR' || !adminPassword.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  icon={<i className="bi bi-radioactive" />}
                >
                  Proceder con la Restauración
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL 2: CARGA DE ARCHIVO EXTERNO .SQL ──────────────────────────── */}
      {modalUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-primary-800 to-dental-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                  <i className="bi bi-upload text-dental-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">Restaurar desde Archivo Externo</h3>
                  <p className="text-xs text-primary-200">Carga de volcado SQL manual</p>
                </div>
              </div>
              {!restaurando && (
                <button
                  onClick={() => setModalUploadOpen(false)}
                  className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <i className="bi bi-x-lg text-lg" />
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              {errorModal && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-800 flex items-center gap-2">
                  <i className="bi bi-x-circle-fill text-red-600" />
                  <span>{errorModal}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Archivo de volcado SQL (.sql):
                </label>
                <input
                  type="file"
                  accept=".sql"
                  onChange={(e) => setArchivoSql(e.target.files?.[0] || null)}
                  disabled={restaurando}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Escribe la palabra <span className="font-mono text-red-600">RESTAURAR</span>:
                </label>
                <input
                  type="text"
                  placeholder="RESTAURAR"
                  value={confirmacionTexto}
                  onChange={(e) => setConfirmacionTexto(e.target.value)}
                  disabled={restaurando}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña de Administrador:
                </label>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  disabled={restaurando}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-3 justify-end">
                <Button variant="secondary" onClick={() => setModalUploadOpen(false)} disabled={restaurando}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleEjecutarRestauracionArchivo}
                  loading={restaurando}
                  disabled={!archivoSql || confirmacionTexto.trim() !== 'RESTAURAR' || !adminPassword.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  icon={<i className="bi bi-radioactive" />}
                >
                  Restaurar Archivo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MantenimientoRespaldosPage;
