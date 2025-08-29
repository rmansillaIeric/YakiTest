/**
 * IERIC - Sistema de Gestión
 * Archivo principal de JavaScript
 * 
 * @author IERIC Team
 * @version 1.0.0
 * @license MIT
 */

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    API_BASE_URL: 'https://api.ieric.com',
    VERSION: '1.0.0',
    DEBUG: true,
    TOAST_DURATION: 5000,
    ANIMATION_DURATION: 300
};

// ===== ESTADO GLOBAL DE LA APLICACIÓN =====
const AppState = {
    currentPage: 'legales',
    activeFilters: new Map(),
    selectedRows: new Set(),
    currentUser: null,
    notifications: []
};

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 IERIC System initializing...');
    
    // Inicializar componentes principales
    initializeNavigation();
    initializeSidebar();
    initializeTable();
    initializeFilters();
    initializeModals();
    initializeToast();
    
    // Configurar event listeners globales
    setupGlobalEventListeners();
    
    // Cargar datos iniciales
    loadInitialData();
    
    console.log('✅ IERIC System initialized successfully');
});

// ===== INICIALIZACIÓN DE COMPONENTES =====

/**
 * Inicializa la navegación principal
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });
}

/**
 * Inicializa la barra lateral
 */
function initializeSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al enlace clickeado
            link.classList.add('active');
            
            const page = link.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });
}

/**
 * Inicializa la tabla principal
 */
function initializeTable() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const sendButton = document.getElementById('sendButton');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
                if (isChecked) {
                    AppState.selectedRows.add(checkbox.value);
                } else {
                    AppState.selectedRows.delete(checkbox.value);
                }
            });
            
            updateSendButton();
        });
    }
    
    if (rowCheckboxes.length > 0) {
        rowCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    AppState.selectedRows.add(checkbox.value);
                } else {
                    AppState.selectedRows.delete(checkbox.value);
                    // Desmarcar "Seleccionar todo" si no están todos marcados
                    if (selectAllCheckbox) {
                        selectAllCheckbox.checked = false;
                    }
                }
                
                updateSendButton();
            });
        });
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', handleSendAction);
    }
}

/**
 * Inicializa el sistema de filtros
 */
function initializeFilters() {
    const filterForm = document.querySelector('#filterForm');
    const clearAllButton = document.getElementById('clearAllButton');
    
    if (filterForm) {
        filterForm.addEventListener('submit', handleFilterSubmit);
    }
    
    if (clearAllButton) {
        clearAllButton.addEventListener('click', clearAllFilters);
    }
    
    // Inicializar filtros de fecha
    initializeDateFilters();
}

/**
 * Inicializa los filtros de fecha
 */
function initializeDateFilters() {
    const dateForm = document.querySelector('form[data-type="date-filter"]');
    
    if (dateForm) {
        dateForm.addEventListener('submit', handleDateFilterSubmit);
    }
}

/**
 * Inicializa el sistema de modales
 */
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
        
        // Configurar botones de cierre
        const closeButtons = modal.querySelectorAll('.modal-close, [data-action="close-modal"]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                closeModal(modal.id);
            });
        });
    });
}

/**
 * Inicializa el sistema de notificaciones toast
 */
function initializeToast() {
    // Crear contenedor de toast si no existe
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
}

// ===== MANEJO DE EVENTOS =====

/**
 * Configura event listeners globales
 */
function setupGlobalEventListeners() {
    // Búsqueda en tiempo real
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Manejo de teclas globales
    document.addEventListener('keydown', (e) => {
        // ESC para cerrar modales
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Ctrl/Cmd + K para búsqueda
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
}

/**
 * Maneja el envío de filtros
 */
function handleFilterSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const filters = {};
    
    formData.forEach((value, key) => {
        if (value && value !== 'Todos') {
            filters[key] = value;
        }
    });
    
    // Aplicar filtros
    applyFilters(filters);
    
    // Mostrar notificación
    showToast('Filtros aplicados correctamente', 'success');
}

/**
 * Maneja el filtro de fechas
 */
function handleDateFilterSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const dateFrom = formData.get('date-from');
    const dateTo = formData.get('dateTo');
    
    if (dateFrom && dateTo) {
        const dateFilter = {
            type: 'date-range',
            from: dateFrom,
            to: dateTo,
            display: `${dateFrom} a ${dateTo}`
        };
        
        addFilter('date-range', dateFilter);
        showToast('Filtro de fecha aplicado', 'success');
        
        // Limpiar formulario
        e.target.reset();
    } else {
        showToast('Por favor selecciona ambas fechas', 'warning');
    }
}

/**
 * Maneja la búsqueda
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm.length === 0) {
        // Mostrar todas las filas si no hay término de búsqueda
        showAllTableRows();
    } else {
        // Aplicar búsqueda
        applySearch(searchTerm);
    }
    
    updateResultsCount();
}

/**
 * Maneja la acción de envío
 */
function handleSendAction() {
    if (AppState.selectedRows.size === 0) {
        showToast('Por favor selecciona al menos una fila', 'warning');
        return;
    }
    
    // Mostrar modal de confirmación
    showConfirmSendModal();
}

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Navega a una página específica
 */
function navigateToPage(page) {
    AppState.currentPage = page;
    
    // Actualizar URL sin recargar la página
    history.pushState({ page }, '', `/${page}`);
    
    // Actualizar navegación activa
    updateActiveNavigation(page);
    
    // Cargar contenido de la página
    loadPageContent(page);
}

/**
 * Actualiza la navegación activa
 */
function updateActiveNavigation(page) {
    // Actualizar enlaces de navegación
    document.querySelectorAll('.nav-link, .sidebar-nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
}

/**
 * Aplica filtros a la tabla
 */
function applyFilters(filters) {
    AppState.activeFilters.clear();
    
    Object.entries(filters).forEach(([key, value]) => {
        AppState.activeFilters.set(key, value);
    });
    
    // Aplicar filtros a la tabla
    filterTableRows();
    
    // Actualizar chips de filtros
    updateFilterChips();
}

/**
 * Filtra las filas de la tabla
 */
function filterTableRows() {
    const rows = document.querySelectorAll('tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        let shouldShow = true;
        
        // Aplicar cada filtro activo
        AppState.activeFilters.forEach((value, key) => {
            if (!shouldShow) return;
            
            const cellValue = getCellValue(row, key);
            if (!cellValue.includes(value)) {
                shouldShow = false;
            }
        });
        
        // Mostrar u ocultar fila
        row.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount++;
    });
    
    updateResultsCount(visibleCount);
}

/**
 * Obtiene el valor de una celda de la tabla
 */
function getCellValue(row, key) {
    const cellIndex = getCellIndex(key);
    if (cellIndex !== -1) {
        return row.cells[cellIndex]?.textContent || '';
    }
    return '';
}

/**
 * Obtiene el índice de la columna por clave
 */
function getCellIndex(key) {
    const columnMap = {
        'cuit': 3,
        'ieric': 2,
        'legajo': 1,
        'estado-filtro': 5,
        'giro': 4
    };
    
    return columnMap[key] || -1;
}

/**
 * Aplica búsqueda a la tabla
 */
function applySearch(searchTerm) {
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const shouldShow = text.includes(searchTerm);
        row.style.display = shouldShow ? '' : 'none';
    });
}

/**
 * Muestra todas las filas de la tabla
 */
function showAllTableRows() {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        row.style.display = '';
    });
}

/**
 * Actualiza el botón de envío
 */
function updateSendButton() {
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        sendButton.disabled = AppState.selectedRows.size === 0;
    }
}

/**
 * Actualiza el contador de resultados
 */
function updateResultsCount(visibleCount = null) {
    const countElement = document.querySelector('.results-count');
    if (countElement) {
        if (visibleCount === null) {
            visibleCount = document.querySelectorAll('tbody tr:not([style*="display: none"])').length;
        }
        
        const totalRows = document.querySelectorAll('tbody tr').length;
        countElement.textContent = `Mostrando 1 a ${visibleCount} de ${totalRows} resultados`;
    }
}

/**
 * Limpia todos los filtros
 */
function clearAllFilters() {
    AppState.activeFilters.clear();
    showAllTableRows();
    updateFilterChips();
    updateResultsCount();
    
    // Limpiar formularios
    clearFilterForms();
    
    showToast('Todos los filtros han sido limpiados', 'info');
}

/**
 * Limpia los formularios de filtros
 */
function clearFilterForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'date') {
                input.value = '';
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            } else {
                input.value = '';
            }
        });
    });
}

/**
 * Carga datos iniciales
 */
function loadInitialData() {
    // Aquí se cargarían los datos desde la API
    console.log('📊 Loading initial data...');
    
    // Simular carga de datos
    setTimeout(() => {
        console.log('✅ Initial data loaded');
        updateResultsCount();
    }, 1000);
}

/**
 * Carga el contenido de una página
 */
function loadPageContent(page) {
    console.log(`📄 Loading page: ${page}`);
    
    // Aquí se cargaría el contenido específico de la página
    // Por ahora solo actualizamos el título
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = getPageTitle(page);
    }
}

/**
 * Obtiene el título de la página
 */
function getPageTitle(page) {
    const titles = {
        'legales': 'Legales',
        'fiscalizacion': 'Fiscalización',
        'cobranzas': 'Cobranzas',
        'auditoria': 'Auditoría',
        'dashboard': 'Dashboard'
    };
    
    return titles[page] || 'Página';
}

/**
 * Función debounce para optimizar búsquedas
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== EXPORTAR FUNCIONES PARA USO GLOBAL =====
window.IERIC = {
    navigateToPage,
    showToast,
    openModal,
    closeModal,
    applyFilters,
    clearAllFilters
};
