import React, { useState } from 'react';
import { useInventario } from '../hooks/useInventario';
import InventarioTable from '../components/inventario/InventarioTable';
import MaterialForm from '../components/inventario/MaterialForm';
import MedicamentoIngresoForm from '../components/inventario/MedicamentoIngresoForm';
import ConsumosMensuales from '../components/inventario/ConsumosMensuales';

export const InventarioPage = () => {
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'registrar-material' | 'ingresar-medicamento' | 'consumos'

  const {
    items,
    loadingItems,
    searchTerm,
    setSearchTerm,
    tipoFilter,
    setTipoFilter,
    materiales,
    medicamentos,
    loadCatalogos,
    consumos,
    loadingConsumos,
    mesSeleccionado,
    setMesSeleccionado,
    registrarMaterial,
    actualizarMaterial,
    registrarIngresoMedicamento,
    actualizarMedicamento,
    registrarConsumo,
    modificarConsumo,
    confirmarConsumo,
  } = useInventario();

  const totalMateriales = items.filter((i) => i.tipo === 'MATERIAL').length;
  const totalMedicamentos = items.filter((i) => i.tipo === 'MEDICAMENTO').length;
  const stockCriticoCount = items.filter((i) => i.estadoAlerta === 'CRITICO' || i.estadoAlerta === 'BAJO').length;

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-primary-600"></span>
            Subsistema Clínico de Suministros (Sprint 4)
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Gestión de Inventario y Consumos
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Administración de materiales odontológicos, ingreso de medicamentos y trazabilidad de consumos.
          </p>
        </div>

        {/* Resumen de Métricas Rápidas */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-lg">
              <i className="bi bi-box-seam"></i>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Total Ítems</span>
              <span className="text-base font-extrabold text-slate-800">{items.length}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-xs flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
              stockCriticoCount > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Bajo / Crítico</span>
              <span className={`text-base font-extrabold ${stockCriticoCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {stockCriticoCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación del Módulo */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
          {/* Tab 1: Inventario General */}
          <button
            onClick={() => setActiveTab('items')}
            className={`py-3 px-4 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'items'
                ? 'border-primary-600 text-primary-700 bg-primary-50/30 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <i className="bi bi-box-seam text-base"></i>
            <span>Inventario General</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-600">
              {items.length}
            </span>
          </button>

          {/* Tab 2: Registrar Material */}
          <button
            onClick={() => setActiveTab('registrar-material')}
            className={`py-3 px-4 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'registrar-material'
                ? 'border-primary-600 text-primary-700 bg-primary-50/30 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <i className="bi bi-tools text-base"></i>
            <span>Registrar Material</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary-100 text-primary-700 font-mono">
              MT
            </span>
          </button>

          {/* Tab 3: Ingreso Medicamentos */}
          <button
            onClick={() => setActiveTab('ingresar-medicamento')}
            className={`py-3 px-4 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'ingresar-medicamento'
                ? 'border-dental-600 text-dental-700 bg-dental-50/30 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <i className="bi bi-capsule text-base"></i>
            <span>Ingreso de Medicamentos</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-100 text-teal-700 font-mono">
              MD
            </span>
          </button>

          {/* Tab 4: Consumos Mensuales */}
          <button
            onClick={() => setActiveTab('consumos')}
            className={`py-3 px-4 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'consumos'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <i className="bi bi-card-checklist text-base"></i>
            <span>Consumos Mensuales</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800">
              {consumos.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div className="pt-2">
        {activeTab === 'items' && (
          <InventarioTable
            items={items}
            loading={loadingItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            tipoFilter={tipoFilter}
            setTipoFilter={setTipoFilter}
            onActualizarMaterial={actualizarMaterial}
            onActualizarMedicamento={actualizarMedicamento}
            onGoToRegisterMaterial={() => setActiveTab('registrar-material')}
            onGoToRegisterMedicamento={() => setActiveTab('ingresar-medicamento')}
          />
        )}

        {activeTab === 'registrar-material' && (
          <MaterialForm
            onRegistrar={registrarMaterial}
            onRedirectToList={() => setActiveTab('items')}
          />
        )}

        {activeTab === 'ingresar-medicamento' && (
          <MedicamentoIngresoForm
            onRegistrarIngreso={registrarIngresoMedicamento}
            onRedirectToList={() => setActiveTab('items')}
          />
        )}

        {activeTab === 'consumos' && (
          <ConsumosMensuales
            consumos={consumos}
            loading={loadingConsumos}
            mesSeleccionado={mesSeleccionado}
            setMesSeleccionado={setMesSeleccionado}
            materiales={materiales}
            medicamentos={medicamentos}
            loadCatalogos={loadCatalogos}
            onModificarConsumo={modificarConsumo}
            onConfirmarConsumo={confirmarConsumo}
            onRegistrarConsumo={registrarConsumo}
          />
        )}
      </div>
    </div>
  );
};

export default InventarioPage;
