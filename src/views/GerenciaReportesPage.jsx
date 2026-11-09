import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { reporteGerenciaService } from '../services/reporteGerencia.service';
import { alertError, alertSuccess, toastSuccess } from '../utils/alert.utils';

export default function GerenciaReportesPage() {
  // Manejo de pestaña activa con soporte de query param ?tab=rendimiento
  const getInitialTab = () => {
    try {
      const p = new URLSearchParams(window.location.search).get('tab');
      if (['reportes', 'rendimiento'].includes(p)) return p;
    } catch (e) {}
    return 'reportes';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // =========================================================================
  // ESTADOS PARA REPORTE ANALÍTICO (DENTALCARE-70, DENTALCARE-72, DENTALCARE-74)
  // =========================================================================
  const [tiposReportes, setTiposReportes] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('CONSUMO_MATERIALES'); // 'CONSUMO_MATERIALES' | 'NUMERO_ATENCIONES'

  // Fechas por defecto (Mes actual)
  const hoy = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const primerDiaMes = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }, []);

  const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
  const [fechaFin, setFechaFin] = useState(hoy);

  // Filtros dinámicos
  const [categoriaItem, setCategoriaItem] = useState('TODOS'); // 'TODOS' | 'MATERIAL' | 'MEDICAMENTO'
  const [estadoCita, setEstadoCita] = useState('TODOS'); // 'TODOS' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO'
  const [searchTerm, setSearchTerm] = useState('');

  const [reporteData, setReporteData] = useState(null);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  // =========================================================================
  // ESTADOS PARA REGLAS DE RENDIMIENTO (DENTALCARE-95)
  // =========================================================================
  const [reglas, setReglas] = useState([]);
  const [loadingReglas, setLoadingReglas] = useState(false);
  const [evaluandoReglas, setEvaluandoReglas] = useState(false);

  // Modal de Crear / Editar Regla
  const [modalReglaOpen, setModalReglaOpen] = useState(false);
  const [reglaEnEdicion, setReglaEnEdicion] = useState(null);
  const [formRegla, setFormRegla] = useState({
    nombreIndicador: '',
    descripcion: '',
    tipoMetrica: 'MAX_CANCELACIONES_PORCENTAJE',
    operadorComparacion: 'MAYOR_QUE',
    valorUmbral: '15.0',
    periodoEvaluacion: 'SEMANAL',
    activo: true,
  });

  // =========================================================================
  // CARGAS DE DATOS
  // =========================================================================

  // Cargar catálogo de tipos de reportes
  useEffect(() => {
    reporteGerenciaService.getTiposReportes()
      .then(setTiposReportes)
      .catch(() => {});
  }, []);

  // Cargar datos del reporte analítico
  const cargarReporte = useCallback(async () => {
    setLoadingReporte(true);
    try {
      const data = await reporteGerenciaService.getDatosReporte({
        tipo: tipoSeleccionado,
        fechaInicio,
        fechaFin,
        categoriaItem,
        estadoCita,
      });
      setReporteData(data);
    } catch (err) {
      alertError(err.message || 'Error al generar el reporte analítico');
    } finally {
      setLoadingReporte(false);
    }
  }, [tipoSeleccionado, fechaInicio, fechaFin, categoriaItem, estadoCita]);

  useEffect(() => {
    if (activeTab === 'reportes') {
      cargarReporte();
    }
  }, [activeTab, cargarReporte]);

  // Cargar reglas de rendimiento
  const cargarReglas = useCallback(async () => {
    setLoadingReglas(true);
    try {
      const data = await reporteGerenciaService.getReglasRendimiento();
      setReglas(data || []);
    } catch (err) {
      alertError(err.message || 'Error al cargar las reglas de rendimiento');
    } finally {
      setLoadingReglas(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'rendimiento') {
      cargarReglas();
    }
  }, [activeTab, cargarReglas]);

  // Presets rápidos de período
  const aplicarPresetPeriodo = (preset) => {
    const d = new Date();
    if (preset === 'MES_ACTUAL') {
      setFechaInicio(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10));
      setFechaFin(hoy);
    } else if (preset === 'MES_ANTERIOR') {
      const inicioMesAnt = new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().slice(0, 10);
      const finMesAnt = new Date(d.getFullYear(), d.getMonth(), 0).toISOString().slice(0, 10);
      setFechaInicio(inicioMesAnt);
      setFechaFin(finMesAnt);
    } else if (preset === 'ULTIMOS_30') {
      const d30 = new Date();
      d30.setDate(d.getDate() - 30);
      setFechaInicio(d30.toISOString().slice(0, 10));
      setFechaFin(hoy);
    }
  };

  // Exportar Excel
  const handleExportarExcel = async () => {
    setDownloadingExcel(true);
    try {
      await reporteGerenciaService.descargarReporteExcel({
        tipo: tipoSeleccionado,
        fechaInicio,
        fechaFin,
        categoriaItem,
        estadoCita,
      });
      toastSuccess('Reporte Excel generado y descargado con éxito.');
    } catch (err) {
      alertError(err.message || 'Error al exportar reporte Excel');
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Imprimir reporte con estilos CSS @media print
  const handleImprimir = () => {
    window.print();
  };

  // Filtrado local de la tabla de detalle por término de búsqueda
  const tablaDetalleFiltrada = useMemo(() => {
    if (!reporteData?.tablaDetalle) return [];
    if (!searchTerm.trim()) return reporteData.tablaDetalle;
    const term = searchTerm.toLowerCase();
    return reporteData.tablaDetalle.filter(
      (item) =>
        (item.concepto && item.concepto.toLowerCase().includes(term)) ||
        (item.subconcepto && item.subconcepto.toLowerCase().includes(term)) ||
        (item.persona1 && item.persona1.toLowerCase().includes(term)) ||
        (item.persona2 && item.persona2.toLowerCase().includes(term)) ||
        (item.estado && item.estado.toLowerCase().includes(term))
    );
  }, [reporteData, searchTerm]);

  // =========================================================================
  // GESTIÓN DE REGLAS DE RENDIMIENTO (DENTALCARE-95)
  // =========================================================================

  const handleOpenCrearRegla = () => {
    setReglaEnEdicion(null);
    setFormRegla({
      nombreIndicador: '',
      descripcion: '',
      tipoMetrica: 'MAX_CANCELACIONES_PORCENTAJE',
      operadorComparacion: 'MAYOR_QUE',
      valorUmbral: '15.0',
      periodoEvaluacion: 'SEMANAL',
      activo: true,
    });
    setModalReglaOpen(true);
  };

  const handleOpenEditarRegla = (regla) => {
    setReglaEnEdicion(regla);
    setFormRegla({
      nombreIndicador: regla.nombreIndicador,
      descripcion: regla.descripcion || '',
      tipoMetrica: regla.tipoMetrica,
      operadorComparacion: regla.operadorComparacion,
      valorUmbral: String(regla.valorUmbral),
      periodoEvaluacion: regla.periodoEvaluacion,
      activo: regla.activo,
    });
    setModalReglaOpen(true);
  };

  const handleGuardarRegla = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formRegla,
        valorUmbral: parseFloat(formRegla.valorUmbral),
      };

      if (reglaEnEdicion) {
        await reporteGerenciaService.actualizarReglaRendimiento(reglaEnEdicion.id, payload);
        toastSuccess('Regla de rendimiento actualizada.');
      } else {
        await reporteGerenciaService.crearReglaRendimiento(payload);
        toastSuccess('Nueva regla de rendimiento creada exitosamente.');
      }

      setModalReglaOpen(false);
      await cargarReglas();
    } catch (err) {
      alertError(err.message || 'No se pudo guardar la regla de rendimiento');
    }
  };

  const handleToggleRegla = async (id) => {
    try {
      await reporteGerenciaService.toggleReglaRendimiento(id);
      toastSuccess('Estado de regla actualizado');
      await cargarReglas();
    } catch (err) {
      alertError(err.message || 'Error al cambiar estado de regla');
    }
  };

  const handleEliminarRegla = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la regla '${nombre}'?`)) return;
    try {
      await reporteGerenciaService.eliminarReglaRendimiento(id);
      toastSuccess('Regla eliminada exitosamente');
      await cargarReglas();
    } catch (err) {
      alertError(err.message || 'Error al eliminar regla');
    }
  };

  const handleEvaluarAhora = async () => {
    setEvaluandoReglas(true);
    try {
      const resumen = await reporteGerenciaService.evaluarReglasManualmente();
      if (resumen.alertasDisparadas > 0) {
        alertSuccess(
          `Evaluación completada: Se dispararon ${resumen.alertasDisparadas} alertas de rendimiento que superan el umbral permitido. Se notificó a Gerencia.`,
          'Umbrales Evaluados'
        );
      } else {
        alertSuccess(
          `Evaluación completada: Las ${resumen.totalReglasEvaluadas} reglas se encuentran en rango óptimo y normal.`,
          'Rendimiento Clínico Óptimo'
        );
      }
      await cargarReglas();
    } catch (err) {
      alertError(err.message || 'Error al evaluar las reglas de rendimiento');
    } finally {
      setEvaluandoReglas(false);
    }
  };

  // Helper para etiquetas legibles de operadores
  const formatOperador = (op) => {
    switch (op) {
      case 'MAYOR_QUE': return '>';
      case 'MAYOR_IGUAL_QUE': return '≥';
      case 'MENOR_QUE': return '<';
      case 'MENOR_IGUAL_QUE': return '≤';
      default: return op;
    }
  };

  const formatMetricaLabel = (m) => {
    switch (m) {
      case 'MAX_CANCELACIONES_PORCENTAJE': return 'Tasa de Cancelaciones / Inasistencias (%)';
      case 'ATENCIONES_MINIMAS': return 'Citas Concluidas Mínimas';
      case 'STOCK_CRITICO_CANTIDAD': return 'Cantidad Máxima de Insumos Críticos';
      case 'TIEMPO_ESPERA_PROMEDIO_MINS': return 'Tiempo Promedio de Espera (min)';
      default: return m;
    }
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* ENCABEZADO PRINCIPAL DE GERENCIA                                     */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-xs">
              Módulo Gerencial
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-100 text-primary-800 border border-primary-200">
              Inteligencia de Negocios & BI
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Reportes Institucionales y Rendimiento Clínico
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Análisis cuantitativo de atenciones, consumo de recursos y monitoreo de umbrales de calidad.
          </p>
        </div>

        {/* Pestañas de Navegación del Módulo */}
        <div className="inline-flex rounded-2xl bg-white border border-slate-200 p-1 shadow-xs">
          <button
            onClick={() => setActiveTab('reportes')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'reportes'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="bi bi-graph-up-arrow"></i>
            <span>Reportes & Analítica</span>
          </button>
          <button
            onClick={() => setActiveTab('rendimiento')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'rendimiento'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Alertas de Rendimiento</span>
            {reglas.some((r) => r.estadoAlertaDisparada) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PESTAÑA 1: REPORTES & ANALÍTICA (DENTALCARE-70, 72, 74)               */}
      {/* ===================================================================== */}
      {activeTab === 'reportes' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 1. Catálogo Selector de Tipo de Reporte (DENTALCARE-70) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiposReportes.map((tipo) => {
              const selected = tipoSeleccionado === tipo.id;
              return (
                <div
                  key={tipo.id}
                  onClick={() => setTipoSeleccionado(tipo.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selected
                      ? 'bg-primary-50/40 border-primary-500 ring-2 ring-primary-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        selected
                          ? 'bg-primary-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <i className={`bi ${tipo.icono || 'bi-bar-chart'}`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{tipo.titulo}</h3>
                        {selected && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary-600 text-white">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {tipo.descripcion}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-600">{tipo.categoria}</span>
                        <span>•</span>
                        <span>Frecuencia: {tipo.periodoRecomendado}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Barra de Filtros Dinámicos (DENTALCARE-72) y Acciones */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <i className="bi bi-funnel-fill text-primary-600"></i>
                  Filtros Dinámicos de Segmentación
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ajusta el período de evaluación y los criterios específicos para recalcular métricas al instante.
                </p>
              </div>

              {/* Botones de Exportación e Impresión (DENTALCARE-74) */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportarExcel}
                  disabled={downloadingExcel || loadingReporte}
                  className="py-2 px-3.5 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Descargar datos y KPIs en hoja de cálculo Excel (.xlsx)"
                >
                  {downloadingExcel ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      <span>Exportando...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-file-earmark-excel-fill text-sm"></i>
                      <span>Exportar Excel</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleImprimir}
                  className="py-2 px-3.5 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Imprimir informe oficial para presentación o archivado documental"
                >
                  <i className="bi bi-printer-fill text-slate-600"></i>
                  <span>Imprimir Reporte</span>
                </button>
              </div>
            </div>

            {/* Fila de Controles de Filtro */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Presets Rápidos */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Período Predefinido:</label>
                <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => aplicarPresetPeriodo('MES_ACTUAL')}
                    className="flex-1 py-1.5 px-2 rounded-lg font-semibold text-[11px] bg-white text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors"
                  >
                    Mes Actual
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarPresetPeriodo('MES_ANTERIOR')}
                    className="flex-1 py-1.5 px-2 rounded-lg font-semibold text-[11px] text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Mes Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarPresetPeriodo('ULTIMOS_30')}
                    className="flex-1 py-1.5 px-2 rounded-lg font-semibold text-[11px] text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    30 Días
                  </button>
                </div>
              </div>

              {/* Rango de Fechas: Desde */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha Inicio:</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              {/* Rango de Fechas: Hasta */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha Fin:</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              {/* Filtro específico por Tipo de Reporte */}
              <div>
                {tipoSeleccionado === 'CONSUMO_MATERIALES' ? (
                  <>
                    <label className="block font-bold text-slate-700 mb-1">Categoría de Insumo:</label>
                    <select
                      value={categoriaItem}
                      onChange={(e) => setCategoriaItem(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="TODOS">Todos los Insumos (Materiales + Meds)</option>
                      <option value="MATERIAL">Solo Materiales Odontológicos</option>
                      <option value="MEDICAMENTO">Solo Medicamentos Clínicos</option>
                    </select>
                  </>
                ) : (
                  <>
                    <label className="block font-bold text-slate-700 mb-1">Estado de Citas:</label>
                    <select
                      value={estadoCita}
                      onChange={(e) => setEstadoCita(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="TODOS">Todos los Estados de Citas</option>
                      <option value="COMPLETADA">Solo Citas Atendidas (Completadas)</option>
                      <option value="CANCELADA">Solo Citas Canceladas</option>
                      <option value="NO_ASISTIO">Solo No Asistió (Vencidas)</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 3. Indicadores Clave de Rendimiento (KPI Cards - DENTALCARE-74) */}
          {reporteData?.kpis && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {tipoSeleccionado === 'CONSUMO_MATERIALES' ? (
                <>
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Total Insumos Consumidos
                    </span>
                    <div className="text-2xl font-black text-slate-900">
                      {reporteData.kpis.totalConsumoItems} uds
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Promedio diario: {reporteData.kpis.promedioAtencionesDiarias} uds
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Insumo Más Demandado
                    </span>
                    <div className="text-base font-extrabold text-primary-700 line-clamp-1" title={reporteData.kpis.insumoMasConsumido}>
                      {reporteData.kpis.insumoMasConsumido}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Mayor volumen en procedimientos
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Categoría Predominante
                    </span>
                    <div className="text-base font-extrabold text-teal-700">
                      {reporteData.kpis.categoriaMayorConsumo}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Mayor concentración de uso
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Procedimientos Vinculados
                    </span>
                    <div className="text-2xl font-black text-slate-900">
                      {reporteData.kpis.totalAtenciones} citas
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Con registro de consumo clínico
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Atenciones Concluidas
                    </span>
                    <div className="text-2xl font-black text-emerald-600">
                      {reporteData.kpis.totalAtenciones}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      De {reporteData.kpis.totalCitasProgramadas} citas programadas
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Tasa de Efectividad
                    </span>
                    <div className="text-2xl font-black text-primary-600">
                      {reporteData.kpis.tasaEfectividad}%
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Asistencia efectiva a consulta
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Cancelaciones / No Asistió
                    </span>
                    <div className="text-2xl font-black text-rose-600">
                      {reporteData.kpis.totalCanceladas + reporteData.kpis.totalNoAsistio}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {reporteData.kpis.totalCanceladas} canc. / {reporteData.kpis.totalNoAsistio} no asistió
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Doctor con Mayor Atenciones
                    </span>
                    <div className="text-sm font-extrabold text-slate-900 line-clamp-1" title={reporteData.kpis.doctorMayorAtencion}>
                      {reporteData.kpis.doctorMayorAtencion}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Líder de productividad clínica
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 4. Gráficos Visuales Estadísticos (DENTALCARE-74) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico 1: Tendencia Temporal (Bar Chart Responsivo SVG) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <i className="bi bi-bar-chart-line-fill text-primary-600"></i>
                    Evolución Temporal en el Período
                  </h3>
                  <span className="text-xs text-slate-400">
                    {tipoSeleccionado === 'CONSUMO_MATERIALES'
                      ? 'Unidades consumidas por día'
                      : 'Atenciones efectivas vs inasistencias por día'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-primary-700 font-semibold">
                    <span className="w-3 h-3 rounded-sm bg-primary-600"></span>
                    {tipoSeleccionado === 'CONSUMO_MATERIALES' ? 'Consumos' : 'Atenciones'}
                  </span>
                  {tipoSeleccionado === 'NUMERO_ATENCIONES' && (
                    <span className="flex items-center gap-1 text-rose-700 font-semibold">
                      <span className="w-3 h-3 rounded-sm bg-rose-400"></span>
                      Canceladas / No Asistió
                    </span>
                  )}
                </div>
              </div>

              {/* Render del Gráfico de Barras SVG */}
              {reporteData?.graficoTendencia && reporteData.graficoTendencia.length > 0 ? (
                (() => {
                  const items = reporteData.graficoTendencia;
                  const maxVal = Math.max(
                    1,
                    ...items.map((i) =>
                      tipoSeleccionado === 'CONSUMO_MATERIALES'
                        ? i.consumos || 0
                        : Math.max(i.atenciones || 0, i.canceladas || 0)
                    )
                  );

                  return (
                    <div className="h-56 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-2 border-b border-slate-100 overflow-x-auto">
                      {items.map((point, idx) => {
                        const val1 =
                          tipoSeleccionado === 'CONSUMO_MATERIALES'
                            ? point.consumos || 0
                            : point.atenciones || 0;
                        const val2 = point.canceladas || 0;
                        const h1 = Math.round((val1 / maxVal) * 100);
                        const h2 = Math.round((val2 / maxVal) * 100);

                        return (
                          <div
                            key={idx}
                            className="flex-1 min-w-[28px] max-w-[45px] flex flex-col items-center gap-1 group relative h-full justify-end"
                          >
                            {/* Tooltip flotante */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap shadow-md z-10 font-mono">
                              {point.periodo}: {val1} {tipoSeleccionado === 'CONSUMO_MATERIALES' ? 'uds' : 'atenc.'}
                              {val2 > 0 ? ` (${val2} canc.)` : ''}
                            </div>

                            {/* Barras */}
                            <div className="w-full flex items-end justify-center gap-0.5 h-full">
                              <div
                                style={{ height: `${Math.max(4, h1)}%` }}
                                className="w-full bg-primary-600 rounded-t-md transition-all hover:bg-primary-700"
                              ></div>
                              {tipoSeleccionado === 'NUMERO_ATENCIONES' && (
                                <div
                                  style={{ height: `${Math.max(4, h2)}%` }}
                                  className="w-full bg-rose-400 rounded-t-md transition-all hover:bg-rose-500"
                                ></div>
                              )}
                            </div>

                            {/* Etiqueta X */}
                            <span className="text-[10px] text-slate-400 truncate w-full text-center">
                              {point.periodo}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div className="h-56 flex items-center justify-center text-slate-400 text-xs">
                  Sin datos suficientes para graficar en este período.
                </div>
              )}
            </div>

            {/* Gráfico 2: Distribución Proporcional */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 mb-1">
                  <i className="bi bi-pie-chart-fill text-teal-600"></i>
                  Distribución Analítica
                </h3>
                <span className="text-xs text-slate-400">
                  {tipoSeleccionado === 'CONSUMO_MATERIALES'
                    ? 'Proporción por categoría de insumos'
                    : 'Distribución de atenciones por doctor'}
                </span>
              </div>

              {/* Barras de distribución porcentual */}
              <div className="space-y-4 my-auto py-4">
                {reporteData?.graficoDistribucion && reporteData.graficoDistribucion.length > 0 ? (
                  reporteData.graficoDistribucion.map((dist, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 truncate pr-2" title={dist.etiqueta}>
                          {dist.etiqueta}
                        </span>
                        <span className="font-extrabold text-slate-900 shrink-0">
                          {dist.cantidad} ({dist.porcentaje}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${dist.porcentaje}%`,
                            backgroundColor: dist.color || '#2563EB',
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 text-xs py-10">
                    No hay registros para calcular la distribución.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
                Métricas calculadas en tiempo real para el período seleccionado
              </div>
            </div>
          </div>

          {/* 5. Tabla Detallada de Resultados (DENTALCARE-74) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <i className="bi bi-table text-slate-600"></i>
                  Detalle Consolidado de Registros
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {tablaDetalleFiltrada.length} registros
                  </span>
                </h3>
              </div>

              {/* Búsqueda rápida en tabla */}
              <div className="relative w-full sm:w-64">
                <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Buscar en el reporte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingReporte ? (
                <div className="py-16 text-center text-slate-400">
                  <span className="inline-block animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mb-2"></span>
                  <p className="text-xs">Generando reporte analítico...</p>
                </div>
              ) : tablaDetalleFiltrada.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <i className="bi bi-inbox text-4xl text-slate-300 block mb-2"></i>
                  <p className="font-bold text-sm text-slate-700">No se encontraron registros</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    No existen movimientos o citas que coincidan con los filtros y período seleccionados.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Concepto Principal</th>
                      <th className="py-3 px-3">Detalle / Código</th>
                      <th className="py-3 px-3">Categoría</th>
                      <th className="py-3 px-3 text-center">Cantidad</th>
                      <th className="py-3 px-3">Paciente</th>
                      <th className="py-3 px-3">Profesional / Registro</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tablaDetalleFiltrada.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {row.fecha}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {row.concepto}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-500">
                          {row.subconcepto || '-'}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.categoria === 'MATERIAL'
                                ? 'bg-primary-50 text-primary-700'
                                : row.categoria === 'MEDICAMENTO'
                                ? 'bg-teal-50 text-teal-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {row.categoria}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-black text-slate-900">
                          {row.cantidad}
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 font-medium">
                          {row.persona1 || '-'}
                        </td>
                        <td className="py-3.5 px-3 text-slate-700">
                          {row.persona2 || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              row.estado === 'COMPLETADA' || row.estado === 'CONFIRMADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : row.estado === 'CANCELADA' || row.estado === 'NO_ASISTIO'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {row.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 2: REGLAS Y UMBRALES DE RENDIMIENTO (DENTALCARE-95)            */}
      {/* ===================================================================== */}
      {activeTab === 'rendimiento' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Cabecera y Barra de Acciones de Rendimiento */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <i className="bi bi-speedometer2 text-amber-500"></i>
                Umbrales de Control de Calidad y Rendimiento Operativo
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reglas automáticas que evalúan periódicamente la eficiencia clínica y despachan alertas directas a Gerencia.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleEvaluarAhora}
                disabled={evaluandoReglas}
                className="py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                title="Ejecutar motor de evaluación de indicadores y generar alertas activas"
              >
                {evaluandoReglas ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>Evaluando...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-lightning-charge-fill text-amber-400"></i>
                    <span>Evaluar Indicadores Ahora</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenCrearRegla}
                className="py-2.5 px-4 rounded-xl font-bold text-xs bg-primary-600 text-white hover:bg-primary-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <i className="bi bi-plus-lg"></i>
                <span>+ Nueva Regla de Alerta</span>
              </button>
            </div>
          </div>

          {/* Grid de Reglas de Alerta */}
          {loadingReglas ? (
            <div className="py-16 text-center text-slate-400">
              <span className="inline-block animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mb-2"></span>
              <p className="text-xs">Cargando reglas de rendimiento...</p>
            </div>
          ) : reglas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <i className="bi bi-sliders text-4xl text-slate-300 block mb-2"></i>
              <h3 className="font-extrabold text-base text-slate-800">No hay reglas de rendimiento configuradas</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Crea tu primera regla para monitorear cancelaciones, atenciones mínimas o stock crítico.
              </p>
              <button
                onClick={handleOpenCrearRegla}
                className="mt-4 py-2 px-4 rounded-xl font-bold text-xs bg-primary-600 text-white hover:bg-primary-700"
              >
                + Crear Regla Inicial
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reglas.map((r) => {
                const disparada = r.estadoAlertaDisparada && r.activo;

                return (
                  <div
                    key={r.id}
                    className={`rounded-2xl p-5 border transition-all ${
                      disparada
                        ? 'bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 border-rose-300 shadow-sm ring-1 ring-rose-200'
                        : r.activo
                        ? 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Cabecera de la Regla */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            disparada
                              ? 'bg-rose-600 animate-ping'
                              : r.activo
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                          }`}
                        ></span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            disparada
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : r.activo
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {disparada ? '¡Alerta Activa!' : r.activo ? 'En Rango Normal' : 'Inactiva'}
                        </span>
                      </div>

                      {/* Switch Activo / Inactivo */}
                      <button
                        type="button"
                        onClick={() => handleToggleRegla(r.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          r.activo ? 'bg-primary-600' : 'bg-slate-300'
                        }`}
                        title={r.activo ? 'Desactivar regla' : 'Activar regla'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                            r.activo ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">{r.nombreIndicador}</h3>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                      {r.descripcion || 'Sin descripción adicional.'}
                    </p>

                    {/* Caja de Métrica y Condición */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-3 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-[11px] text-slate-400">Condición Alerta:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {formatOperador(r.operadorComparacion)} {r.valorUmbral}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-[11px] text-slate-400">Último Valor Detectado:</span>
                        <span
                          className={`font-mono font-black ${
                            disparada ? 'text-rose-600 text-sm' : 'text-slate-800'
                          }`}
                        >
                          {r.ultimoValorDetectado !== null ? r.ultimoValorDetectado : 'Pendiente'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 text-[10px]">
                        <span>Frecuencia: {r.periodoEvaluacion}</span>
                        <span>
                          {r.ultimaEvaluacion
                            ? new Date(r.ultimaEvaluacion).toLocaleDateString()
                            : 'No evaluada'}
                        </span>
                      </div>
                    </div>

                    {/* Mensaje de Alerta Disparada */}
                    {disparada && r.mensajeUltimaAlerta && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] mb-3 leading-tight flex items-start gap-1.5">
                        <i className="bi bi-exclamation-triangle-fill text-rose-600 shrink-0 mt-0.5"></i>
                        <span>{r.mensajeUltimaAlerta}</span>
                      </div>
                    )}

                    {/* Acciones de la Regla */}
                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEditarRegla(r)}
                        className="py-1 px-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <i className="bi bi-pencil mr-1"></i>
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminarRegla(r.id, r.nombreIndicador)}
                        className="py-1 px-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <i className="bi bi-trash mr-1"></i>
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal Crear / Editar Regla de Rendimiento (DENTALCARE-95) */}
          {modalReglaOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                      <i className="bi bi-speedometer2 text-base"></i>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        {reglaEnEdicion ? 'Modificar Regla de Rendimiento' : 'Nueva Regla de Calidad y Umbral'}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Configuración de umbrales automáticos para supervisión gerencial
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalReglaOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  >
                    <i className="bi bi-x-lg text-sm"></i>
                  </button>
                </div>

                <form onSubmit={handleGuardarRegla} className="p-5 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nombre del Indicador:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Tasa Máxima de Cancelaciones Semanales"
                      value={formRegla.nombreIndicador}
                      onChange={(e) => setFormRegla({ ...formRegla, nombreIndicador: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Descripción / Justificación:</label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Alertar a gerencia si el porcentaje de citas canceladas o no asistidas supera el límite."
                      value={formRegla.descripcion}
                      onChange={(e) => setFormRegla({ ...formRegla, descripcion: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Métrica a Supervisar:</label>
                      <select
                        value={formRegla.tipoMetrica}
                        onChange={(e) => setFormRegla({ ...formRegla, tipoMetrica: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="MAX_CANCELACIONES_PORCENTAJE">Tasa Cancelaciones / Inasistencias (%)</option>
                        <option value="ATENCIONES_MINIMAS">Atenciones Mínimas Realizadas</option>
                        <option value="STOCK_CRITICO_CANTIDAD">Insumos Críticos Bajo Mínimo</option>
                        <option value="TIEMPO_ESPERA_PROMEDIO_MINS">Tiempo de Espera Promedio (min)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Frecuencia de Evaluación:</label>
                      <select
                        value={formRegla.periodoEvaluacion}
                        onChange={(e) => setFormRegla({ ...formRegla, periodoEvaluacion: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="SEMANAL">Semanal (Recomendado)</option>
                        <option value="DIARIO">Diario</option>
                        <option value="MENSUAL">Mensual</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Condición de Disparo:</label>
                      <select
                        value={formRegla.operadorComparacion}
                        onChange={(e) => setFormRegla({ ...formRegla, operadorComparacion: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="MAYOR_QUE">Mayor que (&gt;)</option>
                        <option value="MAYOR_IGUAL_QUE">Mayor o igual que (&ge;)</option>
                        <option value="MENOR_QUE">Menor que (&lt;)</option>
                        <option value="MENOR_IGUAL_QUE">Menor o igual que (&le;)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Valor Umbral Límite:</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={formRegla.valorUmbral}
                        onChange={(e) => setFormRegla({ ...formRegla, valorUmbral: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="activoSwitch"
                      checked={formRegla.activo}
                      onChange={(e) => setFormRegla({ ...formRegla, activo: e.target.checked })}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="activoSwitch" className="font-semibold text-slate-700 select-none">
                      Activar regla inmediatamente para evaluación automática
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setModalReglaOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white transition-all shadow-xs"
                    >
                      {reglaEnEdicion ? 'Actualizar Regla' : 'Crear Regla'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
