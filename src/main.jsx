/**
 * Propósito:
 * Punto de entrada raíz (bootstrap) de la aplicación React. Se encarga de inicializar
 * el árbol de componentes del cliente sobre el elemento del DOM principal ('root') y
 * encapsular la jerarquía bajo el modo estricto de React para detección de malas prácticas.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/main.jsx'. Representa la capa de arranque en la arquitectura Frontend.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde: 'index.html' mediante la etiqueta de script de tipo módulo.
 * - Consume:
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
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import App from './App';

// Inicialización del Virtual DOM mediante la API de concurrencia de React 18
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);