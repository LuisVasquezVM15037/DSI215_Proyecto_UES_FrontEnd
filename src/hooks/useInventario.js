import { useState, useEffect, useCallback } from 'react';
import { inventarioService } from '../services/inventario.service';
import { useDebounce } from './useDebounce';
import { alertSuccess, alertError, toastSuccess } from '../utils/alert.utils';

export const useInventario = () => {
  // ── Estados para consulta unificada de inventario ──────────────────────────
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('TODOS'); // 'TODOS' | 'MATERIAL' | 'MEDICAMENTO'

  const debouncedSearch = useDebounce(searchTerm, 300);

  // ── Estados para catálogos específicos ────────────────────────────────────
  const [materiales, setMateriales] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  // ── Estados para consumos mensuales ───────────────────────────────────────
  const obtenerMesActual = () => {
    const d = new Date();
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    return `${anio}-${mes}`;
  };

  const [mesSeleccionado, setMesSeleccionado] = useState(obtenerMesActual());
  const [consumos, setConsumos] = useState([]);
  const [loadingConsumos, setLoadingConsumos] = useState(false);

  // ── Cargas de datos ───────────────────────────────────────────────────────

  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const data = await inventarioService.getInventarioItems({
        search: debouncedSearch,
        tipo: tipoFilter,
      });
      setItems(data ?? []);
    } catch (err) {
      alertError(err.message || 'Error al cargar inventario general.');
    } finally {
      setLoadingItems(false);
    }
  }, [debouncedSearch, tipoFilter]);

  const loadCatalogos = useCallback(async () => {
    setLoadingCatalogos(true);
    try {
      const [mats, meds] = await Promise.all([
        inventarioService.getMateriales(),
        inventarioService.getMedicamentos(),
      ]);
      setMateriales(mats ?? []);
      setMedicamentos(meds ?? []);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
    } finally {
      setLoadingCatalogos(false);
    }
  }, []);

  const loadConsumos = useCallback(async (mes) => {
    setLoadingConsumos(true);
    try {
      const data = await inventarioService.getConsumos(mes);
      setConsumos(data ?? []);
    } catch (err) {
      alertError(err.message || 'Error al cargar consumos mensuales.');
    } finally {
      setLoadingConsumos(false);
    }
  }, []);

  // Efectos de carga reactiva
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    loadConsumos(mesSeleccionado);
  }, [loadConsumos, mesSeleccionado]);

  // ── Operaciones de Materiales (DENTALCARE-26) ──────────────────────────────

  const registrarMaterial = async (data) => {
    try {
      const resp = await inventarioService.registrarMaterial(data);
      toastSuccess('Material registrado con éxito');
      await Promise.all([loadItems(), loadCatalogos()]);
      return { success: true, data: resp };
    } catch (err) {
      alertError(err.message || 'No se pudo registrar el material.', 'Error en registro');
      return { success: false, error: err.message };
    }
  };

  const actualizarMaterial = async (id, data) => {
    try {
      const resp = await inventarioService.actualizarMaterial(id, data);
      toastSuccess('Stock de material actualizado');
      await Promise.all([loadItems(), loadCatalogos()]);
      return { success: true, data: resp };
    } catch (err) {
      alertError(err.message || 'Error al actualizar material.');
      return { success: false, error: err.message };
    }
  };

  // ── Operaciones de Medicamentos (DENTALCARE-48) ────────────────────────────

  const registrarIngresoMedicamento = async (data) => {
    try {
      const resp = await inventarioService.registrarIngresoMedicamento(data);
      toastSuccess('Ingreso de medicamento registrado con éxito');
      await Promise.all([loadItems(), loadCatalogos()]);
      return { success: true, data: resp };
    } catch (err) {
      alertError(err.message || 'No se pudo registrar el ingreso del medicamento.', 'Error en ingreso');
      return { success: false, error: err.message };
    }
  };

  const actualizarMedicamento = async (id, data) => {
    try {
      const resp = await inventarioService.actualizarMedicamento(id, data);
      toastSuccess('Stock de medicamento actualizado');
      await Promise.all([loadItems(), loadCatalogos()]);
      return { success: true, data: resp };
    } catch (err) {
      alertError(err.message || 'Error al actualizar medicamento.');
      return { success: false, error: err.message };
    }
  };

  // ── Operaciones de Consumos (DENTALCARE-47) ────────────────────────────────

  const registrarConsumo = async (data) => {
    try {
      const resp = await inventarioService.registrarConsumo(data);
      toastSuccess('Consumo registrado correctamente');
      await loadConsumos(mesSeleccionado);
      return { success: true, data: resp };
    } catch (err) {
      alertError(err.message || 'Error al registrar consumo.');
      return { success: false, error: err.message };
    }
  };

  const modificarConsumo = async (id, data) => {
    try {
      const resp = await inventarioService.modificarConsumo(id, data);
      toastSuccess('Consumo modificado exitosamente');
      await loadConsumos(mesSeleccionado);
      return { success: true, data: resp };
    } catch (err) {
      alertError(err.message || 'Error al modificar consumo.');
      return { success: false, error: err.message };
    }
  };

  const confirmarConsumo = async (id) => {
    try {
      const resp = await inventarioService.confirmarConsumo(id);
      alertSuccess('Consumo Confirmado', 'El inventario ha sido descontado exitosamente.');
      await Promise.all([loadConsumos(mesSeleccionado), loadItems()]);
      return { success: true, data: resp };
    } catch (err) {
      alertError(err.message || 'No se pudo confirmar el consumo.', 'Stock Insuficiente o Error');
      return { success: false, error: err.message };
    }
  };

  return {
    // Items generales
    items,
    loadingItems,
    searchTerm,
    setSearchTerm,
    tipoFilter,
    setTipoFilter,
    loadItems,

    // Catálogos
    materiales,
    medicamentos,
    loadingCatalogos,
    loadCatalogos,

    // Consumos
    consumos,
    loadingConsumos,
    mesSeleccionado,
    setMesSeleccionado,
    loadConsumos,

    // Acciones
    registrarMaterial,
    actualizarMaterial,
    registrarIngresoMedicamento,
    actualizarMedicamento,
    registrarConsumo,
    modificarConsumo,
    confirmarConsumo,
  };
};
