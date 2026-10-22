import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';

export const InventarioTable = ({
  items,
  loading,
  searchTerm,
  setSearchTerm,
  tipoFilter,
  setTipoFilter,
  onActualizarMaterial,
  onActualizarMedicamento,
  onGoToRegisterMaterial,
  onGoToRegisterMedicamento,
}) => {
  const [editingItem, setEditingItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStockActual, setEditStockActual] = useState(0);
  const [editStockMinimo, setEditStockMinimo] = useState(5);
  const [editMotivo, setEditMotivo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditStockActual(item.stockActual);
    setEditStockMinimo(item.stockMinimo);
    setEditMotivo('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    let res;
    if (editingItem.tipo === 'MATERIAL') {
      res = await onActualizarMaterial(editingItem.id, {
        stockActual: parseInt(editStockActual, 10),
        stockMinimo: parseInt(editStockMinimo, 10),
        motivoAjuste: editMotivo || 'Ajuste de inventario físico',
      });
    } else {
      res = await onActualizarMedicamento(editingItem.id, {
        stockActual: parseInt(editStockActual, 10),
        stockMinimo: parseInt(editStockMinimo, 10),
        motivoAjuste: editMotivo || 'Ajuste de inventario físico',
      });
    }
    setSaving(false);

    if (res?.success) {
      handleCloseModal();
    }
  };

  const renderBadgeAlerta = (estado) => {
    switch (estado) {
      case 'CRITICO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            Agotado / Crítico
          </span>
        );
      case 'BAJO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Stock Bajo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Óptimo
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Input de Búsqueda */}
        <div className="relative flex-1">
          <i className="bi bi-search absolute left-3.5 top-3 text-slate-400 text-sm"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código (ej: MT78, MD45) o nombre..."
            className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>

        {/* Selector de Tipo */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto text-xs font-medium">
          <button
            onClick={() => setTipoFilter('TODOS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tipoFilter === 'TODOS'
                ? 'bg-white text-slate-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setTipoFilter('MATERIAL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              tipoFilter === 'MATERIAL'
                ? 'bg-white text-primary-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <i className="bi bi-tools text-[11px]"></i>
            Materiales
          </button>
          <button
            onClick={() => setTipoFilter('MEDICAMENTO')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              tipoFilter === 'MEDICAMENTO'
                ? 'bg-white text-dental-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <i className="bi bi-capsule text-[11px]"></i>
            Medicamentos
          </button>
        </div>

        {/* Accesos rápidos */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onGoToRegisterMaterial}
            className="text-xs"
          >
            <i className="bi bi-plus-lg mr-1.5"></i>
            + Material
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={onGoToRegisterMedicamento}
            className="text-xs !bg-dental-600 hover:!bg-dental-700"
          >
            <i className="bi bi-box-arrow-in-down mr-1.5"></i>
            + Ingreso Med
          </Button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-slate-400 text-sm">Consultando catálogo y existencias...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
              <i className="bi bi-inbox"></i>
            </div>
            <h4 className="text-slate-700 font-bold text-base">No se encontraron ítems en inventario</h4>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              {searchTerm
                ? `No hay coincidencias para el término "${searchTerm}". Intenta con otro código o nombre.`
                : 'Aún no se han registrado insumos o medicamentos en el catálogo.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4">Nombre / Especificación</th>
                  <th className="py-3.5 px-4 text-center">Stock Actual</th>
                  <th className="py-3.5 px-4 text-center">Stock Mínimo</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr
                    key={`${item.tipo}-${item.id}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Código */}
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          item.tipo === 'MATERIAL'
                            ? 'bg-primary-50 text-primary-700'
                            : 'bg-teal-50 text-teal-700'
                        }`}
                      >
                        {item.codigo}
                      </span>
                    </td>

                    {/* Tipo */}
                    <td className="py-3.5 px-4 text-xs">
                      {item.tipo === 'MATERIAL' ? (
                        <span className="text-slate-600 flex items-center gap-1">
                          <i className="bi bi-tools text-primary-500"></i> Material
                        </span>
                      ) : (
                        <span className="text-slate-600 flex items-center gap-1">
                          <i className="bi bi-capsule text-teal-600"></i> Fármaco
                        </span>
                      )}
                    </td>

                    {/* Nombre y presentación */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.nombre}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{item.presentacionOUnidad}</span>
                        {item.descripcionOLote && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs">{item.descripcionOLote}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Stock Actual */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-base font-extrabold ${
                          item.stockActual <= 0
                            ? 'text-red-600'
                            : item.stockActual <= item.stockMinimo
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {item.stockActual}
                      </span>
                    </td>

                    {/* Stock Mínimo */}
                    <td className="py-3.5 px-4 text-center text-xs text-slate-500 font-medium">
                      {item.stockMinimo}
                    </td>

                    {/* Alerta de estado */}
                    <td className="py-3.5 px-4">
                      {renderBadgeAlerta(item.estadoAlerta)}
                    </td>

                    {/* Botón de acción */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50/70 hover:bg-primary-100 rounded-lg transition-all"
                        title="Ajustar existencias físicas"
                      >
                        <i className="bi bi-pencil-square"></i>
                        Ajustar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Ajuste de Stock */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
          editingItem
            ? `Ajustar Stock: ${editingItem.nombre} (${editingItem.codigo})`
            : 'Ajuste de Stock'
        }
      >
        {editingItem && (
          <form onSubmit={handleSaveStock} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Tipo de Ítem:</span>
                <strong className="text-slate-800">{editingItem.tipo}</strong>
              </div>
              <div className="flex justify-between">
                <span>Presentación / Unidad:</span>
                <strong className="text-slate-800">{editingItem.presentacionOUnidad}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nuevo Stock Físico <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={editStockActual}
                  onChange={(e) => setEditStockActual(e.target.value)}
                  required
                  className="w-full text-base font-bold text-center rounded-xl px-3 py-2 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stock Mínimo Alerta
                </label>
                <input
                  type="number"
                  min="0"
                  value={editStockMinimo}
                  onChange={(e) => setEditStockMinimo(e.target.value)}
                  className="w-full text-base font-bold text-center rounded-xl px-3 py-2 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo del Ajuste (Opcional)
              </label>
              <input
                type="text"
                value={editMotivo}
                onChange={(e) => setEditMotivo(e.target.value)}
                placeholder="Ej: Conteo físico quincenal, merma, rotura..."
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCloseModal}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={saving}
              >
                <i className="bi bi-check-lg mr-1.5"></i>
                Actualizar Stock
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default InventarioTable;
