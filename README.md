# IERIC - Sistema de Gestión

Sistema de gestión integral para IERIC desarrollado con tecnologías web modernas.

## 🚀 Características

- **Interfaz moderna y responsive** con Tailwind CSS
- **Arquitectura modular** separando HTML, CSS y JavaScript
- **Sistema de modales** para diferentes acciones
- **Filtros avanzados** con chips visuales
- **Tabla interactiva** con selección múltiple
- **Sistema de notificaciones** tipo toast
- **Navegación por pestañas** en modales
- **Accesibilidad completa** con ARIA labels y roles
- **Validación de formularios** en tiempo real
- **Exportación de datos** en múltiples formatos

## 📁 Estructura del Proyecto

```
YakiTest/
├── index.html                 # Página principal
├── assets/                    # Recursos estáticos
│   ├── css/                   # Hojas de estilo
│   │   ├── main.css          # Estilos principales y variables
│   │   └── components.css    # Componentes reutilizables
│   ├── js/                    # Scripts JavaScript
│   │   ├── main.js           # Funcionalidad principal
│   │   ├── modals.js         # Sistema de modales y tabs
│   │   └── utils.js          # Utilidades y helpers
│   └── img/                   # Imágenes del proyecto
├── pages/                     # Páginas adicionales
│   ├── legales.html          # Página de legales
│   ├── fiscalizacion.html    # Página de fiscalización
│   └── dashboard.html        # Dashboard principal
└── README.md                  # Documentación del proyecto
```

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Variables CSS y estilos modernos
- **JavaScript ES6+** - Funcionalidad interactiva
- **Tailwind CSS** - Framework de utilidades CSS
- **Material Icons** - Iconografía consistente
- **Google Fonts** - Tipografía Inter

## 🚀 Instalación y Uso

### Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional, para desarrollo)

### Instalación

1. **Clonar o descargar** el proyecto
2. **Abrir** `index.html` en tu navegador
3. **¡Listo!** El sistema está funcionando

### Desarrollo Local

Para desarrollo local, se recomienda usar un servidor web:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Con PHP
php -S localhost:8000
```

Luego abrir `http://localhost:8000` en tu navegador.

## 📖 Documentación de la API

### Variables Globales

```javascript
// Configuración global
window.CONFIG = {
    API_BASE_URL: 'https://api.ieric.com',
    VERSION: '1.0.0',
    DEBUG: true,
    TOAST_DURATION: 5000,
    ANIMATION_DURATION: 300
};

// Estado global de la aplicación
window.AppState = {
    currentPage: 'legales',
    activeFilters: new Map(),
    selectedRows: new Set(),
    currentUser: null,
    notifications: []
};
```

### Módulo Principal (IERIC)

```javascript
window.IERIC = {
    navigateToPage(page),      // Navegar a una página
    showToast(message, type),  // Mostrar notificación
    openModal(modalId),        // Abrir modal
    closeModal(modalId),       // Cerrar modal
    applyFilters(filters),     // Aplicar filtros
    clearAllFilters()          // Limpiar todos los filtros
};
```

### Módulo de Modales (ModalManager)

```javascript
window.ModalManager = {
    openModal(modalId),           // Abrir modal genérico
    closeModal(modalId),          // Cerrar modal
    openTab(evt, tabName, icon), // Abrir pestaña
    exportToPDF(),                // Exportar a PDF
    exportToCSV(),                // Exportar a CSV
    exportToJSON(),               // Exportar a JSON
    validateField(field)          // Validar campo
};
```

### Módulo de Utilidades (Utils)

```javascript
window.Utils = {
    // Notificaciones
    showToast(message, type, duration),
    removeToast(toast),
    clearAllToasts(),
    
    // Validación
    isValidEmail(email),
    isValidCUIT(cuit),
    isValidPhone(phone),
    isValidDate(date),
    
    // Formateo
    formatCurrency(amount, currency),
    formatDate(date, locale),
    formatCUIT(cuit),
    formatPhone(phone),
    
    // Manipulación de datos
    deepClone(obj),
    groupBy(array, key),
    sortBy(array, ...criteria),
    filterBy(array, ...filters)
};
```

## 🎨 Sistema de Diseño

### Variables CSS

```css
:root {
    /* Colores principales */
    --primary: #084470;      /* Azul IERIC */
    --secondary: #68C8D8;    /* Azul claro */
    --background: #E8F0F7;   /* Fondo principal */
    
    /* Colores de texto */
    --text-primary: #1E293B;   /* Texto principal */
    --text-secondary: #374151; /* Texto secundario */
    
    /* Estados */
    --success: #10B981;      /* Verde éxito */
    --warning: #F59E0B;      /* Amarillo advertencia */
    --error: #EF4444;        /* Rojo error */
    --info: #3B82F6;         /* Azul información */
}
```

### Clases de Componentes

- **Botones**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`
- **Formularios**: `.form-input`, `.form-select`, `.form-textarea`
- **Modales**: `.modal`, `.modal-content`, `.modal-header`, `.modal-body`
- **Tablas**: `.table`, `.table-container`
- **Estados**: `.status-badge`, `.status-pending`, `.status-assigned`

## 🔧 Personalización

### Agregar Nuevas Páginas

1. Crear archivo HTML en la carpeta `pages/`
2. Agregar enlace en la navegación lateral
3. Implementar funcionalidad específica en JavaScript

### Agregar Nuevos Modales

1. Crear estructura HTML del modal
2. Agregar funciones en `modals.js`
3. Configurar triggers y eventos

### Agregar Nuevos Filtros

1. Agregar campos en la sección de filtros
2. Implementar lógica en `main.js`
3. Actualizar sistema de chips

## 📱 Responsive Design

El sistema está completamente optimizado para dispositivos móviles:

- **Mobile First** - Diseño optimizado para móviles
- **Breakpoints** - Adaptación automática a diferentes tamaños
- **Touch Friendly** - Interacciones optimizadas para pantallas táctiles
- **Accesibilidad** - Navegación por teclado y lectores de pantalla

## ♿ Accesibilidad

- **ARIA Labels** - Etiquetas descriptivas para lectores de pantalla
- **Roles Semánticos** - Estructura HTML semántica
- **Navegación por Teclado** - Acceso completo sin mouse
- **Contraste** - Colores con ratio de contraste adecuado
- **Screen Reader** - Compatible con lectores de pantalla

## 🧪 Testing

### Funcionalidades Principales

- [x] Navegación entre páginas
- [x] Sistema de filtros
- [x] Selección de filas
- [x] Modales y pestañas
- [x] Exportación de datos
- [x] Validación de formularios
- [x] Notificaciones toast
- [x] Responsive design

### Navegadores Soportados

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Despliegue

### Producción

1. **Minificar** archivos CSS y JavaScript
2. **Optimizar** imágenes
3. **Configurar** servidor web
4. **Habilitar** compresión GZIP
5. **Configurar** cache headers

### CDN

Los archivos estáticos pueden ser servidos desde un CDN para mejor rendimiento.

## 🤝 Contribución

### Guías de Desarrollo

1. **Mantener** la estructura modular
2. **Seguir** las convenciones de nomenclatura
3. **Documentar** nuevas funcionalidades
4. **Probar** en múltiples navegadores
5. **Verificar** accesibilidad

### Estilo de Código

- **JavaScript**: ES6+, funciones nombradas, comentarios JSDoc
- **CSS**: Variables CSS, clases semánticas, responsive first
- **HTML**: Semántico, accesible, validado

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Equipo

- **IERIC Team** - Desarrollo y mantenimiento
- **Diseñadores UX/UI** - Interfaz y experiencia de usuario
- **QA Team** - Testing y calidad

## 📞 Soporte

Para soporte técnico o consultas:

- **Email**: soporte@ieric.com
- **Documentación**: [docs.ieric.com](https://docs.ieric.com)
- **Issues**: [GitHub Issues](https://github.com/ieric/sistema-gestion/issues)

## 🔄 Changelog

### v1.2.3 (2025-01-XX)
- ✨ Nueva arquitectura modular
- 🎨 Sistema de diseño unificado
- ♿ Mejoras de accesibilidad
- 📱 Optimización responsive
- 🚀 Mejor rendimiento

### v1.2.2 (2024-12-XX)
- 🐛 Corrección de bugs menores
- 📝 Actualización de documentación

### v1.2.1 (2024-11-XX)
- ✨ Nuevas funcionalidades de exportación
- 🎨 Mejoras en la interfaz de usuario

---

**IERIC - Instituto de Estudios e Investigaciones en Construcción**

*Construyendo el futuro de la gestión en construcción*
