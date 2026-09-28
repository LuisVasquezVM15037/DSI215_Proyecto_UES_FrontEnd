# GUÍA MAESTRA DE REFACTORIZACIÓN ARQUITECTÓNICA FRONTEND
## DentalCare ERP — Transición a Estándar Enterprise

> **Propósito del Documento:**  
> Este documento contiene el conjunto exacto, secuencial y consolidado de **cambios funcionales** implementados en el proyecto DentalCare ERP para elevar su arquitectura a nivel profesional. Otro agente de software o desarrollador senior puede seguir esta guía paso a paso para reproducir idénticamente el estado final del código a partir del código base original.
>
> Se omiten deliberadamente estados transitorios, pruebas fallidas o ajustes intermedios revertidos.

---

## ÍNDICE DE INTERVENCIONES

1. [Fase 0: Dependencias de Producción](#fase-0-dependencias-de-producción)
2. [Fase 1: Infraestructura Base, Resiliencia y Manejo de Sesión](#fase-1-infraestructura-base-resiliencia-y-manejo-de-sesión)
   - 1.1 `src/main.jsx` (TanStack Query Provider)
   - 1.2 `src/components/ErrorBoundary.jsx` (Nuevo componente de captura de fallos)
   - 1.3 `src/services/api.service.js` (Interceptor HTTP 401 desacoplado)
   - 1.4 `src/context/AuthContext.jsx` (Fuente única de verdad reactiva de sesión)
   - 1.5 `src/components/ProtectedRoute.jsx` (Guard basado en useAuth)
   - 1.6 `src/components/Layout.jsx` (Consumo reactivo de identidad y logout)
   - 1.7 `src/views/LoginPage.jsx` (Autenticación delegada a useAuth)
   - 1.8 `src/App.jsx` (Composición del árbol institucional de providers)
3. [Fase 2: Gestión de Estado de Servidor con TanStack Query en Hooks](#fase-2-gestión-de-estado-de-servidor-con-tanstack-query-en-hooks)
   - 2.1 `src/hooks/useHomeDashboard.js`
   - 2.2 `src/hooks/useAgenda.js`
   - 2.3 `src/hooks/usePatientManagement.js`
   - 2.4 `src/hooks/useUserManagement.js`
   - 2.5 `src/hooks/useConsultaIndex.js`
   - 2.6 `src/hooks/useConsultaData.js`
   - 2.7 `src/hooks/useTratamientos.js`
   - 2.8 `src/hooks/usePrescripcion.js`
4. [Fase 3: Validación Declarativa con React Hook Form y Zod](#fase-3-validación-declarativa-con-react-hook-form-y-zod)
   - 3.1 `src/components/AppointmentForm.jsx`
   - 3.2 `src/components/ReprogramModal.jsx`
   - 3.3 `src/views/AppointmentPage.jsx`
   - 3.4 `src/views/PatientManagementPage.jsx`
   - 3.5 `src/views/UserManagementPage.jsx`
5. [Fase 4: Verificación y Compilación](#fase-4-verificación-y-compilación)

---

## FASE 0: Dependencias de Producción

Instalar las librerías necesarias para el manejo de estado remoto y validación de esquemas:

```bash
npm install @tanstack/react-query@^5.103.1 react-hook-form@^7.88.0 zod@^4.6.5 @hookform/resolvers@^5.9.1
```

---

## FASE 1: Infraestructura Base, Resiliencia y Manejo de Sesión

### 1.1 `src/main.jsx`
**Objetivo:** Inicializar la instancia global de `QueryClient` con directivas institucionales para entorno clínico (evitar refetches invasivos mientras el odontólogo trabaja) y proveer el contexto en la raíz.

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import App from './App';

// Configuración de TanStack Query para entorno clínico
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos de validez en caché antes de considerar datos obsoletos
      refetchOnWindowFocus: false, // Evita refetches invasivos al alternar pestañas
      retry: 1, // Límite de 1 reintento ante fallos de red
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

### 1.2 `src/components/ErrorBoundary.jsx` (ARCHIVO NUEVO)
**Objetivo:** Prevenir pantallas blancas en producción atrapando excepciones en el ciclo de vida de React y desplegando una interfaz institucional de rescate con opciones de reintento o recarga.

Crear el archivo `src/components/ErrorBoundary.jsx`:

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

---

### 1.3 `src/services/api.service.js`
**Objetivo:** Desacoplar el manejo del código de respuesta HTTP 401 para no forzar recargas directas en `localStorage`. Se introduce el patrón callback mediante `setUnauthorizedHandler`.

**Cambios clave:**
1. Agregar variable `_onUnauthorized` con fallback predeterminado.
2. Exportar `setUnauthorizedHandler(handler)`.
3. Invocar `_onUnauthorized()` ante respuestas `401`.

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

---

### 1.4 `src/context/AuthContext.jsx`
**Objetivo:** Transformar el contexto en una **Fuente Única de Verdad (SSoT)** reactiva. Maneja en estado local de React (`token`, `userName`, `userRole`), sincronización multi-pestaña mediante evento `storage`, validación criptográfica básica de expiración del JWT (`exp`), y registra el handler de 401 en `api.service`.

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

  // Sincronización multi-pestaña
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

  // Registro del interceptor HTTP 401 reactivo
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

---

### 1.5 `src/components/ProtectedRoute.jsx`
**Objetivo:** Consumir reactivamente `useAuth()` para validar autenticación y roles RBAC en lugar de hacer consultas imperativas a `localStorage`.

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

---

### 1.6 `src/components/Layout.jsx`
**Objetivo:** Consumir `useAuth()` en lugar del servicio estático `auth.service`.

Reemplazar:
```jsx
// ANTES
import { getUserName, getUserRole, clearSession } from '../services/auth.service';
// ...
const userName = getUserName();
const userRole = getUserRole();
const handleLogout = () => { clearSession(); navigate('/'); };
```
Por:
```jsx
// DESPUÉS
import { useAuth } from '../context/AuthContext';
// ...
const { userName, userRole, logout } = useAuth();
const handleLogout = () => {
  logout();
  navigate('/');
};
```

---

### 1.7 `src/views/LoginPage.jsx`
**Objetivo:** Despachar la autenticación mediante `login()` de `useAuth()`, evitando escribir manualmente en `localStorage` desde la vista.

Reemplazar:
```jsx
// ANTES
import { loginService, saveSession } from '../services/auth.service';
// ...
const data = await loginService(identifier.trim(), password);
saveSession(data);
navigate('/dashboard');
```
Por:
```jsx
// DESPUÉS
import { useAuth } from '../context/AuthContext';
// ...
const { login } = useAuth();
// ...
await login(identifier.trim(), password);
navigate('/dashboard');
```

---

### 1.8 `src/App.jsx`
**Objetivo:** Envolver la aplicación con `<ErrorBoundary>` y `<AuthProvider>` preservando la jerarquía con `<BrowserRouter>`.

```jsx
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Rutas públicas y privadas sin alterar */}
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

---

## FASE 2: Gestión de Estado de Servidor con TanStack Query en Hooks

### 2.1 `src/hooks/useHomeDashboard.js`
- Reemplazar el `useEffect` y `useState` que consultaban `getCitas()` manualmente por `useQuery({ queryKey: ['citas'], queryFn: getCitas })`.
- Consumir `userName` directamente desde `useAuth()`.

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

---

### 2.2 `src/hooks/useAgenda.js`
- Migrar consultas de `citas`, `pacientes` y `odontologos` a `useQuery`.
- Invalidar `['citas']` con `queryClient.invalidateQueries({ queryKey: ['citas'] })` en cancelaciones, reprogramaciones y check-ins.
- **Soporte de datos externos validados:** Modificar `handleSubmit` para que acepte `(onSuccess, overrideData)`. Si `overrideData` viene provisto, se prioriza sobre el estado interno `formData`.

```javascript
export const useAgenda = (date) => {
  const queryClient = useQueryClient();
  const [selectedCita, setSelectedCita] = useState(null);
  const [isEditing,    setIsEditing]    = useState(false);
  const [formData,     setFormData]     = useState(FORM_INICIAL);
  const [mutating,     setMutating]     = useState(false);

  const { data: appointments = [], isLoading: loadingCitas } = useQuery({
    queryKey: ['citas'],
    queryFn: async () => {
      const data = await getCitas();
      return sincronizarCitasVencidas(data ?? [], cambiarEstado);
    },
  });

  const { data: pacientes = [], isLoading: loadingPacientes } = useQuery({
    queryKey: ['pacientes'],
    queryFn: getPacientes,
  });

  const { data: odontologos = [], isLoading: loadingOdontologos } = useQuery({
    queryKey: ['odontologos'],
    queryFn: getOdontologos,
  });

  const loading = loadingCitas || loadingPacientes || loadingOdontologos || mutating;

  // ... filtros y preparaciones ...

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

  const handleCancelar = async (cita) => {
    const motivo = await promptMotivoCancelacion(cita.nombreCompletoPaciente);
    if (!motivo) return;
    setMutating(true);
    try {
      await cancelarCita(cita.idCitas, motivo);
      alertSuccess('Cita cancelada', 'La cita fue cancelada correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['citas'] });
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };

  const handleReprogramar = async (idCita, reprogramData, onSuccess) => {
    // ... validación ...
    setMutating(true);
    try {
      await updateCita(idCita, { ... });
      alertSuccess('Cita reprogramada', 'La cita fue reprogramada correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['citas'] });
      onSuccess?.();
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };

  const handleCheckIn = async (cita) => {
    setMutating(true);
    try {
      await cambiarEstado(cita.idCitas, 'PENDIENTE');
      await queryClient.invalidateQueries({ queryKey: ['citas'] });
    } catch (err) {
      alertError(err.message || 'Error al registrar check-in');
    } finally {
      setMutating(false);
    }
  };

  const handleDeshacerCheckIn = async (cita) => {
    setMutating(true);
    try {
      await cambiarEstado(cita.idCitas, 'PROGRAMADA');
      await queryClient.invalidateQueries({ queryKey: ['citas'] });
    } catch (err) {
      alertError(err.message || 'Error al revertir check-in');
    } finally {
      setMutating(false);
    }
  };

  return { /* ... */ handleSubmit, handleCancelar, handleReprogramar, handleCheckIn, handleDeshacerCheckIn };
};
```

---

### 2.3 `src/hooks/usePatientManagement.js`
- Migrar búsqueda y listado a `useQuery({ queryKey: ['pacientes', debouncedSearch.trim()], queryFn: ({ signal }) => ... })`.
- Invalidar `['pacientes']` tras `createPaciente`, `updatePaciente` y `deletePaciente`.
- Permitir parámetro `overrideData` en `handleSubmit`.

```javascript
  const { data: patients = [], isLoading: loadingQuery } = useQuery({
    queryKey: ['pacientes', debouncedSearch.trim()],
    queryFn: async ({ signal }) => {
      const term = debouncedSearch.trim();
      return term ? buscarPacientes(term, { signal }) : getPacientes({ signal });
    },
  });

  const handleCreate = async (overrideData) => {
    setMutating(true);
    try {
      const dataToSave = overrideData || formData;
      const data = await createPaciente(dataToSave);
      alertSuccess('Paciente registrado', `${data.nombrePaciente} ${data.apellidoPaciente} fue registrado correctamente.`);
      await queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };

  const handleUpdate = async (overrideData) => {
    setMutating(true);
    try {
      const dataToSave = overrideData || formData;
      await updatePaciente(selectedId, dataToSave);
      alertSuccess('Expediente actualizado', 'Los cambios fueron guardados correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };
```

---

### 2.4 `src/hooks/useUserManagement.js`
- Migrar listas de usuarios y roles a `useQuery(['usuarios'])` y `useQuery(['roles'])`.
- Invalidar `['usuarios']` tras mutaciones.
- Soportar `overrideData` en `handleSubmit`.

```javascript
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
  });

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });

  const handleCreate = async (overrideData) => {
    setMutating(true);
    try {
      const dataToSave = overrideData || formData;
      const data = await createUsuario(dataToSave);
      alertSuccess('Usuario creado', `"${data.usernameUsuario}" registrado correctamente.`);
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };

  const handleUpdate = async (overrideData) => {
    setMutating(true);
    try {
      const payload = { ...(overrideData || formData) };
      if (!payload.password) delete payload.password;
      await updateUsuario(selectedId, payload);
      alertSuccess('Usuario actualizado', 'Los cambios se guardaron correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    const confirmed = await confirmDeactivate(nombre);
    if (!confirmed) return;
    setMutating(true);
    try {
      await deleteUsuario(id);
      alertSuccess('Usuario desactivado', 'El usuario fue inhabilitado correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      if (selectedId === id) handleCancel();
    } catch (err) {
      alertError(err.message);
    } finally {
      setMutating(false);
    }
  };
```

---

### 2.5 `src/hooks/useConsultaIndex.js`
- Reemplazar estados manuales con `useQuery(['citas'])` y `useQuery(['pacientes'])`.
- Implementar mutación optimista con revalidación de caché para el registro y deshecho de check-in en sala de espera.

---

### 2.6 `src/hooks/useConsultaData.js`
- Administrar la cita activa con `useQuery(['cita', citaId])`.
- Administrar la evaluación diagnóstica con `useQuery(['evaluacion', citaId])`.
- Administrar los hallazgos patológicos con `useQuery(['hallazgos', evaluacionId])`.
- Usar `useMutation` para persistir la evaluación inicial (`createEvaluacion`) e invalidar `['evaluacion', citaId]`.
- Usar `useMutation` con `onMutate` (actualización optimista en caché) para `updateEstadoHallazgo`.
- Mutación para finalizar cita médica mediante `cambiarEstado(citaId, 'FINALIZADA')`.

---

### 2.7 `src/hooks/useTratamientos.js`
- Administrar catálogo de tratamientos con `useQuery(['tratamientos'])`.
- Implementar `useMutation` para registro de hallazgos concurrentes con `Promise.all` e invalidación de `['hallazgos', idEval]`.
- Implementar `useMutation` para alta de tratamientos en caliente con invalidación de `['tratamientos']`.

---

### 2.8 `src/hooks/usePrescripcion.js`
- Administrar catálogo de medicamentos con `useQuery(['medicamentos'])`.
- Administrar la receta previa de la cita con `useQuery(['prescripcion', citaId])`.
- Implementar `useMutation` para `createPrescripcion` y posterior cambio de estado de la cita a `FINALIZADA`.
- Invalidar `['prescripcion', citaId]`, `['cita', citaId]` y `['citas']`.

---

## FASE 3: Validación Declarativa con React Hook Form y Zod

### 3.1 `src/components/AppointmentForm.jsx`
- Declarar esquema Zod `appointmentSchema`.
- Enlazar campos con `useForm({ resolver: zodResolver(appointmentSchema) })`.
- Utilizar etiqueta semántica `<form onSubmit={handleSubmit(handleFormSubmit)} noValidate>`.
- Calcular automáticamente la hora fin sumando 1 hora y pasar la propiedad `error` a los componentes `Input` y `Select`.

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const appointmentSchema = z.object({
  idPaciente: z
    .union([z.string(), z.number()])
    .refine(val => val !== '' && val !== null && val !== undefined, {
      message: 'Debe seleccionar un paciente de la lista.',
    }),
  idOdontologo: z
    .union([z.string(), z.number()])
    .refine(val => val !== '' && val !== null && val !== undefined, {
      message: 'Debe seleccionar un especialista odontólogo.',
    }),
  fechaCita: z.string().min(1, 'La fecha de la cita es obligatoria.'),
  horaInicioCita: z.string().min(1, 'La hora de inicio es obligatoria.'),
  horaFinCita: z.string().min(1, 'La hora de finalización es obligatoria.'),
  estadoCita: z.string().optional(),
});
```

---

### 3.2 `src/components/ReprogramModal.jsx`
- Esquema Zod `reprogramSchema` con refinamiento para validar que `horaFinCita > horaInicioCita`:

```jsx
const reprogramSchema = z.object({
  fechaCita: z.string().min(1, 'La nueva fecha es obligatoria.'),
  horaInicioCita: z.string().min(1, 'La hora de inicio es obligatoria.'),
  horaFinCita: z.string().min(1, 'La hora de finalización es obligatoria.'),
}).refine(data => {
  if (!data.horaInicioCita || !data.horaFinCita) return true;
  return new Date(data.horaFinCita) > new Date(data.horaInicioCita);
}, {
  message: 'La hora de finalización debe ser posterior a la hora de inicio.',
  path: ['horaFinCita'],
});
```

---

### 3.3 `src/views/AppointmentPage.jsx`
- Conectar la prop `onSubmit` de `AppointmentForm` para que reciba el objeto validado por RHF y lo reenvíe al hook `agenda.handleSubmit`:

```jsx
// ANTES
onSubmit={() => agenda.handleSubmit(handleFormSuccess)}

// DESPUÉS (Se pasa validatedData directamente al hook)
onSubmit={(validatedData) => agenda.handleSubmit(handleFormSuccess, validatedData)}
```

---

### 3.4 `src/views/PatientManagementPage.jsx`
- Definir `patientSchema` con validaciones de longitud mínima, correo y teléfono con Zod.
- Conectar el formulario con `useForm` y `reset(formData)` al seleccionar un paciente.

```jsx
const patientSchema = z.object({
  nombrePaciente: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  apellidoPaciente: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres.'),
  numeroIdentidadPaciente: z.string().trim().min(5, 'Ingresa un número de documento de identidad válido.'),
  telefonoPaciente: z.string().trim().min(7, 'El teléfono debe contener al menos 7 dígitos.'),
  fechaNacimientoPaciente: z.string().min(1, 'La fecha de nacimiento es requerida.'),
  emailPaciente: z.string().trim().email('El correo electrónico no tiene un formato válido.').optional().or(z.literal('')),
  contactoEmergencia: z.string().trim().optional(),
  alergias: z.string().trim().optional(),
});
```

---

### 3.5 `src/views/UserManagementPage.jsx`
- Diseñar el esquema dinámico `getUserSchema(isEditing, esOdontologo)`:
  - En edición, `password` es opcional; en creación, mínimo 6 caracteres.
  - Si `esOdontologo` es verdadero, `especialidadOdontologo` y `jvpoId` son campos requeridos obligatorios.
- **Patrón `schemaRef` para estabilidad de hooks:** Utilizar una referencia mutable `React.useRef` y derivar `esOdontologo` directamente de `watch('idRol')` para que el validador responda reactivamente sin reconstruir el hook:

```jsx
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

const UserManagementPage = () => {
  const {
    users, roles, selectedId, formData, loading, isEditing,
    handleSelect, handleChange,
    handleSubmit, handleCancel, handleDelete,
  } = useUserManagement();

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

  const onFieldChange = (name) => (e) => {
    setValue(name, e.target.value, { shouldValidate: true });
    handleChange(e);
  };

  const onSave = (validData) => {
    handleSubmit(validData);
  };

  // ... render del formulario con watch() y error={errors...} ...
};
```

---

## FASE 4: Verificación y Compilación

Una vez aplicadas las modificaciones en los archivos anteriores, ejecutar la prueba de construcción del cliente para certificar que no existan errores de importación, sintaxis o resolución de módulos:

```bash
npm run build
```

**Criterio de éxito:**
- Código de salida: `0`.
- Módulos transformados: `224 modules transformed`.
- Cero advertencias críticas o errores de empaquetado de Vite.
