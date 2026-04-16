# Estructura de Páginas - ICAP Frontend

## 📁 Organización de Carpetas

```
src/pages/
├── public/              # Páginas públicas (sin autenticación)
│   ├── Home.jsx         # Landing page de ICAP
│   └── Portales.jsx     # Selección de portales
│
├── auth/                # Páginas de autenticación
│   ├── LoginDocente.jsx
│   ├── LoginEstudiante.jsx
│   └── RegistroEstudiante.jsx
│
├── shared/              # Páginas compartidas entre roles
│   ├── Login.jsx        # Login genérico (legacy)
│   ├── Perfil.jsx       # Perfil de usuario
│   └── NotFound.jsx     # Página 404
│
├── admin/               # Páginas del portal ADMIN
│   ├── Dashboard.jsx
│   ├── Usuarios.jsx     # (pendiente mover desde hooks/pages)
│   ├── Roles.jsx        # (pendiente mover desde hooks/pages)
│   ├── Docentes.jsx     # (pendiente mover desde hooks/pages)
│   ├── Materias.jsx     # (pendiente mover desde hooks/pages)
│   ├── Aulas.jsx        # (pendiente mover desde hooks/pages)
│   ├── Grupos.jsx       # (pendiente mover desde hooks/pages)
│   ├── Horarios.jsx     # (pendiente mover desde hooks/pages)
│   ├── Asistencias.jsx  # (pendiente mover desde hooks/pages)
│   ├── Reportes.jsx    # (pendiente mover desde hooks/pages)
│   ├── Notificaciones.jsx # (pendiente mover desde hooks/pages)
│   ├── Auditoria.jsx   # (pendiente mover desde hooks/pages)
│   └── GestionesAcademicas.jsx # (pendiente mover desde hooks/pages)
│
├── docente/             # Páginas del portal DOCENTE
│   ├── Dashboard.jsx
│   ├── Grupos.jsx       # (pendiente crear)
│   ├── Horarios.jsx     # (pendiente crear)
│   ├── Asistencias.jsx  # (pendiente crear)
│   └── Notificaciones.jsx # (pendiente crear)
│
└── estudiante/          # Páginas del portal ESTUDIANTE
    ├── Dashboard.jsx
    ├── Materias.jsx     # (pendiente crear)
    ├── Notas.jsx        # (pendiente crear)
    ├── Documentos.jsx   # (pendiente crear)
    └── Pagos.jsx        # (pendiente crear)
```

## 🔄 Rutas de Importación

### Páginas Públicas
```javascript
import Home from '../pages/public/Home'
import Portales from '../pages/public/Portales'
```

### Autenticación
```javascript
import LoginDocente from '../pages/auth/LoginDocente'
import LoginEstudiante from '../pages/auth/LoginEstudiante'
import RegistroEstudiante from '../pages/auth/RegistroEstudiante'
```

### Compartidas
```javascript
import Login from '../pages/shared/Login'
import Perfil from '../pages/shared/Perfil'
import NotFound from '../pages/shared/NotFound'
```

### Admin
```javascript
import AdminDashboard from '../pages/admin/Dashboard'
import Usuarios from '../pages/admin/Usuarios'
// ... etc
```

### Docente
```javascript
import DocenteDashboard from '../pages/docente/Dashboard'
```

### Estudiante
```javascript
import EstudianteDashboard from '../pages/estudiante/Dashboard'
```

## 📝 Notas

1. **Páginas temporales**: Algunas páginas de admin están temporalmente en `hooks/pages/` y deben moverse a `pages/admin/`
2. **Páginas pendientes**: Faltan crear páginas específicas para docente y estudiante
3. **Rutas**: Todas las rutas están configuradas en `routes/index.jsx`

## ✅ Estado Actual

- ✅ Estructura de carpetas creada
- ✅ Páginas públicas creadas
- ✅ Páginas de autenticación creadas
- ✅ Dashboards por rol creados
- ✅ Rutas actualizadas
- ⏳ Pendiente: Mover páginas de admin desde hooks/pages
- ⏳ Pendiente: Crear páginas específicas de docente y estudiante

