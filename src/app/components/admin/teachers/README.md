# Interfaz de Teachers

## Descripción
Esta interfaz proporciona una vista administrativa para gestionar profesores del sistema de horarios de la UIS, permitiendo ver la lista de docentes y sus grupos asignados.

## Características

### 👥 Lista de Profesores
- Vista de tarjetas con información de cada profesor
- Información mostrada:
  - Nombre completo del profesor
  - Carrera universitaria
  - Ubicación de oficina
  - Correo electrónico
  - Estadísticas de grupos y estudiantes
- Barra de búsqueda para filtrar profesores
- Diseño responsivo con efectos hover

### 📊 Estadísticas por Profesor
- Número total de grupos asignados
- Número total de estudiantes
- Visualización en badges con colores distintivos

### 👨‍🏫 Vista de Grupos del Profesor
- Al hacer clic en un profesor se muestra:
  - Perfil detallado del profesor
  - Lista completa de grupos asignados
  - Información de cada grupo:
    - Nombre del grupo
    - Asignatura asociada
    - Horario específico
    - Aula asignada
    - Cantidad de estudiantes
- Botones de acción para ver detalles y editar

## Diseño

### Colores
- **Teal**: `#20c997` (color principal)
- **Teal Dark**: `#1a9f7a` (hover states)
- **Purple**: `#6f42c1` (color secundario)
- **Purple Dark**: `#5a32a3` (hover states)
- **Background**: `#f8f9fa` (fondo claro)
- **White**: `#ffffff` (tarjetas)

### Características de Diseño
- Bordes redondeados (`12px`)
- Sombras suaves con efectos hover
- Gradientes en avatares y elementos principales
- Animaciones de transición suaves
- Diseño completamente responsivo
- Iconos de Font Awesome para mejor UX

## Navegación
- Vista principal: Lista de profesores
- Vista secundaria: Grupos del profesor seleccionado
- Botón de retorno para volver a la lista
- Transiciones animadas entre vistas

## Funcionalidades

### Búsqueda
- Campo de búsqueda con icono
- Filtrado en tiempo real (preparado para implementar)
- Diseño intuitivo con focus states

### Interacción
- Clic en tarjeta de profesor para ver grupos
- Efectos hover en todas las tarjetas
- Botones de acción en grupos
- Navegación fluida entre vistas

## Responsividad
- **Desktop**: Layout de grid con múltiples columnas
- **Tablet**: Ajustes en grid y tamaños de fuente
- **Mobile**: Layout de una columna, elementos apilados

## Uso
Para acceder a la interfaz, navegar a `/admin/teachers` en la aplicación.

## Datos de Ejemplo
La interfaz incluye datos de ejemplo para demostrar la funcionalidad:
- 4 profesores diferentes
- 2 grupos por profesor en promedio
- Información completa de contacto y ubicación
- Horarios y aulas asignadas 