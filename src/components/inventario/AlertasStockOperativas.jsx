import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { stockAlertaService } from '../../services/stockAlerta.service';
import { inventarioService } from '../../services/inventario.service';
import { alertError, toastSuccess } from '../../utils/alert.utils';

export const AlertasStockOperativas = ({
  onGoToRegisterMaterial,
  onGoToRegisterMedicamento,
  onStockActualizado,
}) => {
  const [alertas, setAlertas] = useState([]);
  const [top3, setTop3] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  // Filtros y orden
  const [orden, setOrden] = useState('urgencia_desc');
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('TODOS'); // 'TODOS' | 'MATERIAL' | 'MEDICAMENTO'

  // Modal de Abastecimiento Rápido
  const [selectedItem, setSelectedItem] = useState(null);
  const [unidadesIngreso, setUnidadesIngreso] = useState(1);
  const [motivoAjuste, setMotivoAjuste] = useState('Abastecimiento de reposición por alerta de stock');
  const [guardandoAjuste, setGuardandoAjuste] = useState(false);

  // Carga de alertas y analíticas
  const cargarAlertas = useCallback(async () => {
    setLoading(true);
    try {
      const [resumenData, listaData] = await Promise.all([
        stockAlertaService.getResumenAlertas(),
        stockAlertaService.getAlertasStock(orden),
      ]);
      setResumen(resumenData);
      setTop3(resumenData?.top3 || []);
      setAlertas(listaData || []);
    } catch (err) {
      alertError(err.message || 'Error al cargar las alertas de inventario');
    } finally {
      setLoading(false);
    }
  }, [orden]);

  useEffect(() => {
    cargarAlertas();
  }, [cargarAlertas]);

  // Filtrado local por término de búsqueda y tipo
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

  // Exportar Excel
  const handleExportarExcel = async () => {
    setDownloadingExcel(true);
    try {
      await stockAlertaService.descargarReporteExcelAlertas();
      toastSuccess('Reporte de alertas generado y descargado con éxito.');
    } catch (err) {
      alertError(err.message || 'Error al exportar la hoja de cálculo de alertas.');
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Abrir Modal de Abastecimiento
  const handleOpenAbastecer = (item) => {
    setSelectedItem(item);
    // Sugerir por defecto el déficit faltante para superar el mínimo + 1
    const sugerido = Math.max(1, (item.deficit || 0) + 1);
    setUnidadesIngreso(sugerido);
    setMotivoAjuste(`Abastecimiento de reposición por alerta de stock (${item.codigo})`);
  };

  // Confirmar Abastecimiento
  const handleConfirmarAbastecimiento = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const cant = parseInt(unidadesIngreso, 10);
    if (isNaN(cant) || cant <= 0) {
      alertError('Ingrese una cantidad válida mayor a cero.');
      return;
    }

    setGuardandoAjuste(true);
    try {
      const nuevoStock = (selectedItem.stockActual || 0) + cant;
      const payload = {
        stockActual: nuevoStock,
        stockMinimo: selectedItem.stockMinimo,
        motivoAjuste: motivoAjuste.trim() || 'Abastecimiento de reposición',
      };

      if (selectedItem.tipo === 'MATERIAL') {
        await inventarioService.actualizarMaterial(selectedItem.id, payload);
      } else {
        await inventarioService.actualizarMedicamento(selectedItem.id, payload);
      }

      toastSuccess(
        `¡${selectedItem.nombre} abastecido con éxito (+${cant} uds)! Nuevo stock: ${nuevoStock}.`
      );

      setSelectedItem(null);
      // Recargar reactivamente: si nuevoStock > stockMinimo la alerta desaparece inmediatamente
      await cargarAlertas();
      if (onStockActualizado) onStockActualizado();
    } catch (err) {
      alertError(err.message || 'No se pudo completar el abastecimiento.');
    } finally {
      setGuardandoAjuste(false);
    }
  };

  // Helpers de color y estilo por urgencia
  const getBadgeUrgencia = (nivel) => {
    switch (nivel) {
      case 'CRITICO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            CRÍTICO (Agotado)
          </span>
        );
      case 'ALTA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            URGENCIA ALTA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            URGENCIA MEDIA
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* WIDGET TOP 3 INSUMOS MÁS CRÍTICOS (DENTALCARE-49)                     */}
      {/* ===================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              Top 3 Insumos Más Próximos a Agotarse
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                Prioridad Inmediata
              </span>
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Menor porcentaje de cobertura respecto al stock mínimo
          </span>
        </div>

        {top3.length === 0 && !loading ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center text-emerald-800">
            <i className="bi bi-shield-check text-3xl block mb-2 text-emerald-600"></i>
            <h3 className="font-bold text-base">¡Almacén en Estado Óptimo!</h3>
            <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
              No existen insumos por debajo del stock mínimo permitido en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((item, index) => {
              const cobertura = item.porcentajeCobertura || 0;
              const isCritico = item.stockActual <= 0 || item.nivelUrgencia === 'CRITICO';

              return (
                <div
                  key={`${item.tipo}-${item.id}`}
                  className={`relative rounded-2xl p-5 border transition-all hover:shadow-md ${
                    isCritico
                      ? 'bg-gradient-to-br from-rose-50/90 via-white to-rose-50/40 border-rose-200'
                      : 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-amber-200'
                  }`}
                >
                  {/* Badge Top 1, 2, 3 */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                        index === 0
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

                  {/* Barra de Cobertura */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Cobertura:</span>
                      <span className={`font-bold ${isCritico ? 'text-rose-600' : 'text-amber-600'}`}>
                        {cobertura.toFixed(1)}% ({item.stockActual} / {item.stockMinimo})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCritico ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, cobertura))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Déficit: <strong className="text-rose-600">-{item.deficit} uds</strong></span>
                      <span>{item.diasEstimadosAgotamiento} días est.</span>
                    </div>
                  </div>

                  {/* Botón de Abastecimiento Directo */}
                  <button
                    onClick={() => handleOpenAbastecer(item)}
                    className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <i className="bi bi-plus-circle-fill text-emerald-400"></i>
                    <span>Abastecer Inmediato</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* CONSOLA DE ALERTAS OPERATIVAS & BARRA DE ACCIONES                    */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Cabecera de la tabla */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <i className="bi bi-bell-fill text-amber-500"></i>
              Bitácora Operativa de Insumos Bajo Stock Mínimo
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {alertasFiltradas.length} insumos
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Materiales y medicamentos con existencia menor o igual al umbral mínimo de seguridad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Botón Exportar Excel (DENTALCARE-49) */}
            <button
              onClick={handleExportarExcel}
              disabled={downloadingExcel || alertas.length === 0}
              className="py-2 px-3.5 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Descargar listado consolidado en hoja de cálculo Excel (.xlsx)"
            >
              {downloadingExcel ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  <span>Generando Excel...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-file-earmark-excel-fill text-sm"></i>
                  <span>Descargar Reporte Excel</span>
                </>
              )}
            </button>

            {/* Enlace a registrar ingreso completo */}
            <button
              onClick={onGoToRegisterMaterial}
              className="py-2 px-3 rounded-xl font-semibold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <i className="bi bi-box-arrow-in-down"></i>
              <span>+ Nuevo Material</span>
            </button>
            <button
              onClick={onGoToRegisterMedicamento}
              className="py-2 px-3 rounded-xl font-semibold text-xs bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors flex items-center gap-1.5"
            >
              <i className="bi bi-capsule"></i>
              <span>+ Nuevo Medicamento</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Ordenamiento */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-sm">
            <i className="bi bi-search absolute left-3 top-2.5 text-slate-400"></i>
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por Tipo */}
            <div className="inline-flex rounded-xl bg-white border border-slate-200 p-0.5">
              {['TODOS', 'MATERIAL', 'MEDICAMENTO'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoFiltro(t)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-colors ${
                    tipoFiltro === t
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t === 'TODOS' ? 'Todos' : t === 'MATERIAL' ? 'Materiales' : 'Medicamentos'}
                </button>
              ))}
            </div>

            {/* Ordenamiento */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Ordenar por:</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="urgencia_desc">Mayor Urgencia / Menor Cobertura</option>
                <option value="deficit_desc">Mayor Déficit de Unidades</option>
                <option value="nombre_asc">Nombre Alfabético (A-Z)</option>
                <option value="cobertura_asc">Menor Porcentaje Cobertura</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Alertas */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <span className="inline-block animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mb-2"></span>
              <p className="text-xs">Cargando bitácora de stock crítico...</p>
            </div>
          ) : alertasFiltradas.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <i className="bi bi-check2-circle text-4xl text-emerald-500 block mb-2"></i>
              <p className="font-bold text-sm text-slate-700">No hay alertas que coincidan</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {search || tipoFiltro !== 'TODOS'
                  ? 'Prueba modificando los filtros de búsqueda.'
                  : 'Todos los materiales y medicamentos cuentan con stock adecuado.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Insumo</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3 text-center">Stock Actual</th>
                  <th className="py-3 px-3 text-center">Stock Mínimo</th>
                  <th className="py-3 px-3 text-center">Déficit</th>
                  <th className="py-3 px-3">Cobertura</th>
                  <th className="py-3 px-3 text-center">Nivel Urgencia</th>
                  <th className="py-3 px-3 text-center">Días Est.</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertasFiltradas.map((a) => {
                  const cobertura = a.porcentajeCobertura || 0;
                  const isCritico = a.stockActual <= 0 || a.nivelUrgencia === 'CRITICO';

                  return (
                    <tr
                      key={`${a.tipo}-${a.id}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Insumo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {a.codigo}
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 block text-xs">
                              {a.nombre}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {a.unidadMedida || '-'} {a.lote ? `| Lote: ${a.lote}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.tipo === 'MATERIAL'
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
                          className={`font-black text-xs px-2 py-0.5 rounded ${
                            a.stockActual <= 0
                              ? 'bg-rose-100 text-rose-700 font-bold'
                              : 'text-slate-800'
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
                        <span className="inline-block px-2 py-0.5 rounded font-black text-rose-700 bg-rose-50 text-xs">
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
                              className={`h-1.5 rounded-full ${
                                isCritico ? 'bg-rose-500' : 'bg-amber-500'
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

                      {/* Días Est. */}
                      <td className="py-3.5 px-3 text-center text-slate-600 font-semibold">
                        {a.diasEstimadosAgotamiento != null ? (
                          <span>{a.diasEstimadosAgotamiento} d</span>
                        ) : (
                          <span className="text-slate-400">N/D</span>
                        )}
                      </td>

                      {/* Acción */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenAbastecer(a)}
                          className="py-1.5 px-3 rounded-lg font-bold text-xs bg-primary-600 hover:bg-primary-700 text-white transition-all shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                          title="Registrar ingreso directo de stock"
                        >
                          <i className="bi bi-plus-lg"></i>
                          <span>Abastecer</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL DE ABASTECIMIENTO RÁPIDO (DENTALCARE-49)                         */}
      {/* ===================================================================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <i className="bi bi-box-arrow-in-down text-lg"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Abastecer Insumo Clínico
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    {selectedItem.codigo} • {selectedItem.tipo}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <i className="bi bi-x-lg text-sm"></i>
              </button>
            </div>

            <form onSubmit={handleConfirmarAbastecimiento} className="p-5 space-y-4">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Insumo:</span>
                <p className="text-sm font-bold text-slate-900">{selectedItem.nombre}</p>
                <p className="text-xs text-slate-500">
                  Presentación: {selectedItem.unidadMedida || 'Unidad estándar'}
                </p>
              </div>

              {/* Comparador de Stock Actual y Mínimo */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Actual</span>
                  <span className="text-sm font-bold text-slate-800">{selectedItem.stockActual}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mínimo</span>
                  <span className="text-sm font-bold text-slate-800">{selectedItem.stockMinimo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Déficit</span>
                  <span className="text-sm font-bold text-rose-600">-{selectedItem.deficit}</span>
                </div>
              </div>

              {/* Unidades a Ingresar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cantidad de Unidades a Ingresar:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={unidadesIngreso}
                    onChange={(e) => setUnidadesIngreso(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                    unidades
                  </span>
                </div>
              </div>

              {/* Vista Previa del Resultado */}
              {(() => {
                const cant = parseInt(unidadesIngreso, 10) || 0;
                const nuevo = (selectedItem.stockActual || 0) + cant;
                const superaMinimo = nuevo > selectedItem.stockMinimo;

                return (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      superaMinimo
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-0.5">
                      <span>Nuevo Stock Resultante:</span>
                      <span className="text-sm">{nuevo} uds</span>
                    </div>
                    <p className="text-[11px] mt-0.5">
                      {superaMinimo ? (
                        <>
                          <i className="bi bi-check-circle-fill text-emerald-600 mr-1"></i>
                          ¡Excelente! Al superar el stock mínimo ({selectedItem.stockMinimo}),
                          esta alerta <strong>desaparecerá automáticamente</strong> del listado.
                        </>
                      ) : (
                        <>
                          <i className="bi bi-exclamation-triangle-fill text-amber-600 mr-1"></i>
                          Aviso: Con {nuevo} unidades continuará en stock bajo (Mínimo: {selectedItem.stockMinimo}).
                        </>
                      )}
                    </p>
                  </div>
                );
              })()}

              {/* Motivo del Ajuste */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Nota del Abastecimiento:
                </label>
                <input
                  type="text"
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="Ej: Reposición de lote semanal"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoAjuste}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {guardandoAjuste ? (
                    <>
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      <span>Confirmar Abastecimiento</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
