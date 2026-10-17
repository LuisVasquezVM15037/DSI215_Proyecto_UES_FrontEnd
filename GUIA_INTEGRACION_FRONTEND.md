# GUÍA DE INTEGRACIÓN Y COMMITS: FRONTEND DENTALCARE ERP
> **Rol:** Arquitectura de Software & Estándares Académicos  
> **Stack:** React 18, Vite, Tailwind CSS, TanStack Query v5, React Hook Form v7, Zod v4  
> **Ruta Base:** `src/`

---

## 🏛️ 1. DICTAMEN ARQUITECTÓNICO Y DESCARTE DE CAMBIOS

### ✅ Cambios Aprobados
1. **Design System Clínico (Commit 0):**  
   - Establece coherencia visual institucional mediante tokens de Tailwind (`primary` clínico, `dental` menta, `surface`), fuentes tipográficas (*Plus Jakarta Sans* y *Outfit*) y micro-animaciones.
2. **Desacoplamiento de Estado de Servidor con TanStack Query (Commits 1, 2, 5, 6, 7):**  
   - Elimina el antipatrón de duplicar datos del backend en `useState` locales con `useEffect` dispersos.
   - Configura políticas adecuadas de frescura (`staleTime: 2min`, `refetchOnWindowFocus: false`).
   - Incorpora soporte de `AbortSignal` para cancelar búsquedas HTTP obsoletas por debouncing.
   - Implementa invalidación atómica de caché y mutaciones optimistas en estados de piezas dentales (`onMutate`).
3. **Resiliencia ante Fallos de Render con ErrorBoundary (Commit 3):**  
   - Previene caídas a "pantalla blanca" (White Screen of Death) aislando fallos de render en la jerarquía del DOM virtual.
4. **Centralización de Sesión (SSoT) con AuthContext e Interceptor 401 (Commit 4):**  
   - Erradica accesos directos a `localStorage` dispersos en vistas y componentes.
   - Sincronización multi-pestaña mediante el evento `storage` y desacoplamiento del cierre de sesión ante respuestas 401 mediante `setUnauthorizedHandler`.
5. **Validación Declarativa con React Hook Form y Zod (Commits 8, 9, 10):**  
   - Control de validaciones mediante esquemas inmutables tipados, reduciendo drásticamente los re-renders innecesarios.

### ❌ Cambios Descartados / Refactorizados
- **Descarte de la mutación de `schemaRef.current` en el cuerpo del render (`UserManagementPage.jsx`):**  
  - **Motivo del Descarte:** Asignar `schemaRef.current = useMemo(...)` directamente dentro de la función del componente muta una referencia mutable durante la fase de render. Esto rompe la regla de oro de funciones puras en React y puede generar tearing e inconsistencias en React 18 con StrictMode o Concurrent Features.
  - **Refactorización Académica:** Utilizar la API idiomática de Zod con `superRefine()` o regenerar el resolver derivado limpiamente sin mutaciones de refs durante la ejecución del render.
- **Descarte de la duplicación de estado entre hooks y formularios (`formData` vs RHF):**  
  - **Motivo del Descarte:** Mantener sincronizados un estado en el hook (`formData`, `handleChange`) y otro en React Hook Form (`register`, `watch`) genera una **Doble Fuente de Verdad** (Dual SSoT).
  - **Refactorización:** El formulario de RHF administra exclusivamente el estado de los inputs y su validación; al completarse con éxito, transfiere los datos validados al hook únicamente para su persistencia en el backend (`mutateAsync`).

---

## 📦 2. ESTRATEGIA DE COMMITS ATÓMICOS (JIRA)

---

### 🔹 Commit 0: Identidad Visual y Design System Extendido
* **Mensaje de Commit:**
  ```text
  [HDU-XXX] style(design-system): configurar tema Tailwind extendido, Google Fonts y Bootstrap Icons
  ```
* **Propósito:** Configurar tokens clínicos, tipografía y hojas de estilo base.
* **Archivos Involucrados:**
  - `package.json` (MODIFICAR)
  - `index.html` (MODIFICAR)
  - `tailwind.config.js` (MODIFICAR)
  - `src/index.css` (MODIFICAR)
  - `src/main.jsx` (MODIFICAR)

#### Paso 0.1: Instalar dependencias de iconos
```bash
npm install bootstrap-icons@^1.13.1
```

#### Paso 0.2: `index.html`
Incluir fuentes *Outfit* y *Plus Jakarta Sans*:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

#### Paso 0.3: `tailwind.config.js`
Extender paleta `primary`, `dental`, `surface`, fuentes, sombras y animaciones:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8',
          500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e',
        },
        dental: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf',
          500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card: '#ffffff',
          subtle: '#f1f5f9',
          border: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Syne"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'fade-in-up': 'fadeInUp 0.35s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 23 42 / 0.05), 0 1px 2px -1px rgb(15 23 42 / 0.05)',
        'card-md': '0 4px 8px -1px rgb(15 23 42 / 0.06), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
        'card-hover': '0 12px 24px -4px rgb(15 23 42 / 0.08), 0 4px 6px -2px rgb(15 23 42 / 0.04)',
        glass: '0 8px 32px 0 rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
```

#### Paso 0.4: `src/index.css` y `src/main.jsx`
- En `src/index.css`: Aplicar capas `@layer base` y scrollbars estilizadas.
- En `src/main.jsx`: `import 'bootstrap-icons/font/bootstrap-icons.css';`.

---

### 🔹 Commit 1: Instalación de Dependencias Core
* **Mensaje de Commit:**
  ```text
  [HDU-XXX] chore(deps): instalar dependencias base para estado de servidor y formularios
  ```
* **Propósito:** Integrar TanStack Query, React Hook Form y Zod.
* **Archivos Involucrados:**
  - `package.json` (MODIFICAR)
  - `package-lock.json` (MODIFICAR)

```bash
npm install @tanstack/react-query@^5.103.1 react-hook-form@^7.88.0 zod@^4.6.5 @hookform/resolvers@^5.9.1
```

---

### 🔹 Commit 2: Configuración Global de QueryClientProvider
* **Mensaje de Commit:**
  ```text
  [HDU-XXX] feat(cache): configurar QueryClientProvider global en el bootstrap de la aplicacion
  ```
* **Propósito:** Configurar directivas clínicas de caché en el punto de entrada.
* **Archivos Involucrados:**
  - `src/main.jsx` (MODIFICAR)

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos de frescura
      refetchOnWindowFocus: false, // Previene recargas invasivas
      retry: 1,
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

### 🔹 Commit 3: Resiliencia con ErrorBoundary Institucional
* **Mensaje de Commit:**
  ```text
  [HDU-XXX] feat(resilience): implementar ErrorBoundary institucional para fallos en render
  ```
* **Propósito:** Captura de excepciones en render para proteger la continuidad de la interfaz clínica.
* **Archivos Involucrados:**
  - `src/components/ErrorBoundary.jsx` (CREAR)
  - `src/App.jsx` (MODIFICAR)

#### Paso 3.1: Crear `src/components/ErrorBoundary.jsx`
Componente de clase React con vista de contingencia, detalles técnicos colapsables e interfaz estilizada con Tailwind.

#### Paso 3.2: Envolver `App` en `src/App.jsx`
```jsx
<ErrorBoundary>
  <BrowserRouter>
    {/* Rutas */}
  </BrowserRouter>
</ErrorBoundary>
```

---

### 🔹 Commit 4: Autenticación Centralizada (SSoT) e Interceptor 401
* **Mensaje de Commit:**
  ```text
  [HDU-XXX] feat(auth): centralizar gestion reactiva de sesion con AuthContext e interceptor 401
  ```
* **Propósito:** Unificar la fuente de verdad de sesión, verificación reactiva de expiración de token y logout desacoplado ante respuestas HTTP 401.
* **Archivos Involucrados:**
  - `src/services/api.service.js` (MODIFICAR)
  - `src/context/AuthContext.jsx` (MODIFICAR)
  - `src/components/ProtectedRoute.jsx` (MODIFICAR)
  - `src/components/Layout.jsx` (MODIFICAR)
  - `src/views/LoginPage.jsx` (MODIFICAR)
  - `src/App.jsx` (MODIFICAR)

#### Paso 4.1: Interceptor en `src/services/api.service.js`
Implementar `setUnauthorizedHandler((handler) => ...)` para delegar el cierre de sesión al contexto de React.

#### Paso 4.2: Contexto reactivo en `src/context/AuthContext.jsx`
Implementar escucha de evento `storage` para sincronización entre pestañas y validación de expiración de JWT con `atob()`.

---

### 🔹 Commit 5: Migración a TanStack Query en Dashboard y Agenda
* **Mensaje de Commit:**
  ```text
  [HDU-XXX] refactor(hooks): migrar estado de servidor a TanStack Query en Dashboard y Agenda
  ```
* **Propósito:** Cacheo de citas, sincronización de citas vencidas, soporte de `overrideData` e invalidación de caché.
* **Archivos Involucrados:**
  - `src/hooks/useHomeDashboard.js` (MODIFICAR)
  - `src/hooks/useAgenda.js` (MODIFICAR)

---

### 🔹 Commit 6: Migración a TanStack Query en Pacientes y Usuarios
* **Mensaje de Commit:**
  ```text
  [HDU-XXX] refactor(hooks): migrar estado de servidor a TanStack Query en Pacientes y Usuarios
  ```
* **Propósito:** Búsqueda con cancelación `AbortSignal` ante debouncing y mutaciones con invalidación automática de colecciones.
* **Archivos Involucrados:**
  - `src/hooks/usePatientManagement.js` (MODIFICAR)
  - `src/hooks/useUserManagement.js` (MODIFICAR)

---

### 🔹 Commit 7: Migración a TanStack Query en el Módulo Clínico
* **Mensaje de Commit:**
  ```text
  [HDU-XXX] refactor(hooks): migrar flujo clinico y consultas medicas a TanStack Query
  ```
* **Propósito:** Cachear evaluación diagnóstica, mutaciones optimistas en estados de piezas dentales (`onMutate`) y registro de recetas médicas.
* **Archivos Involucrados:**
  - `src/hooks/useConsultaIndex.js` (MODIFICAR)
  - `src/hooks/useConsultaData.js` (MODIFICAR)
  - `src/hooks/useTratamientos.js` (MODIFICAR)
  - `src/hooks/usePrescripcion.js` (MODIFICAR)

---

### 🔹 Commit 8: Validación Declarativa en Citas y Reprogramación
* **Mensaje de Commit:**
  ```text
  [HDU-XXX] feat(forms): implementar React Hook Form y Zod en Citas y Reprogramacion
  ```
* **Propósito:** Validación de horas de inicio y fin (`horaFinCita > horaInicioCita`) mediante esquemas Zod con feedback visual accesible.
* **Archivos Involucrados:**
  - `src/components/AppointmentForm.jsx` (MODIFICAR)
  - `src/components/ReprogramModal.jsx` (MODIFICAR)
  - `src/views/AppointmentPage.jsx` (MODIFICAR)

---

### 🔹 Commit 9: Validación con Zod en Expediente de Pacientes
* **Mensaje de Commit:**
  ```text
  [HDU-XXX] feat(forms): implementar validacion declarativa con Zod en Expediente de Pacientes
  ```
* **Propósito:** Validación estricta de documentos de identidad (DUI), teléfonos y correos electrónicos.
* **Archivos Involucrados:**
  - `src/views/PatientManagementPage.jsx` (MODIFICAR)

---

### 🔹 Commit 10: Formulario Dinámico Reactivo Puro en Gestión de Usuarios
* **Mensaje de Commit:**
  ```text
  [HDU-XXX] feat(forms): implementar validacion condicional con Zod en Gestion de Usuarios
  ```
* **Propósito:** Validación dinámica condicional sin mutación de refs en render: si el usuario es Odontólogo, `jvpoId` y `especialidadOdontologo` son obligatorios; contraseña obligatoria solo al crear.
* **Archivos Involucrados:**
  - `src/views/UserManagementPage.jsx` (MODIFICAR)

#### Esquema Puro con `superRefine`:
```javascript
const userSchema = z.object({
  nombreUsuario: z.string().trim().min(1, 'El nombre es obligatorio.'),
  apellidoUsuario: z.string().trim().min(1, 'El apellido es obligatorio.'),
  usernameUsuario: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres.'),
  emailUsuario: z.string().trim().email('El correo electrónico no tiene un formato válido.'),
  password: z.string().optional(),
  idRol: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== null, {
    message: 'Debe seleccionar un rol asignado.',
  }),
  especialidadOdontologo: z.string().optional().nullable(),
  jvpoId: z.string().optional().nullable(),
  esActivo: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (!isEditing && (!data.password || data.password.length < 6)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La contraseña debe contener al menos 6 caracteres.',
      path: ['password'],
    });
  }
  if (esOdontologo) {
    if (!data.especialidadOdontologo || !data.especialidadOdontologo.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La especialidad es obligatoria para odontólogos.',
        path: ['especialidadOdontologo'],
      });
    }
    if (!data.jvpoId || !data.jvpoId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número de JVPO es obligatorio para odontólogos.',
        path: ['jvpoId'],
      });
    }
  }
});
```

---

## 🧪 3. VERIFICACIÓN Y COMPILACIÓN

Para certificar que no existen errores de sintaxis, tipos o empaquetado:

```bash
npm run build
```

**Criterio de Aceptación:** Código de salida `0`, empaquetado exitoso por Vite sin advertencias de resolución.
