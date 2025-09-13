# Interfaz de Gestión de Roles y Usuarios

## Descripción
Esta interfaz proporciona una vista administrativa completa para gestionar usuarios del sistema de horarios de la UIS, permitiendo crear nuevos usuarios y asignar roles de acceso de manera dinámica.

## Características

### 👥 Gestión de Usuarios
- **Crear Usuarios**: Formulario completo para agregar nuevos usuarios al sistema
- **Asignar Roles**: Cambio dinámico de roles entre Estudiante, Profesor y Administrador
- **Eliminar Usuarios**: Funcionalidad para remover usuarios del sistema
- **Editar Usuarios**: Preparado para futuras implementaciones de edición

### 📊 Estadísticas en Tiempo Real
- Contador de usuarios por rol
- Tarjetas visuales con iconos distintivos
- Actualización automática al modificar usuarios
- Colores diferenciados por tipo de rol

### 🔍 Búsqueda y Filtrado
- Barra de búsqueda en tiempo real
- Filtrado por nombre de usuario, nombre completo, email o rol
- Resultados instantáneos sin recargar la página
- Estado vacío cuando no hay coincidencias

### 🎨 Diseño Moderno y Responsivo
- Header con gradiente atractivo
- Tarjetas con efectos hover y sombras
- Formularios con validación visual
- Tabla responsiva con scroll horizontal en móviles

## Funcionalidades Principales

### Crear Usuario
1. **Botón "Crear Usuario"** en el header
2. **Formulario desplegable** con campos:
   - Nombre de usuario (requerido)
   - Nombre completo (requerido)
   - Correo electrónico (requerido)
   - Selección de rol (Estudiante/Profesor/Administrador)
3. **Validación** de campos obligatorios
4. **Botones de acción**: Cancelar y Crear Usuario

### Asignar Roles
- **Selector desplegable** en cada fila de usuario
- **Cambio inmediato** del rol sin recargar
- **Persistencia** del cambio en el estado local
- **Roles disponibles**:
  - 🎓 Estudiante (Verde)
  - 👨‍🏫 Profesor (Azul)
  - 🛡️ Administrador (Púrpura)

### Gestión de Usuarios
- **Vista de tabla** con información completa
- **Acciones por usuario**:
  - Editar (preparado para futuras implementaciones)
  - Eliminar (con confirmación implícita)
- **Información mostrada**:
  - Avatar con color del rol
  - Nombre de usuario
  - Nombre completo
  - Email
  - Rol actual
  - Fecha de creación

## Diseño

### Paleta de Colores
- **Header**: Gradiente azul-púrpura (`#667eea` → `#764ba2`)
- **Estudiante**: Verde (`#388E3C`, `#4CAF50`)
- **Profesor**: Azul (`#1976D2`, `#2196F3`)
- **Administrador**: Púrpura (`#4A148C`, `#9C27B0`)
- **Acciones**: Teal (`#20c997`, `#1a9f7a`)
- **Fondo**: Gris claro (`#f8f9fa`)

### Características de Diseño
- Bordes redondeados (`16px` para cards, `12px` para botones)
- Sombras suaves con efectos hover
- Gradientes en elementos principales
- Animaciones de transición suaves
- Diseño completamente responsivo
- Iconos de Font Awesome para mejor UX

## Responsividad

### Desktop (>768px)
- Layout de grid para estadísticas
- Formulario en dos columnas
- Tabla completa con todas las columnas

### Tablet (≤768px)
- Header apilado verticalmente
- Formulario en una columna
- Estadísticas en una columna
- Tabla con scroll horizontal

### Mobile (≤480px)
- Botón de crear usuario a ancho completo
- Tabla optimizada para móviles
- Acciones apiladas verticalmente

## Navegación
- **Ruta**: `/admin/roles`
- **Acceso**: Solo usuarios con rol de administrador
- **Integración**: Incluido en el menú de navegación principal

## Datos de Ejemplo
La interfaz incluye datos de ejemplo para demostrar la funcionalidad:
- 3 usuarios con diferentes roles
- Información completa de contacto
- Fechas de creación realistas
- Roles variados para mostrar la funcionalidad

## Uso
Para acceder a la interfaz:
1. Iniciar sesión como administrador
2. Navegar a `/admin/roles` o usar el menú lateral
3. Usar el botón "Crear Usuario" para agregar nuevos usuarios
4. Cambiar roles usando los selectores en la tabla
5. Buscar usuarios usando la barra de búsqueda

## Futuras Mejoras
- Implementación de edición de usuarios
- Validación de email único
- Confirmación antes de eliminar usuarios
- Paginación para grandes cantidades de usuarios
- Filtros avanzados por fecha y rol
- Exportación de datos de usuarios 