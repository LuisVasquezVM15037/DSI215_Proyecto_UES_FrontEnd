/**
 * Propósito:
 * Punto de entrada raíz (bootstrap) de la aplicación React. Se encarga de inicializar
 * el árbol de componentes del cliente sobre el elemento del DOM principal ('root'),
 * configurar el proveedor global de caché del servidor (QueryClientProvider de TanStack Query)
 * y encapsular la jerarquía bajo el modo estricto de React para detección de malas prácticas.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/main.jsx'. Representa la capa de arranque en la arquitectura Frontend.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde: 'index.html' mediante la etiqueta de script de tipo módulo.
 * - Consume:
 *   - '@tanstack/react-query' (QueryClient, QueryClientProvider para gestión de caché del servidor).
 *   - 'src/index.css' (estilos globales y Tailwind CSS).
 *   - 'bootstrap-icons/font/bootstrap-icons.css' (iconografía del sistema).
 *   - 'src/App.jsx' (componente orquestador de rutas y proveedores).
 *
 * Parámetros y Retornos:
 * - Parámetros: Ninguno directo; opera sobre el nodo `#root` provisto por el host DOM.
 * - Retornos: Ninguno (ejecuta el montaje de React en el DOM).
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import App from './App';

// Configuración de la instancia de cliente de TanStack Query con directivas para entorno clínico
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos de validez en caché antes de considerar los datos obsoletos
      refetchOnWindowFocus: false, // Evita refetches automáticos invasivos al alternar ventanas
      retry: 1, // Limita los reintentos automáticos ante errores de red
    },
  },
});

// Inicialización del Virtual DOM mediante la API de concurrencia de React
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);