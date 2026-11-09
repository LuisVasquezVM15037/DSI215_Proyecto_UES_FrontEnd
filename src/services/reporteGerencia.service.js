import { API_BASE_URL } from '../config/api.config';
import { apiFetch } from './api.service';

/**
 * Helper para descargar reportes binarios (Excel .xlsx) con autenticación JWT
 */
const descargarArchivo = async (endpoint, nombreArchivoFallback) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error(`Error en descarga de reporte: HTTP ${response.status}`);
  }

  let filename = nombreArchivoFallback;
  const disposition = response.headers.get('Content-Disposition');
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename=["']?([^"';]+)["']?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Servicio para Inteligencia de Negocios, Reportes y Rendimiento Clínico (Rol Gerente)
 * DENTALCARE-70, DENTALCARE-72, DENTALCARE-74, DENTALCARE-95
 */
export const reporteGerenciaService = {
  // === 1. CATÁLOGO Y CONSULTA DE REPORTES (DENTALCARE-70 & DENTALCARE-72 & DENTALCARE-74) ===
  getTiposReportes: async () => {
    return apiFetch('/gerencia/reportes/tipos');
  },

  getDatosReporte: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    return apiFetch(`/gerencia/reportes/datos?${query.toString()}`);
  },

  descargarReporteExcel: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `Reporte_${params.tipo || 'GERENCIA'}_${hoy}.xlsx`;
    return descargarArchivo(`/gerencia/reportes/exportar?${query.toString()}`, filename);
  },

  // === 2. REGLAS Y UMBRALES DE RENDIMIENTO CLÍNICO (DENTALCARE-95) ===
  getReglasRendimiento: async () => {
    return apiFetch('/gerencia/alertas-rendimiento');
  },

  crearReglaRendimiento: async (data) => {
    return apiFetch('/gerencia/alertas-rendimiento', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  actualizarReglaRendimiento: async (id, data) => {
    return apiFetch(`/gerencia/alertas-rendimiento/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  toggleReglaRendimiento: async (id) => {
    return apiFetch(`/gerencia/alertas-rendimiento/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  evaluarReglasManualmente: async () => {
    return apiFetch('/gerencia/alertas-rendimiento/evaluar', {
      method: 'POST',
    });
  },

  eliminarReglaRendimiento: async (id) => {
    return apiFetch(`/gerencia/alertas-rendimiento/${id}`, {
      method: 'DELETE',
    });
  },
};
