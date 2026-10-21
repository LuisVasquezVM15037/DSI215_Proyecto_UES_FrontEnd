import { apiFetch } from './api.service';

/**
 * Servicio para el subsistema de Inventario y Consumos Clínicos (Sprint 4)
 */
export const inventarioService = {
  // ── Materiales (DENTALCARE-26) ──────────────────────────────────────────
  getMateriales: async () => {
    return apiFetch('/inventario/materiales');
  },

  registrarMaterial: async (data) => {
    return apiFetch('/inventario/materiales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  actualizarMaterial: async (id, data) => {
    return apiFetch(`/inventario/materiales/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // ── Medicamentos (DENTALCARE-48) ────────────────────────────────────────
  getMedicamentos: async () => {
    return apiFetch('/inventario/medicamentos');
  },

  registrarIngresoMedicamento: async (data) => {
    return apiFetch('/inventario/medicamentos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  actualizarMedicamento: async (id, data) => {
    return apiFetch(`/inventario/medicamentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // ── Consulta Unificada de Inventario (DENTALCARE-46) ────────────────────
  getInventarioItems: async ({ search = '', tipo = 'TODOS' } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tipo && tipo !== 'TODOS') params.append('tipo', tipo);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/inventario/items${query}`);
  },

  // ── Consumos Mensuales y Trazabilidad (DENTALCARE-47) ───────────────────
  getConsumos: async (mes = '') => {
    const query = mes ? `?mes=${encodeURIComponent(mes)}` : '';
    return apiFetch(`/inventario/consumos${query}`);
  },

  registrarConsumo: async (data) => {
    return apiFetch('/inventario/consumos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  modificarConsumo: async (id, data) => {
    return apiFetch(`/inventario/consumos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  confirmarConsumo: async (id) => {
    return apiFetch(`/inventario/consumos/${id}/confirmar`, {
      method: 'POST',
    });
  },
};
