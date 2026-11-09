import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockAlertaService } from '../services/stockAlerta.service';
import { alertError, alertSuccess, toastSuccess } from '../utils/alert.utils';

export default function GerenciaStockCriticoPage() {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  // Filtros y ordenamiento
  const [orden, setOrden] = useState('urgencia_desc');
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('TODOS'); // 'TODOS' | 'MATERIAL' | 'MEDICAMENTO'

  // Modal para verificación de regla de solo lectura
  const [probandoSeguridad, setProbandoSeguridad] = useState(false);
  const [resultadoSeguridad, setResultadoSeguridad] = useState(null);

  // Carga de alertas desde el endpoint gerencial
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [resumenData, listaData] = await Promise.all([
        stockAlertaService.getGerenciaResumen(),
        stockAlertaService.getGerenciaStockCritico(orden),
      ]);
      setResumen(resumenData);
      setAlertas(listaData || []);
    } catch (err) {
      alertError(err.message || 'Error al cargar la auditoría de stock crítico.');
    } finally {
      setLoading(false);
    }
  }, [orden]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Filtrado local
  const alertasFiltradas = useMemo(() => {
    return alertas.filter((a) => {
      const matchTipo = tipoFiltro === 'TODOS' || a.tipo === tipoFiltro;
      const term = search.toLowerCase().trim();
      const matchSearch =
        !term ||
        a.nombre.toLowerCase().includes(term) ||
        a.codigo.toLowerCase().includes(term);
      return matchTipo && matchSearch;
    });
  }, [alertas, tipoFiltro, search]);

  // Descarga de Excel oficial de auditoría
  const handleDescargarAuditoria = async () => {
    setDownloadingExcel(true);
    try {
      await stockAlertaService.descargarAuditoriaExcelGerencia();
      toastSuccess('Informe de auditoría gerencial descargado con éxito.');
    } catch (err) {
      alertError(err.message || 'Error al descargar la auditoría en Excel.');
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Test de verificación de seguridad: Intento de POST al endpoint gerencial (DENTALCARE-73)
  const testSeguridadSoloLectura = async () => {
    setProbandoSeguridad(true);
    setResultadoSeguridad(null);
    try {
      const token = localStorage.getItem('authToken');
      const resp = await fetch('http://localhost:8080/api/gerencia/stock-critico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ intentoMutacion: 'ilegal_desde_gerencia' }),
      });

      const body = await resp.json().catch(() => ({}));
      setResultadoSeguridad({
        status: resp.status,
        bloqueadoExitosamente: resp.status === 403,
        detalle: body,
      });

      if (resp.status === 403) {
        alertSuccess(
          'Protección verificada con éxito: El backend rechazó la mutación con código 403 FORBIDDEN (SOLO_LECTURA).',
          'Segregación de Funciones Activa'
        );
      } else {
        alertError(`Respuesta inesperada: HTTP ${resp.status}`);
      }
    } catch (err) {
      alertError(err.message || 'Fallo de conexión al verificar regla de seguridad.');
    } finally {
      setProbandoSeguridad(false);
    }
  };

  const getBadgeUrgencia = (nivel) => {
    switch (nivel) {
      case 'CRITICO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            CRÍTICO
          </span>
        );
      case 'ALTA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            ALTA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            MEDIA
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* ENCABEZADO DE AUDITORÍA & GOBIERNO (DENTALCARE-73)                    */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-xs">
              Módulo Gerencial
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <i className="bi bi-lock-fill text-amber-600"></i>
              Modo Auditoría / Solo Lectura
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Supervisión y Auditoría de Stock Crítico
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Inspección estratégica de existencias, cálculo de déficit de insumos clínicos y proyección de abastecimiento.
          </p>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón de Exportación Excel de Auditoría */}
          <button
            onClick={handleDescargarAuditoria}
            disabled={downloadingExcel || alertas.length === 0}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Descargar informe consolidado de auditoría en formato Excel (.xlsx)"
          >
            {downloadingExcel ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Descargando...</span>
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-excel-fill text-sm"></i>
                <span>Descargar Informe de Auditoría</span>
              </>
            )}
          </button>

          {/* Botón de Verificación de Regla de Solo Lectura */}
          <button
            onClick={testSeguridadSoloLectura}
            disabled={probandoSeguridad}
            className="py-2.5 px-3.5 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Verificar que el backend bloquea cualquier intento de mutación con 403 Forbidden"
          >
            <i className="bi bi-shield-check text-slate-600"></i>
            <span>Verificar Regla Solo Lectura</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo de Segregación de Funciones */}
      <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 text-sm shadow-xs mt-0.5">
          <i className="bi bi-shield-shaded"></i>
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">
            Segregación Estricta de Funciones (Principio de Gobernanza Clínica - DENTALCARE-73)
          </p>
          <p>
            Esta pantalla proporciona a la Gerencia capacidad de <strong>supervisión y auditoría estratégica</strong> sobre el catálogo de insumos en riesgo de desabastecimiento. Por política de control interno, esta vista no permite modificaciones de inventario ni registros de abastecimiento; dichas operaciones corresponden exclusivamente al personal operativo de almacén (Asistente Dental).
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* KPIS Y MÉTRICAS DE SUPERVISIÓN                                        */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alertas */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Insumos en Alerta
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-sm">
              <i className="bi bi-bell"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {resumen?.totalAlertas ?? alertas.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Stock actual ≤ Stock mínimo
          </span>
        </div>

        {/* Críticos */}
        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-xs bg-gradient-to-br from-rose-50/40 to-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Críticos (Agotados)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-sm">
              <i className="bi bi-exclamation-octagon-fill"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700">
            {resumen?.criticos ?? 0}
          </div>
          <span className="text-[11px] text-rose-600/80 mt-1 block font-medium">
            Existencia en 0 o cobertura ≤ 20%
          </span>
        </div>

        {/* Urgencia Alta */}
        <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-xs bg-gradient-to-br from-amber-50/40 to-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Urgencia Alta
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {resumen?.altos ?? 0}
          </div>
          <span className="text-[11px] text-amber-600/80 mt-1 block font-medium">
            Cobertura entre 20% y 50%
          </span>
        </div>

        {/* Urgencia Media */}
        <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs bg-gradient-to-br from-blue-50/40 to-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              Urgencia Media
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
              <i className="bi bi-info-circle-fill"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700">
            {resumen?.medios ?? 0}
          </div>
          <span className="text-[11px] text-blue-600/80 mt-1 block font-medium">
            Cobertura entre 50% y 100%
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* WIDGET TOP 3 INSUMOS MÁS CRÍTICOS (SUPERVISIÓN GERENCIAL)             */}
      {/* ===================================================================== */}
      {resumen?.top3 && resumen.top3.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                Top 3 Insumos en Riesgo Crítico de Agotamiento
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  Prioridad de Supervisión
                </span>
              </h2>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Insumos con menor porcentaje de cobertura respecto al stock mínimo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resumen.top3.map((item, index) => {
              const cobertura = item.porcentajeCobertura || 0;
              const isCritico = item.stockActual <= 0 || item.nivelUrgencia === 'CRITICO';

              return (
                <div
                  key={`gerencia-top3-${item.tipo}-${item.id}`}
                  className={`relative rounded-2xl p-5 border transition-all hover:shadow-md ${isCritico
                    ? 'bg-gradient-to-br from-rose-50/90 via-white to-rose-50/40 border-rose-200'
                    : 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-amber-200'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${index === 0
                        ? 'bg-rose-600 text-white shadow-xs'
                        : index === 1
                          ? 'bg-orange-600 text-white'
                          : 'bg-amber-600 text-white'
                        }`}
                    >
                      #{index + 1} Más Urgente
                    </span>
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.codigo}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1" title={item.nombre}>
                    {item.nombre}
                  </h3>
                  <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600">{item.tipo}</span>
                    <span>•</span>
                    <span>{item.unidadMedida || 'Unidad'}</span>
                  </div>

                  <div className="space-y-1.5 mb-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Cobertura:</span>
                      <span className={`font-bold ${isCritico ? 'text-rose-600' : 'text-amber-600'}`}>
                        {cobertura.toFixed(1)}% ({item.stockActual} / {item.stockMinimo})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${isCritico ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        style={{ width: `${Math.min(100, Math.max(5, cobertura))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>Déficit: <strong className="text-rose-600">-{item.deficit} uds</strong></span>
                      <span>{item.diasEstimadosAgotamiento} días est.</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <i className="bi bi-shield-lock"></i>
                      Supervisión Gerencial
                    </span>
                    <span className="text-slate-400">Solo Lectura</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CONSOLA DE AUDITORÍA: FILTROS & TABLA SOLO LECTURA                    */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Barra de Filtros y Ordenamiento */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-sm">
            <i className="bi bi-search absolute left-3 top-2.5 text-slate-400"></i>
            <input
              type="text"
              placeholder="Buscar en auditoría por nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por Categoría */}
            <div className="inline-flex rounded-xl bg-white border border-slate-200 p-0.5">
              {['TODOS', 'MATERIAL', 'MEDICAMENTO'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoFiltro(t)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-colors ${tipoFiltro === t
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {t === 'TODOS' ? 'Todos' : t === 'MATERIAL' ? 'Materiales' : 'Medicamentos'}
                </button>
              ))}
            </div>

            {/* Ordenamiento Estratégico (AC: Jira DENTALCARE-73) */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Criterio:</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              >
                <option value="urgencia_desc">Nivel de Urgencia (Mayor a Menor)</option>
                <option value="deficit_desc">Mayor Déficit de Unidades</option>
                <option value="nombre_asc">Nombre Alfabético (A-Z)</option>
                <option value="cobertura_asc">Menor Porcentaje Cobertura</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla Estrictamente de Solo Lectura */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <span className="inline-block animate-spin w-6 h-6 border-2 border-slate-600 border-t-transparent rounded-full mb-2"></span>
              <p className="text-xs">Cargando datos de auditoría de inventario...</p>
            </div>
          ) : alertasFiltradas.length === 0 ? (
            <div className="py-16 text-center text-slate-500 max-w-lg mx-auto p-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
                <i className="bi bi-shield-check"></i>
              </div>
              <h3 className="font-extrabold text-base text-slate-800">
                ¡Almacén en Estado Óptimo! (0 Insumos Críticos)
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Actualmente todos los materiales y medicamentos de la clínica cuentan con existencias superiores a su stock mínimo de seguridad.
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-left text-xs text-blue-800">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <i className="bi bi-info-circle-fill"></i>
                  ¿Cómo funciona esta pantalla? (Gestión por Excepción)
                </p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Esta consola de auditoría no muestra el inventario general completo, sino que <strong>solo lista aquellos insumos cuando su stock actual cae al nivel mínimo o por debajo (stockActual ≤ stockMinimo)</strong>.
                </p>
              </div>
              <button
                onClick={() => navigate('/inventario')}
                className="mt-5 py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <i className="bi bi-box-seam"></i>
                <span>Ver Catálogo en Inventario General</span>
              </button>
            </div>
          ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Nombre del Insumo Clínico</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-3 text-center">Stock Actual</th>
                    <th className="py-3 px-3 text-center">Stock Mínimo</th>
                    <th className="py-3 px-3 text-center">Déficit</th>
                    <th className="py-3 px-3">Porcentaje Cobertura</th>
                    <th className="py-3 px-3 text-center">Urgencia</th>
                    <th className="py-3 px-3 text-center">Días Proyectados</th>
                    <th className="py-3 px-4 text-center">Estado Auditoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alertasFiltradas.map((a) => {
                    const cobertura = a.porcentajeCobertura || 0;
                    const isCritico = a.stockActual <= 0 || a.nivelUrgencia === 'CRITICO';

                    return (
                      <tr
                        key={`${a.tipo}-${a.id}`}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Código */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-xs">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {a.codigo}
                          </span>
                        </td>

                        {/* Nombre */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 text-xs">
                            {a.nombre}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {a.unidadMedida || 'Unidad estándar'} {a.lote ? `• Lote: ${a.lote}` : ''}
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${a.tipo === 'MATERIAL'
                              ? 'bg-primary-50 text-primary-700'
                              : 'bg-teal-50 text-teal-700'
                              }`}
                          >
                            <i
                              className={
                                a.tipo === 'MATERIAL' ? 'bi bi-tools' : 'bi bi-capsule'
                              }
                            ></i>
                            {a.tipo}
                          </span>
                        </td>

                        {/* Stock Actual */}
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`font-black text-xs px-2 py-0.5 rounded ${a.stockActual <= 0
                              ? 'bg-rose-100 text-rose-700 font-bold'
                              : 'text-slate-900'
                              }`}
                          >
                            {a.stockActual}
                          </span>
                        </td>

                        {/* Stock Mínimo */}
                        <td className="py-3.5 px-3 text-center text-slate-600 font-medium">
                          {a.stockMinimo}
                        </td>

                        {/* Déficit */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            -{a.deficit}
                          </span>
                        </td>

                        {/* Cobertura */}
                        <td className="py-3.5 px-3">
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className={isCritico ? 'text-rose-600' : 'text-amber-600'}>
                                {cobertura.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${isCritico ? 'bg-rose-500' : 'bg-amber-500'
                                  }`}
                                style={{ width: `${Math.min(100, Math.max(5, cobertura))}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Urgencia */}
                        <td className="py-3.5 px-3 text-center">
                          {getBadgeUrgencia(a.nivelUrgencia)}
                        </td>

                        {/* Días Proyectados */}
                        <td className="py-3.5 px-3 text-center font-medium text-slate-700">
                          {a.diasEstimadosAgotamiento != null ? (
                            <span>{a.diasEstimadosAgotamiento} días</span>
                          ) : (
                            <span className="text-slate-400">N/D</span>
                          )}
                        </td>

                        {/* Estado de Auditoría (Estricto solo lectura, sin botones de acción) */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <i className="bi bi-eye text-slate-500"></i>
                            Auditoría
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          )}
            </div>
      </div>
      </div>
      );
}
