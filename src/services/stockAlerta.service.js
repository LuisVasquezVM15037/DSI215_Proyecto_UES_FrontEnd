import { API_BASE_URL } from '../config/api.config';
import { apiFetch } from './api.service';

/**
 * Helper para descargar archivos binarios (Excel .xlsx) con JWT
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

  // Extraer nombre del header Content-Disposition si viene disponible
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
 * Servicio para Alertas de Stock Operativas (Asistente Dental) y Auditoría Gerencial
 * DENTALCARE-49 (PBI-AsisDent-05) & DENTALCARE-73 (PBI-Gerencia-03)
 */
export const stockAlertaService = {
  // === CONSOLA OPERATIVA (ASISTENTE DENTAL - DENTALCARE-49) ===
  getAlertasStock: async (orden = 'urgencia_desc') => {
    return apiFetch(`/inventario/alertas?orden=${encodeURIComponent(orden)}`);
  },

  getTop3Criticos: async () => {
    return apiFetch('/inventario/alertas/top3');
  },

  getResumenAlertas: async () => {
    return apiFetch('/inventario/alertas/resumen');
  },

  descargarReporteExcelAlertas: async () => {
    const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return descargarArchivo('/inventario/alertas/exportar-excel', `Alertas_Stock_DentalCare_${hoy}.xlsx`);
  },

  // === CONSOLA GERENCIAL (SOLO LECTURA / AUDITORÍA - DENTALCARE-73) ===
  getGerenciaStockCritico: async (orden = 'urgencia_desc') => {
    return apiFetch(`/gerencia/stock-critico?orden=${encodeURIComponent(orden)}`);
  },

  getGerenciaTop3: async () => {
    return apiFetch('/gerencia/stock-critico/top3');
  },

  getGerenciaResumen: async () => {
    return apiFetch('/gerencia/stock-critico/resumen');
  },

  descargarAuditoriaExcelGerencia: async () => {
    const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return descargarArchivo('/gerencia/stock-critico/exportar-excel', `Auditoria_Stock_Critico_DentalCare_${hoy}.xlsx`);
  },
};
