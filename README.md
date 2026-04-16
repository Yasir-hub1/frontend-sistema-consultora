# Sistema Académico ICAP - Frontend React

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18 o superior
- npm o yarn
- Backend Laravel funcionando en http://localhost:8000

### 1. Instalación del Frontend

```bash
# Navegar al directorio del frontend
cd sistema-academico-frontend

# Instalar dependencias
npm install
# o
yarn install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
# o
yarn dev
```

### 2. Configuración de Variables de Entorno

Crear archivo `.env` con las siguientes variables:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Sistema Académico ICAP
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true
```

### 3. Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Componentes reutilizables
│   │   ├── layout/          # Componentes de layout
│   │   ├── auth/           # Componentes de autenticación
│   │   ├── docentes/       # Componentes de docentes
│   │   ├── horarios/       # Componentes de horarios
│   │   ├── asistencias/    # Componentes de asistencias
│   │   └── reportes/       # Componentes de reportes
│   ├── contexts/           # Contextos de React
│   ├── hooks/             # Hooks personalizados
│   ├── pages/             # Páginas principales
│   ├── services/          # Servicios API
│   ├── utils/             # Utilidades
│   └── routes/            # Configuración de rutas
├── public/                # Archivos estáticos
└── ...
```

### 4. Tecnologías Utilizadas

- **React 18** con Hooks
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **React Router v6** para navegación
- **Axios** para peticiones HTTP
- **React Hook Form** para formularios
- **React Query** para caché de datos
- **React Hot Toast** para notificaciones
- **Lucide React** para iconos
- **QR Code React** para códigos QR
- **jsPDF** para generación de PDFs
- **Recharts** para gráficos

### 5. Características Implementadas

✅ **Autenticación completa con Context API**
✅ **Sistema de rutas protegidas**
✅ **Gestión de estado global**
✅ **Servicios API organizados**
✅ **Componentes reutilizables**
✅ **Diseño responsive con Tailwind CSS**
✅ **Manejo de errores centralizado**
✅ **Interceptores de Axios**
✅ **Sistema de temas (claro/oscuro)**

### 6. Páginas Principales

- **Login** - Autenticación de usuarios
- **Dashboard** - Panel principal según rol
- **Docentes** - Gestión de docentes
- **Materias** - Gestión de materias
- **Aulas** - Gestión de aulas
- **Grupos** - Gestión de grupos
- **Horarios** - Gestión de horarios
- **Asistencias** - Control de asistencias
- **Reportes** - Generación de reportes
- **Perfil** - Perfil de usuario

### 7. Componentes Clave

#### Autenticación
- `AuthContext` - Contexto de autenticación
- `ProtectedRoute` - Componente de ruta protegida
- `LoginForm` - Formulario de login

#### Servicios
- `api.js` - Configuración de Axios
- `authService.js` - Servicio de autenticación
- `docenteService.js` - Servicio de docentes
- `horarioService.js` - Servicio de horarios
- `asistenciaService.js` - Servicio de asistencias

#### Utilidades
- `helpers.js` - Funciones de utilidad
- `constants.js` - Constantes del sistema
- `validators.js` - Validaciones de formularios

### 8. Configuración de Desarrollo

#### Vite Config
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
```

#### Tailwind Config
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      }
    },
  },
  plugins: [],
}
```

### 9. Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Instalar dependencias
npm install

# Actualizar dependencias
npm update
```

### 10. Próximos Pasos

- [ ] Implementar componentes específicos (QR Scanner, Calendar, etc.)
- [ ] Crear páginas completas para cada módulo
- [ ] Implementar funcionalidades de reportes
- [ ] Configurar PWA
- [ ] Crear tests unitarios
- [ ] Optimizar performance

### 11. Estructura de Componentes

#### Componentes Comunes
- `Button` - Botón reutilizable
- `Input` - Input reutilizable
- `Modal` - Modal reutilizable
- `Table` - Tabla reutilizable
- `Card` - Card reutilizable
- `LoadingSpinner` - Spinner de carga

#### Componentes de Layout
- `Navbar` - Barra de navegación
- `Sidebar` - Barra lateral
- `Footer` - Pie de página
- `Layout` - Layout principal

#### Componentes Específicos
- `HorarioCalendar` - Calendario de horarios
- `QRScanner` - Escáner de códigos QR
- `QRGenerator` - Generador de códigos QR
- `ReportFilter` - Filtros de reportes
- `StatCard` - Tarjeta de estadísticas

### 12. Manejo de Estado

#### Context API
- `AuthContext` - Estado de autenticación
- `ThemeContext` - Estado del tema

#### Hooks Personalizados
- `useAuth` - Hook de autenticación
- `useApi` - Hook para peticiones API
- `usePagination` - Hook de paginación

### 13. Integración con Backend

El frontend se conecta con el backend Laravel a través de:

- **Base URL**: `http://localhost:8000/api`
- **Autenticación**: Tokens de Laravel Sanctum
- **Headers**: `Authorization: Bearer {token}`
- **Formato**: JSON para requests y responses

### 14. Soporte

Para soporte técnico o reportar bugs, contactar al equipo de desarrollo.

---

**Desarrollado para la Facultad ICAP** 🎓