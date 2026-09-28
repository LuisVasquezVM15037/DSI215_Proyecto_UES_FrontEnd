# GUÍA DE COMMITS PASO A PASO: REFACTORIZACIÓN DENTALCARE ERP
## Ejecución Modular de Mejoras Arquitectónicas, Diseño y Estilos

> **Instrucciones de Uso:**  
> Este documento divide la refactorización integral del frontend en **commits funcionales, atómicos e independientes**, incluyendo la **fundación completa de estilos (Tailwind CSS, Google Fonts y Bootstrap Icons)**.  
> Para solicitarle a un agente o asistente de IA que aplique cualquier paso de manera aislada, solo debes copiar y enviar el comando:  
> **`"generame los cambios para el commit numero X"`** (donde X es el número del commit del 0 al 10).

---

## 📋 ÍNDICE MAESTRO DE COMMITS

| Commit | Tipo / Mensaje Convencional | Funcionalidad / Propósito | Archivos Afectados |
| :---: | :--- | :--- | :--- |
| **0** | `style(design-system): configurar tema Tailwind extendido, Google Fonts y Bootstrap Icons` | Paleta clínica (dental, surface), fuentes Outfit/Jakarta, scrollbar y Bootstrap Icons | `index.html`, `tailwind.config.js`, `src/index.css`, `package.json`, `src/main.jsx` |
| **1** | `chore(deps): instalar dependencias base para estado de servidor y formularios` | Agrega TanStack Query, React Hook Form, Zod y Resolvers | `package.json`, `package-lock.json` |
| **2** | `feat(cache): configurar QueryClientProvider global en el bootstrap` | Configura políticas de caché para entorno clínico y envuelve la raíz | `src/main.jsx` |
| **3** | `feat(resilience): implementar ErrorBoundary institucional para fallos en render` | Captura excepciones globales de React y despliega pantalla de rescate con Tailwind | `src/components/ErrorBoundary.jsx`, `src/App.jsx` |
| **4** | `feat(auth): centralizar gestión reactiva de sesión con AuthContext e interceptor 401` | SSoT de sesión con storage sync, useAuth y desacoplamiento de 401 | `src/services/api.service.js`, `src/context/AuthContext.jsx`, `src/components/ProtectedRoute.jsx`, `src/components/Layout.jsx`, `src/views/LoginPage.jsx`, `src/App.jsx` |
| **5** | `refactor(hooks): migrar estado de servidor a TanStack Query en Dashboard y Agenda` | Caché en citas del día, agenda, sincronización de vencidas y overrideData | `src/hooks/useHomeDashboard.js`, `src/hooks/useAgenda.js` |
| **6** | `refactor(hooks): migrar estado de servidor a TanStack Query en Pacientes y Usuarios` | Búsqueda con AbortSignal, catálogos en caché, mutaciones e invalidaciones | `src/hooks/usePatientManagement.js`, `src/hooks/useUserManagement.js` |
| **7** | `refactor(hooks): migrar flujo clínico y consultas médicas a TanStack Query` | Caché y mutaciones en índice de consultas, cita activa, odontograma y recetas | `src/hooks/useConsultaIndex.js`, `src/hooks/useConsultaData.js`, `src/hooks/useTratamientos.js`, `src/hooks/usePrescripcion.js` |
| **8** | `feat(forms): implementar React Hook Form y Zod en Citas y Reprogramación` | Esquemas Zod, cálculo automático de horario fin y feedback visual de error con Tailwind | `src/components/AppointmentForm.jsx`, `src/components/ReprogramModal.jsx`, `src/views/AppointmentPage.jsx` |
| **9** | `feat(forms): implementar validación declarativa con Zod en Expediente de Pacientes` | Esquema Zod para DUI, teléfono y contacto, conectado a useForm con anillos rojos de error | `src/views/PatientManagementPage.jsx` |
| **10** | `feat(forms): implementar formulario dinámico reactivo con Zod en Gestión de Usuarios` | Validación condicional (JVPO/especialidad requeridos para odontólogos) con `schemaRef` | `src/views/UserManagementPage.jsx` |

---

## 🛠️ ESPECIFICACIÓN DETALLADA POR COMMIT

---

### Commit 0: `style(design-system): configurar tema Tailwind extendido, Google Fonts y Bootstrap Icons`

* **Prompt para el Agente:**
  > `"generame los cambios para el commit numero 0"`

* **Propósito y Justificación:**
  Establecer la identidad visual institucional de la clínica odontológica. Configura las paletas extendidas de Tailwind (`primary` azul clínico, `dental` menta/teal y `surface` neutro de fondo), sombras institucionales (`shadow-card`, `shadow-glass`), animaciones (`fade-in`, `scale-in`), fuentes web de Google Fonts (*Plus Jakarta Sans* y *Outfit*), scrollbar personalizada y la librería de iconografía oficial `bootstrap-icons`.

* **Archivos Involucrados:**
  - `index.html` (MODIFICAR)
  - `tailwind.config.js` (MODIFICAR)
  - `src/index.css` (MODIFICAR)
  - `package.json` (MODIFICAR)
  - `src/main.jsx` (MODIFICAR)

* **Instrucciones de Código:**

  **1. En `package.json`:**
  Asegurar la dependencia de iconos:
  ```json
  "dependencies": {
    "bootstrap-icons": "^1.13.1"
  }
  ```
  *(o ejecutar `npm install bootstrap-icons@^1.13.1`)*.

  **2. En `index.html`:**
  Agregar las fuentes *Outfit* y *Plus Jakarta Sans* desde Google Fonts:
  ```html
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/tooth2.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>DentalCare — ERP Clínico Odontológico</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>
  ```

  **3. En `tailwind.config.js`:**
  Configurar el tema médico extendido:
  ```javascript
  /** @type {import('tailwindcss').Config} */
  export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        colors: {
          // Primario — Azul clínico (confianza + tecnología)
          primary: {
            50:  '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          // Dental — Teal / Menta (salud + higiene)
          dental: {
            50:  '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
          },
          surface: {
            DEFAULT: '#f8fafc',
            card:    '#ffffff',
            subtle:  '#f1f5f9',
            border:  '#e2e8f0',
          },
        },
        fontFamily: {
          sans:    ['"Plus Jakarta Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
          display: ['"Outfit"', '"Syne"', 'sans-serif'],
        },
        animation: {
          'fade-in':      'fadeIn 0.25s ease-out',
          'fade-in-up':   'fadeInUp 0.35s ease-out',
          'fade-in-down': 'fadeInDown 0.3s ease-out',
          'scale-in':     'scaleIn 0.2s ease-out',
          'spin-slow':    'spin 2s linear infinite',
        },
        keyframes: {
          fadeIn: {
            '0%':   { opacity: '0' },
            '100%': { opacity: '1' },
          },
          fadeInUp: {
            '0%':   { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          fadeInDown: {
            '0%':   { opacity: '0', transform: 'translateY(-10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          scaleIn: {
            '0%':   { opacity: '0', transform: 'scale(0.96)' },
            '100%': { opacity: '1', transform: 'scale(1)' },
          },
        },
        boxShadow: {
          card:         '0 1px 3px 0 rgb(15 23 42 / 0.05), 0 1px 2px -1px rgb(15 23 42 / 0.05)',
          'card-md':    '0 4px 8px -1px rgb(15 23 42 / 0.06), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
          'card-hover': '0 12px 24px -4px rgb(15 23 42 / 0.08), 0 4px 6px -2px rgb(15 23 42 / 0.04)',
          glass:        '0 8px 32px 0 rgba(15, 23, 42, 0.06)',
        },
        borderRadius: {
          '2xl': '1rem',
          '3xl': '1.5rem',
        },
      },
    },
    plugins: [],
  };
  ```

  **4. En `src/index.css`:**
  Definir capas base, fondo predeterminado y scrollbar personalizada:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    html {
      font-family: 'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      scroll-behavior: smooth;
    }

    body {
      @apply bg-surface text-slate-800;
    }

    /* Scrollbar sutil personalizado */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      @apply bg-slate-200 rounded-full hover:bg-slate-300 transition-colors;
    }
  }

  @layer utilities {
    .text-balance {
      text-wrap: balance;
    }
  }
  ```

  **5. En `src/main.jsx`:**
  Importar el paquete de estilos de Bootstrap Icons:
  ```javascript
  import 'bootstrap-icons/font/bootstrap-icons.css';
  ```

* **Verificación:**
  Ejecutar `npm run build` para asegurar que Tailwind procesa todas las clases extendidas y que la hoja de estilos de Bootstrap Icons se empaqueta correctamente.

---

### Commit 1: `chore(deps): instalar dependencias base para estado de servidor y formularios`

* **Prompt para el Agente:**
  > `"generame los cambios para el commit numero 1"`

* **Propósito y Justificación:**
  Incorporar las librerías estándar del ecosistema React enterprise para desacoplar el estado del servidor (`@tanstack/react-query`) y gestionar formularios con validación basada en esquemas declarativos (`react-hook-form`, `zod`, `@hookform/resolvers`).

* **Archivos Involucrados:**
  - `package.json` (MODIFICAR)
  - `package-lock.json` (MODIFICAR)

* **Instrucciones de Código:**
  Ejecutar en la terminal raíz del proyecto:
  ```bash
  npm install @tanstack/react-query@^5.103.1 react-hook-form@^7.88.0 zod@^4.6.5 @hookform/resolvers@^5.9.1
  ```

* **Verificación:**
  Asegurarse de que las 4 librerías figuren en la sección `"dependencies"` de `package.json` y que `npm ls @tanstack/react-query react-hook-form zod @hookform/resolvers` no arroje errores de dependencias rotas.

---

### Commit 2: `feat(cache): configurar QueryClientProvider global en el bootstrap`

* **Prompt para el Agente:**
  > `"generame los cambios para el commit numero 2"`

* **Propósito y Justificación:**
  Configurar el cliente central de TanStack Query adaptado a la dinámica de una clínica dental: tiempo de frescura de 2 minutos (`staleTime`) para evitar peticiones repetitivas, desactivar `refetchOnWindowFocus` para que el odontólogo no sufra recargas molestas al consultar otra ventana, y limitar reintentos a 1 ante fallos de red.

* **Archivos Involucrados:**
  - `src/main.jsx` (MODIFICAR)

* **Instrucciones de Código:**
  Modificar `src/main.jsx` para instanciar `QueryClient` y envolver `<App />` con `<QueryClientProvider>`:

  ```jsx
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
  ```

* **Verificación:**
  Ejecutar `npm run build` para comprobar que Vite compila con éxito.

---

### Commit 3: `feat(resilience): implementar ErrorBoundary institucional para fallos en render`

* **Prompt para el Agente:**
  > `"generame los cambios para el commit numero 3"`

* **Propósito y Justificación:**
  Implementar un límite de captura de errores (Error Boundary) basado en componentes de clase de React. Si ocurre un fallo en cualquier componente visual o de renderizado (por ejemplo, datos inesperados en el odontograma), se evita la caída total hacia una "pantalla blanca", ofreciendo una interfaz institucional de contingencia estilizada con Tailwind (`bg-white rounded-3xl border border-slate-200/80 shadow-card`) e iconografía Bootstrap (`bi-shield-exclamation`).

* **Archivos Involucrados:**
  - `src/components/ErrorBoundary.jsx` (CREAR)
  - `src/App.jsx` (MODIFICAR)

* **Instrucciones de Código:**
  
  **1. Crear `src/components/ErrorBoundary.jsx`:**
  ```jsx
  import React, { Component } from 'react';
  import Button from './ui/Button';

  class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = {
        hasError: false,
        error: null,
        errorInfo: null,
      };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      this.setState({ errorInfo });
      console.error('[DentalCare ErrorBoundary] Excepción no controlada:', error, errorInfo);
    }

    handleReset = () => {
      this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleReload = () => {
      window.location.reload();
    };

    handleGoHome = () => {
      window.location.href = '/dashboard';
    };

    render() {
      const { hasError, error, errorInfo } = this.state;
      const { children, fallback } = this.props;

      if (hasError) {
        if (fallback) return fallback;

        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 select-none animate-fade-in">
            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-card p-8 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
                <i className="bi bi-shield-exclamation text-3xl" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-red-600 tracking-wider uppercase bg-red-50 px-2.5 py-0.5 rounded-full">
                  Incidencia del Sistema
                </span>
                <h2 className="text-xl font-extrabold text-slate-800 font-display pt-1">
                  Interrupción en el Módulo
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ha ocurrido una excepción inesperada durante la ejecución visual.
                  Los datos clínicos del expediente están protegidos en el servidor.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-left max-h-28 overflow-y-auto">
                  <p className="text-[11px] font-mono font-semibold text-red-700 truncate">
                    {error.toString()}
                  </p>
                  {errorInfo?.componentStack && (
                    <p className="text-[10px] font-mono text-slate-400 mt-1 whitespace-pre-wrap leading-tight">
                      {errorInfo.componentStack.slice(0, 200)}...
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={this.handleReset}
                  icon={<i className="bi bi-arrow-clockwise" />}
                >
                  Reintentar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={this.handleReload}
                  icon={<i className="bi bi-arrow-repeat" />}
                >
                  Recargar
                </Button>
              </div>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="text-xs text-slate-400 hover:text-primary-600 font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <i className="bi bi-house text-[11px]" />
                Volver al Panel Principal
              </button>
            </div>
          </div>
        );
      }

      return children;
    }
  }

  export default ErrorBoundary;
  ```

  **2. Actualizar `src/App.jsx`:**
  Importar `ErrorBoundary` y envolver el retorno principal de `App`:
  ```jsx
  import ErrorBoundary from './components/ErrorBoundary';
  // ...
  export default function App() {
    return (
      <ErrorBoundary>
        <BrowserRouter>
          {/* ... resto de providers y rutas ... */}
        </BrowserRouter>
      </ErrorBoundary>
    );
  }
  ```

* **Verificación:**
  Ejecutar `npm run build`.

---

### Commit 4: `feat(auth): centralizar gestión reactiva de sesión con AuthContext e interceptor 401`

* **Prompt para el Agente:**
  > `"generame los cambios para el commit numero 4"`

* **Propósito y Justificación:**
  Eliminar consultas y modificaciones dispersas a `localStorage`. Convertir `AuthContext` en la Fuente Única de Verdad (SSoT) con sincronización multi-pestaña y verificación de caducidad del JWT. Además, implementar el patrón de callback en `api.service.js` (`setUnauthorizedHandler`) para que los errores HTTP 401 del backend ejecuten un `logout()` reactivo en React antes de redirigir al login.

* **Archivos Involucrados:**
  - `src/services/api.service.js` (MODIFICAR)
  - `src/context/AuthContext.jsx` (MODIFICAR)
  - `src/components/ProtectedRoute.jsx` (MODIFICAR)
  - `src/components/Layout.jsx` (MODIFICAR)
  - `src/views/LoginPage.jsx` (MODIFICAR)
  - `src/App.jsx` (MODIFICAR)

* **Instrucciones de Código:**

  **1. En `src/services/api.service.js`:**
  Exportar `setUnauthorizedHandler` y delegar en él la respuesta a errores 401:
  ```javascript
  let _onUnauthorized = () => {
    localStorage.clear();
    window.location.replace('/');
  };

  export const setUnauthorizedHandler = (handler) => {
    _onUnauthorized = handler;
  };

  export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      _onUnauthorized();
      return null;
    }

    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return null;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Error HTTP ${response.status}`);
    }
    return data;
  };
  ```

  **2. En `src/context/AuthContext.jsx`:**
  Reescribir el archivo implementando el estado reactivo con hooks y registro de interceptor:
  ```jsx
  import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
  import {
    getUserName,
    getUserRole,
    getToken,
    clearSession,
    saveSession,
    loginService,
  } from '../services/auth.service';
  import { setUnauthorizedHandler } from '../services/api.service';
  import { normalizeRole } from '../constants/roles.constants';

  const AuthContext = createContext(null);

  const checkTokenValidity = (tok) => {
    if (!tok) return false;
    try {
      const payload = JSON.parse(atob(tok.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  export const AuthProvider = ({ children }) => {
    const [token, setToken]       = useState(() => getToken());
    const [userName, setUserName] = useState(() => getUserName());
    const [userRole, setUserRole] = useState(() => normalizeRole(getUserRole()));

    const isAuthenticated = useMemo(() => {
      return !!token && checkTokenValidity(token);
    }, [token]);

    const login = useCallback(async (identifier, password) => {
      const data = await loginService(identifier, password);
      saveSession(data);
      setToken(data.token);
      setUserName(data.nombreCompleto || 'Usuario');
      setUserRole(normalizeRole(data.rol));
      return data;
    }, []);

    const logout = useCallback(() => {
      clearSession();
      setToken(null);
      setUserName('');
      setUserRole('');
    }, []);

    useEffect(() => {
      const handleStorageChange = () => {
        const currentTok = getToken();
        if (!currentTok || !checkTokenValidity(currentTok)) {
          logout();
        } else {
          setToken(currentTok);
          setUserName(getUserName());
          setUserRole(normalizeRole(getUserRole()));
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, [logout]);

    useEffect(() => {
      setUnauthorizedHandler(() => {
        logout();
        window.location.replace('/');
      });
    }, [logout]);

    const value = useMemo(() => ({
      token,
      userName,
      userRole,
      isAuthenticated,
      login,
      logout,
    }), [token, userName, userRole, isAuthenticated, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };

  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
    }
    return context;
  };

  export const useAuthContext = useAuth;
  ```

  **3. En `src/components/ProtectedRoute.jsx`:**
  Utilizar `useAuth()` para validar sesión y roles RBAC:
  ```jsx
  import React from 'react';
  import { Navigate } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext';

  const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, userRole, logout } = useAuth();

    if (!isAuthenticated) {
      logout();
      return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(String(userRole).toLowerCase())) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  export default ProtectedRoute;
  ```

  **4. En `src/components/Layout.jsx`:**
  Reemplazar las llamadas directas a `getUserName()`, `getUserRole()` y `clearSession()` por:
  ```jsx
  import { useAuth } from '../context/AuthContext';
  // ...
  const { userName, userRole, logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  ```

  **5. En `src/views/LoginPage.jsx`:**
  Reemplazar `loginService` y `saveSession` por:
  ```jsx
  import { useAuth } from '../context/AuthContext';
  // ...
  const { login } = useAuth();
  // En handleLogin:
  await login(identifier.trim(), password);
  navigate('/dashboard');
  ```

  **6. En `src/App.jsx`:**
  Envolver el árbol con `<AuthProvider>` justo dentro de `<ErrorBoundary>`:
  ```jsx
  <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        {/* ... */}
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
  ```

* **Verificación:**
  Ejecutar `npm run build`.

---

### Commit 5: `refactor(hooks): migrar estado de servidor a TanStack Query en Dashboard y Agenda`

* **Prompt para el Agente:**
  > `"generame los cambios para el commit numero 5"`

* **Propósito y Justificación:**
  Migrar la consulta de datos del Dashboard y del módulo de Agenda hacia TanStack Query. Las citas del día se calculan con base en la caché `['citas']`, y las operaciones de cancelación, reprogramación y check-in invalidan la clave `['citas']` automáticamente. Además, `handleSubmit` en `useAgenda.js` se amplía con el parámetro `overrideData` para recibir datos validados externamente por formularios.

* **Archivos Involucrados:**
  - `src/hooks/useHomeDashboard.js` (MODIFICAR)
  - `src/hooks/useAgenda.js` (MODIFICAR)

* **Instrucciones de Código:**

  **1. En `src/hooks/useHomeDashboard.js`:**
  ```javascript
  import { useMemo } from 'react';
  import { useQuery } from '@tanstack/react-query';
  import { getCitas } from '../services/cita.service';
  import { normalizarFecha, getHoyLocal } from '../utils/cita.utils';
  import { useAuth } from '../context/AuthContext';

  export const useHomeDashboard = () => {
    const { userName } = useAuth();
    const hoy = useMemo(() => getHoyLocal(), []);

    const today = new Date().toLocaleDateString('es-SV', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

    const { data: todasCitas = [], isLoading: loading } = useQuery({
      queryKey: ['citas'],
      queryFn: getCitas,
    });

    const citasHoy = useMemo(() => {
      return (todasCitas ?? []).filter(c => normalizarFecha(c.fechaCita) === hoy);
    }, [todasCitas, hoy]);

    const stats = useMemo(() => ({
      total:         citasHoy.length,
      completadas:   citasHoy.filter(c => c.estadoCita === 'COMPLETADA' || c.estadoCita === 'FINALIZADA').length,
      reprogramadas: citasHoy.filter(c => c.estadoCita === 'REPROGRAMADA').length,
      pendientes:    citasHoy.filter(c => ['PROGRAMADA', 'PENDIENTE'].includes(c.estadoCita)).length,
    }), [citasHoy]);

    return {
      citasHoy: citasHoy.slice(0, 4),
      loading,
      userName,
      today,
      stats,
    };
  };
  ```

  **2. En `src/hooks/useAgenda.js`:**
  - Sustituir los efectos de carga por `useQuery` para `['citas']`, `['pacientes']` y `['odontologos']`.
  - Reemplazar llamadas a `refetchCitas()` por `queryClient.invalidateQueries({ queryKey: ['citas'] })`.
  - Enriquecer `handleSubmit`:
    ```javascript
    const handleSubmit = async (onSuccess, overrideData) => {
      setMutating(true);
      try {
        const base = overrideData || formData;
        const payload = {
          ...base,
          idPaciente:   parseInt(base.idPaciente, 10),
          idOdontologo: parseInt(base.idOdontologo, 10),
        };
        if (isEditing) {
          await updateCita(selectedCita.idCitas, payload);
          alertSuccess('Cita actualizada', 'Los cambios fueron guardados correctamente.');
        } else {
          const data = await createCita(payload);
          alertSuccess('Cita registrada', `Cita para ${data?.nombreCompletoPaciente} registrada correctamente.`);
        }
        await queryClient.invalidateQueries({ queryKey: ['citas'] });
        onSuccess?.();
      } catch (err) {
        alertError(err.message);
      } finally {
        setMutating(false);
      }
    };
    ```

* **Verificación:**
  Ejecutar `npm run build`.

---

### Commit 6: `refactor(hooks): migrar estado de servidor a TanStack Query en Pacientes y Usuarios`

* **Prompt para el Agente:**
  > `"generame los cambios para el commit numero 6"`

* **Propósito y Justificación:**
  Migrar los hooks administrativos (`usePatientManagement` y `useUserManagement`) a TanStack Query. Se incluye soporte nativo de cancelación de solicitudes con `AbortSignal` al buscar pacientes con debouncing y la invalidación automática de colecciones al crear, actualizar o desactivar registros.

* **Archivos Involucrados:**
  - `src/hooks/usePatientManagement.js` (MODIFICAR)
  - `src/hooks/useUserManagement.js` (MODIFICAR)

* **Instrucciones de Código:**

  **1. En `src/hooks/usePatientManagement.js`:**
  - Configurar `useQuery` con clave `['pacientes', debouncedSearch.trim()]` y cancelación HTTP:
    ```javascript
    const { data: patients = [], isLoading: loadingQuery } = useQuery({
      queryKey: ['pacientes', debouncedSearch.trim()],
      queryFn: async ({ signal }) => {
        const term = debouncedSearch.trim();
        return term ? buscarPacientes(term, { signal }) : getPacientes({ signal });
      },
    });
    ```
  - Soportar `overrideData` en `handleCreate` y `handleUpdate`, e invalidar `['pacientes']`.

  **2. En `src/hooks/useUserManagement.js`:**
  - Configurar `useQuery` para `['usuarios']` y `['roles']`.
  - Soportar `overrideData` en `handleCreate` y `handleUpdate`, e invalidar `['usuarios']`.

* **Verificación:**
  Ejecutar `npm run build`.

---

### Commit 7: `refactor(hooks): migrar flujo clínico y consultas médicas a TanStack Query`

* **Prompt para el Agente:**
  > `"generame los cambios para el commit numero 7"`

* **Propósito y Justificación:**
  Migrar la consulta médica interactiva: índice de consultas (`useConsultaIndex`), datos clínicos y evaluación diagnóstica (`useConsultaData`), odontograma y planes de tratamiento (`useTratamientos`) y recetario (`usePrescripcion`). Incluye mutaciones optimistas en cambios de estado dental y mutaciones concurrentes (`Promise.all`) para el guardado por lotes de piezas del odontograma.

* **Archivos Involucrados:**
  - `src/hooks/useConsultaIndex.js` (MODIFICAR)
  - `src/hooks/useConsultaData.js` (MODIFICAR)
  - `src/hooks/useTratamientos.js` (MODIFICAR)
  - `src/hooks/usePrescripcion.js` (MODIFICAR)

* **Instrucciones de Código:**
  - **`useConsultaIndex.js`:** Consultas `useQuery(['citas'])` y `['pacientes']`. Mutaciones para check-in con invalidación.
  - **`useConsultaData.js`:** Consultas `['cita', citaId]`, `['evaluacion', citaId]` y `['hallazgos', evaluacionId]`. Mutación con actualización optimista `onMutate` para `updateEstadoHallazgo` y mutación `finalizarCitaMutation`.
  - **`useTratamientos.js`:** Consulta `['tratamientos']`. Mutación de guardado en lote de hallazgos mediante `Promise.all(items.map(item => createHallazgo(item)))` e invalidación de `['hallazgos', evaluacionId]`.
  - **`usePrescripcion.js`:** Consultas `['medicamentos']` y `['prescripcion', citaId]`. Mutación de prescripción e invalidación conjunta de cita y prescripción.

* **Verificación:**
  Ejecutar `npm run build`.

---

### Commit 8: `feat(forms): implementar React Hook Form y Zod en Citas y Reprogramación`

* **Prompt para el Agente:**
  > `"generame los cambios para el commit numero 8"`

* **Propósito y Justificación:**
  Reemplazar validaciones manuales en la gestión de citas por esquemas formales de Zod integrados con React Hook Form. Garantizar que la hora de fin sea 1 hora mayor por defecto y que en reprogramaciones se valide estrictamente que `horaFinCita > horaInicioCita`. Pasar los datos validados directamente al hook orquestador y activar los anillos rojos (`focus:ring-red-500/10`) y mensajes con iconos de Bootstrap (`bi-exclamation-circle`) en los inputs mediante la prop `error`.

* **Archivos Involucrados:**
  - `src/components/AppointmentForm.jsx` (MODIFICAR)
  - `src/components/ReprogramModal.jsx` (MODIFICAR)
  - `src/views/AppointmentPage.jsx` (MODIFICAR)

* **Instrucciones de Código:**

  **1. En `src/components/AppointmentForm.jsx`:**
  - Crear esquema `appointmentSchema` con Zod:
    ```javascript
    const appointmentSchema = z.object({
      idPaciente: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== null, {
        message: 'Debe seleccionar un paciente de la lista.',
      }),
      idOdontologo: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== null, {
        message: 'Debe seleccionar un especialista odontólogo.',
      }),
      fechaCita: z.string().min(1, 'La fecha de la cita es obligatoria.'),
      horaInicioCita: z.string().min(1, 'La hora de inicio es obligatoria.'),
      horaFinCita: z.string().min(1, 'La hora de finalización es obligatoria.'),
      estadoCita: z.string().optional(),
    });
    ```
  - Envolver el formulario con `<form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 animate-fade-in">` y propagar `error={errors[campo]?.message}` a los inputs `Input` y `Select`.

  **2. En `src/components/ReprogramModal.jsx`:**
  - Implementar `reprogramSchema` con `.refine()`:
    ```javascript
    const reprogramSchema = z.object({
      fechaCita: z.string().min(1, 'La nueva fecha es obligatoria.'),
      horaInicioCita: z.string().min(1, 'La hora de inicio es obligatoria.'),
      horaFinCita: z.string().min(1, 'La hora de finalización es obligatoria.'),
    }).refine(data => {
      if (data.horaInicioCita && data.horaFinCita) {
        return new Date(data.horaFinCita) > new Date(data.horaInicioCita);
      }
      return true;
    }, {
      message: 'La hora de finalización debe ser posterior a la hora de inicio.',
      path: ['horaFinCita'],
    });
    ```

  **3. En `src/views/AppointmentPage.jsx`:**
  - Conectar el submit enviando `validatedData`:
    ```jsx
    onSubmit={(validatedData) => agenda.handleSubmit(handleFormSuccess, validatedData)}
    ```

* **Verificación:**
  Ejecutar `npm run build`.

---

### Commit 9: `feat(forms): implementar validación declarativa con Zod en Expediente de Pacientes`

* **Prompt para el Agente:**
  > `"generame los cambios para el commit numero 9"`

* **Propósito y Justificación:**
  Asegurar la integridad de datos en el alta y actualización de expedientes clínicos de pacientes. Validación estricta de nombres, apellidos, formato de DUI y correo electrónico opcionalmente válido. Los campos con errores muestran el borde rojo y texto de advertencia con icono Bootstrap mediante el componente `Input` y `Textarea`.

* **Archivos Involucrados:**
  - `src/views/PatientManagementPage.jsx` (MODIFICAR)

* **Instrucciones de Código:**
  - Definir `patientSchema` con Zod:
    ```javascript
    const patientSchema = z.object({
      nombrePaciente: z.string().trim().min(1, 'El nombre del paciente es obligatorio.'),
      apellidoPaciente: z.string().trim().min(1, 'El apellido del paciente es obligatorio.'),
      numeroIdentidadPaciente: z.string().trim().min(1, 'El DUI o documento de identidad es obligatorio.'),
      fechaNacimientoPaciente: z.string().optional().nullable(),
      telefonoPaciente: z.string().optional().nullable(),
      emailPaciente: z
        .string()
        .optional()
        .nullable()
        .refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
          message: 'El correo electrónico no tiene un formato válido.',
        }),
      contactoEmergencia: z.string().optional().nullable(),
      alergias: z.string().optional().nullable(),
    });
    ```
  - Conectar `useForm({ resolver: zodResolver(patientSchema), defaultValues: formData })`.
  - Sincronizar en `useEffect` con `reset(formData)`.
  - Envolver con `<form onSubmit={handleFormSubmit(onSave)} noValidate className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 md:p-8 space-y-5">` donde `onSave = (validData) => handleSubmit(validData)`.

* **Verificación:**
  Ejecutar `npm run build`.

---

### Commit 10: `feat(forms): implementar formulario dinámico reactivo con Zod en Gestión de Usuarios`

* **Prompt para el Agente:**
  > `"generame los cambios para el commit numero 10"`

* **Propósito y Justificación:**
  Implementar validación condicional y dinámica para el módulo de personal/usuarios: si el rol asignado es Odontólogo, los campos `especialidadOdontologo` y `jvpoId` (licencia médica) son estrictamente obligatorios. La contraseña es opcional al editar pero obligatoria al crear. Para evitar discrepancias y fallos de orden de hooks, se utiliza el patrón `schemaRef` con `React.useRef` y reactividad basada en `watch('idRol')`.

* **Archivos Involucrados:**
  - `src/views/UserManagementPage.jsx` (MODIFICAR)

* **Instrucciones de Código:**
  - Generador dinámico de esquema Zod:
    ```javascript
    const getUserSchema = (isEditing, esOdontologo) =>
      z.object({
        nombreUsuario: z.string().trim().min(1, 'El nombre es obligatorio.'),
        apellidoUsuario: z.string().trim().min(1, 'El apellido es obligatorio.'),
        usernameUsuario: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres.'),
        emailUsuario: z.string().trim().email('El correo electrónico no tiene un formato válido.'),
        password: isEditing
          ? z.string().optional()
          : z.string().min(6, 'La contraseña debe contener al menos 6 caracteres.'),
        idRol: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== null, {
          message: 'Debe seleccionar un rol asignado.',
        }),
        especialidadOdontologo: esOdontologo
          ? z.string().trim().min(1, 'La especialidad es obligatoria para odontólogos.')
          : z.string().optional().nullable(),
        jvpoId: esOdontologo
          ? z.string().trim().min(1, 'El número de JVPO es obligatorio para odontólogos.')
          : z.string().optional().nullable(),
        esActivo: z.boolean().optional(),
      });
    ```
  - Instanciación de `useForm` con referencia mutable `schemaRef`:
    ```jsx
    const schemaRef = React.useRef(getUserSchema(isEditing, false));

    const {
      handleSubmit: handleFormSubmit,
      setValue,
      watch,
      reset,
      formState: { errors },
    } = useForm({
      resolver: (...args) => zodResolver(schemaRef.current)(...args),
      defaultValues: formData,
    });

    const watchedRolId = watch('idRol');
    const rolSeleccionado = roles.find(r => String(r.idRol) === String(watchedRolId));
    const esOdontologo = rolSeleccionado?.nombreRol === 'ODONTOLOGO';

    schemaRef.current = useMemo(
      () => getUserSchema(isEditing, esOdontologo),
      [isEditing, esOdontologo],
    );

    useEffect(() => {
      reset(formData);
    }, [formData, reset]);
    ```
  - Enviar mediante `onSave(validData) => handleSubmit(validData)`.

* **Verificación:**
  Ejecutar `npm run build` para certificar que todos los módulos compilan sin advertencias ni errores.
