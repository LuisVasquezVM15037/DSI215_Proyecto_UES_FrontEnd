import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';

export const ConsumosMensuales = ({
  consumos,
  loading,
  mesSeleccionado,
  setMesSeleccionado,
  materiales = [],
  medicamentos = [],
  loadCatalogos,
  onModificarConsumo,
  onConfirmarConsumo,
  onRegistrarConsumo,
}) => {
  // Estados para modal de modificación
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editingConsumo, setEditingConsumo] = useState(null);
  const [editCantidad, setEditCantidad] = useState(1);
  const [editNotas, setEditNotas] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Estados para modal de nuevo consumo
  const [modalNewOpen, setModalNewOpen] = useState(false);
  const [newTipo, setNewTipo] = useState('MATERIAL');
  const [newItemId, setNewItemId] = useState('');
  const [newCantidad, setNewCantidad] = useState(1);
  const [newNotas, setNewNotas] = useState('');
  const [savingNew, setSavingNew] = useState(false);

  // Confirmando ID
  const [confirmingId, setConfirmingId] = useState(null);

  // ── Modificar Consumo ─────────────────────────────────────────────────────
  const handleOpenEdit = (consumo) => {
    setEditingConsumo(consumo);
    setEditCantidad(consumo.cantidad);
    setEditNotas(consumo.notas || '');
    setModalEditOpen(true);
  };

  const handleCloseEdit = () => {
    setModalEditOpen(false);
    setEditingConsumo(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingConsumo) return;

    setSavingEdit(true);
    const res = await onModificarConsumo(editingConsumo.id, {
      cantidad: parseInt(editCantidad, 10),
      notas: editNotas,
    });
    setSavingEdit(false);

    if (res?.success) {
      handleCloseEdit();
    }
  };

  // ── Confirmar Consumo ─────────────────────────────────────────────────────
  const handleConfirmar = async (consumo) => {
    setConfirmingId(consumo.id);
    await onConfirmarConsumo(consumo.id);
    setConfirmingId(null);
  };

  // ── Nuevo Consumo ─────────────────────────────────────────────────────────
  const handleOpenNew = () => {
    if (loadCatalogos) {
      loadCatalogos();
    }
    setNewTipo('MATERIAL');
    setNewItemId(materiales[0]?.id ? String(materiales[0].id) : '');
    setNewCantidad(1);
    setNewNotas('');
    setModalNewOpen(true);
  };

  useEffect(() => {
    if (modalNewOpen) {
      const list = newTipo === 'MATERIAL' ? materiales : medicamentos;
      if (!newItemId || !list.some((item) => String(item.id) === String(newItemId))) {
        setNewItemId(list[0]?.id ? String(list[0].id) : '');
      }
    }
  }, [modalNewOpen, newTipo, materiales, medicamentos]);

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!newItemId) return;

    setSavingNew(true);
    const res = await onRegistrarConsumo({
      tipoItem: newTipo,
      itemId: parseInt(newItemId, 10),
      cantidad: parseInt(newCantidad, 10),
      mesConsumo: mesSeleccionado,
      notas: newNotas,
    });
    setSavingNew(false);

    if (res?.success) {
      setModalNewOpen(false);
    }
  };

  // Generador de opciones para los últimos 6 meses
  const generarOpcionesMeses = () => {
    const meses = [];
    const fecha = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(fecha.getFullYear(), fecha.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('es-SV', { month: 'long', year: 'numeric' });
      meses.push({ val, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return meses;
  };

  return (
    <div className="space-y-6">
      {/* Barra de Controles y Selector de Mes */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm">
              <i className="bi bi-calendar3"></i>
            </span>
            Trazabilidad y Consumos Mensuales
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Confirmación de materiales y fármacos utilizados en clínica (PBI-AsisDent-03 / DENTALCARE-47)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-500">Periodo:</span>
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              {generarOpcionesMeses().map((m) => (
                <option key={m.val} value={m.val}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={handleOpenNew}
            className="text-xs"
          >
            <i className="bi bi-plus-circle mr-1.5"></i>
            Registrar Consumo
          </Button>
        </div>
      </div>

      {/* Grid de Recuadros de Consumos */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
          <LoadingSpinner size="lg" />
          <p className="text-slate-400 text-sm">Cargando consumos del periodo...</p>
        </div>
      ) : consumos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-3xl">
            <i className="bi bi-card-checklist"></i>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-700">Sin consumos para el mes seleccionado</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No hay consumos registrados en este periodo ({mesSeleccionado}). Utiliza el botón "Registrar Consumo" para agregar uno.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={handleOpenNew}>
            <i className="bi bi-plus-lg mr-1.5"></i> Registrar Primer Consumo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consumos.map((consumo) => {
            const esPendiente = consumo.estado === 'PENDIENTE';
            const esConfirmado = consumo.estado === 'CONFIRMADO';
            const stockInsuficiente =
              esPendiente &&
              consumo.stockDisponibleItem !== null &&
              consumo.stockDisponibleItem < consumo.cantidad;

            return (
              <div
                key={consumo.id}
                className={`bg-white rounded-2xl p-5 shadow-xs border transition-all flex flex-col justify-between ${
                  esConfirmado
                    ? 'border-emerald-200/80 bg-emerald-50/10'
                    : stockInsuficiente
                    ? 'border-red-200 bg-red-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Cabecera del Recuadro */}
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <span className="text-xs font-mono font-bold text-slate-700 px-2 py-0.5 bg-slate-100 rounded">
                      {consumo.itemCodigo}
                    </span>

                    {/* Badge de Estado */}
                    {esConfirmado ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <i className="bi bi-check-circle-fill text-[11px]"></i> CONFIRMADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                        <i className="bi bi-hourglass-split text-[11px]"></i> PENDIENTE
                      </span>
                    )}
                  </div>

                  {/* Datos del Ítem */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      {consumo.tipoItem === 'MATERIAL' ? (
                        <>
                          <i className="bi bi-tools text-primary-500"></i> Material
                        </>
                      ) : (
                        <>
                          <i className="bi bi-capsule text-teal-600"></i> Medicamento
                        </>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">
                      {consumo.itemNombre}
                    </h4>
                  </div>

                  {/* Resumen de Cantidades y Cita */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2 text-xs mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Cantidad Registrada:</span>
                      <span className="font-extrabold text-sm text-slate-800">
                        {consumo.cantidad} unid.
                      </span>
                    </div>

                    {esPendiente && (
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                        <span className="text-slate-500">Stock Actual en Almacén:</span>
                        <span
                          className={`font-bold ${
                            stockInsuficiente ? 'text-red-600 font-extrabold' : 'text-slate-700'
                          }`}
                        >
                          {consumo.stockDisponibleItem ?? '—'} unid.
                        </span>
                      </div>
                    )}

                    {consumo.citaId && (
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                        <span className="text-slate-500">Cita Vinculada:</span>
                        <span className="font-semibold text-primary-600">
                          #CITA-{consumo.citaId}
                        </span>
                      </div>
                    )}

                    {consumo.pacienteNombre && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Paciente:</span>
                        <span className="text-slate-700 truncate max-w-[130px]">
                          {consumo.pacienteNombre}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notas */}
                  {consumo.notas && (
                    <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/60 mb-4">
                      "{consumo.notas}"
                    </p>
                  )}
                </div>

                {/* Pie del Recuadro: Botones */}
                <div className="pt-3 border-t border-slate-100">
                  {esPendiente ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEdit(consumo)}
                        className="flex-1 text-xs"
                      >
                        <i className="bi bi-pencil mr-1"></i> Modificar
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={confirmingId === consumo.id}
                        loading={confirmingId === consumo.id}
                        onClick={() => handleConfirmar(consumo)}
                        className="flex-1 text-xs !bg-emerald-600 hover:!bg-emerald-700"
                      >
                        <i className="bi bi-check2-circle mr-1"></i> Confirmar
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-[11px] text-emerald-700 font-medium py-1 bg-emerald-50 rounded-lg">
                      <i className="bi bi-shield-check mr-1"></i> Stock físico descontado correctamente
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Modificar Consumo */}
      <Modal
        isOpen={modalEditOpen}
        onClose={handleCloseEdit}
        title={
          editingConsumo
            ? `Modificar Consumo: ${editingConsumo.itemNombre} (${editingConsumo.itemCodigo})`
            : 'Modificar Consumo'
        }
      >
        {editingConsumo && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <p className="text-xs text-slate-500">
              Puedes corregir la cantidad registrada antes de confirmar y descontar el inventario físico.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cantidad Consumida <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={editCantidad}
                onChange={(e) => setEditCantidad(e.target.value)}
                required
                className="w-full text-base font-bold text-center rounded-xl px-3 py-2 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notas / Justificación del Ajuste
              </label>
              <textarea
                rows="2"
                value={editNotas}
                onChange={(e) => setEditNotas(e.target.value)}
                placeholder="Ej: Se requirió una jeringa adicional por fractura amplia..."
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCloseEdit}
                disabled={savingEdit}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={savingEdit}
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal para Nuevo Consumo */}
      <Modal
        isOpen={modalNewOpen}
        onClose={() => setModalNewOpen(false)}
        title="Registrar Consumo de Material o Fármaco"
      >
        <form onSubmit={handleSaveNew} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Insumo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewTipo('MATERIAL');
                  setNewItemId(materiales[0]?.id ? String(materiales[0].id) : '');
                }}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  newTipo === 'MATERIAL'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <i className="bi bi-tools mr-1"></i> Material
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewTipo('MEDICAMENTO');
                  setNewItemId(medicamentos[0]?.id ? String(medicamentos[0].id) : '');
                }}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  newTipo === 'MEDICAMENTO'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <i className="bi bi-capsule mr-1"></i> Medicamento
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Seleccionar Ítem del Catálogo <span className="text-red-500">*</span>
            </label>
            <select
              value={newItemId}
              onChange={(e) => setNewItemId(e.target.value)}
              required
              className="w-full text-xs rounded-xl px-3 py-2.5 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            >
              <option value="">-- Seleccionar --</option>
              {newTipo === 'MATERIAL'
                ? materiales.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.codigo} — {m.nombre} (Stock: {m.stockActual})
                    </option>
                  ))
                : medicamentos.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.codigo} — {med.nombre} (Stock: {med.stockActual})
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cantidad Utilizada <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={newCantidad}
              onChange={(e) => setNewCantidad(e.target.value)}
              required
              className="w-full text-sm font-bold rounded-xl px-3 py-2 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas Clínicas / Procedimiento
            </label>
            <textarea
              rows="2"
              value={newNotas}
              onChange={(e) => setNewNotas(e.target.value)}
              placeholder="Ej: Utilizado en obturación de pieza 16..."
              className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalNewOpen(false)}
              disabled={savingNew}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={savingNew}
            >
              Guardar Consumo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConsumosMensuales;
