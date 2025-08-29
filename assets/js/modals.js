/**
 * IERIC - Sistema de Gestión
 * Módulo de Modales y Tabs
 * 
 * @author IERIC Team
 * @version 1.0.0
 * @license MIT
 */

// ===== GESTIÓN DE MODALES =====

/**
 * Abre un modal específico
 * @param {string} modalId - ID del modal a abrir
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal con ID "${modalId}" no encontrado`);
        return;
    }
    
    // Cerrar otros modales abiertos
    closeAllModals();
    
    // Mostrar el modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Enfocar el primer elemento interactivo
    focusFirstInteractiveElement(modal);
    
    // Disparar evento personalizado
    modal.dispatchEvent(new CustomEvent('modal:opened', { detail: { modalId } }));
    
    console.log(`📱 Modal abierto: ${modalId}`);
}

/**
 * Cierra un modal específico
 * @param {string} modalId - ID del modal a cerrar
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal con ID "${modalId}" no encontrado`);
        return;
    }
    
    // Ocultar el modal
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Disparar evento personalizado
    modal.dispatchEvent(new CustomEvent('modal:closed', { detail: { modalId } }));
    
    console.log(`📱 Modal cerrado: ${modalId}`);
}

/**
 * Cierra todos los modales abiertos
 */
function closeAllModals() {
    const openModals = document.querySelectorAll('.modal.active');
    openModals.forEach(modal => {
        closeModal(modal.id);
    });
}

/**
 * Enfoca el primer elemento interactivo del modal
 * @param {HTMLElement} modal - Elemento del modal
 */
function focusFirstInteractiveElement(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
}

// ===== SISTEMA DE TABS =====

/**
 * Abre una pestaña específica
 * @param {Event} evt - Evento del clic
 * @param {string} tabName - Nombre de la pestaña
 * @param {string} iconName - Nombre del ícono
 * @param {HTMLElement} element - Elemento del botón de la pestaña
 */
function openTab(evt, tabName, iconName, element) {
    // Ocultar todos los contenidos de pestañas
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    // Remover clases activas de todos los botones de pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active-tab', 'bg-white', 'text-[var(--primary)]');
        button.classList.add('bg-gray-200', 'text-[var(--text-secondary)]');
        
        // Restaurar ícono por defecto
        const icon = button.querySelector('.material-icons');
        if (icon) {
            icon.textContent = 'folder';
        }
    });
    
    // Mostrar el contenido de la pestaña seleccionada
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.style.display = 'block';
        targetTab.classList.add('active');
    }
    
    // Activar el botón de la pestaña seleccionada
    const targetButton = evt ? evt.currentTarget : element;
    if (targetButton) {
        targetButton.classList.add('active-tab', 'bg-white', 'text-[var(--primary)]');
        targetButton.classList.remove('bg-gray-200', 'text-[var(--text-secondary)]');
        
        // Cambiar ícono
        const icon = targetButton.querySelector('.material-icons');
        if (icon && iconName) {
            icon.textContent = iconName;
        }
    }
    
    // Disparar evento personalizado
    if (targetTab) {
        targetTab.dispatchEvent(new CustomEvent('tab:opened', { 
            detail: { tabName, iconName } 
        }));
    }
    
    console.log(`📑 Pestaña abierta: ${tabName}`);
}

// ===== MODALES ESPECÍFICOS =====

/**
 * Abre el modal de exportación
 */
function openExportModal() {
    openModal('exportModal');
}

/**
 * Abre el modal de cambio de estado
 */
function openChangeStatusModal() {
    openModal('cambioEstadoModal');
}

/**
 * Abre el modal de giro
 */
function openTransferModal() {
    openModal('girarModal');
}

/**
 * Abre el modal de historial
 */
function openHistoryModal() {
    openModal('historyModal');
}

/**
 * Abre el modal de vista de acta
 */
function openViewActaModal() {
    openModal('viewActaModal');
    
    // Inicializar la primera pestaña por defecto
    setTimeout(() => {
        openTab(null, 'legajoTab', 'folder_open', document.querySelector('.tab-button'));
    }, 100);
}

/**
 * Abre el modal de confirmación de envío
 */
function openConfirmSendModal() {
    const selectedCount = AppState.selectedRows.size;
    const countElement = document.getElementById('selectedCount');
    
    if (countElement) {
        countElement.textContent = `${selectedCount} acta${selectedCount > 1 ? 's' : ''} seleccionada${selectedCount > 1 ? 's' : ''}`;
    }
    
    openModal('confirmSendModal');
}

/**
 * Cierra el modal de confirmación de envío
 */
function closeConfirmSendModal() {
    closeModal('confirmSendModal');
}

// ===== FUNCIONES DE ACCIÓN DE MODALES =====

/**
 * Confirma el envío de actas
 */
function confirmSend() {
    const selectedRows = Array.from(AppState.selectedRows);
    const destino = document.getElementById('destino')?.value;
    
    if (selectedRows.length === 0) {
        showToast('No hay actas seleccionadas', 'error');
        return;
    }
    
    if (!destino) {
        showToast('Por favor selecciona un destino', 'warning');
        return;
    }
    
    // Cerrar modal
    closeConfirmSendModal();
    
    // Mostrar notificación de envío en progreso
    showToast(`Enviando ${selectedRows.length} legajo${selectedRows.length > 1 ? 's' : ''} a ${destino}...`, 'info');
    
    // Simular envío
    setTimeout(() => {
        // Mostrar notificación de éxito
        const destinoDisplay = getDestinoDisplay(destino);
        showToast(`¡Se enviaron ${selectedRows.length} legajo${selectedRows.length > 1 ? 's' : ''} a ${destinoDisplay} exitosamente!`, 'success');
        
        // Limpiar selección
        clearSelection();
        
        // Actualizar estado
        updateTableAfterSend();
    }, 2000);
}

/**
 * Obtiene el nombre de visualización del destino
 * @param {string} destino - Código del destino
 * @returns {string} Nombre de visualización
 */
function getDestinoDisplay(destino) {
    const destinos = {
        'legales': 'Legales',
        'fiscalizacion': 'Fiscalización',
        'representacion': 'Representación',
        'imr': 'IMR',
        'auditoria': 'Auditoría'
    };
    
    return destinos[destino] || destino;
}

/**
 * Limpia la selección de filas
 */
function clearSelection() {
    // Desmarcar checkboxes
    const rowCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Desmarcar checkbox "Seleccionar todo"
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    
    // Limpiar estado
    AppState.selectedRows.clear();
    
    // Actualizar botón de envío
    updateSendButton();
}

/**
 * Actualiza la tabla después del envío
 */
function updateTableAfterSend() {
    // Aquí se podrían hacer actualizaciones adicionales
    // como remover las filas enviadas o cambiar su estado
    console.log('🔄 Tabla actualizada después del envío');
}

// ===== FUNCIONES DE EXPORTACIÓN =====

/**
 * Exporta datos a PDF
 */
function exportToPDF() {
    showToast('Exportando a PDF...', 'info');
    
    // Aquí iría la lógica real de exportación a PDF
    setTimeout(() => {
        showToast('PDF exportado exitosamente', 'success');
        closeModal('exportModal');
    }, 1500);
}

/**
 * Exporta datos a CSV
 */
function exportToCSV() {
    showToast('Exportando a CSV...', 'info');
    
    // Aquí iría la lógica real de exportación a CSV
    setTimeout(() => {
        showToast('CSV exportado exitosamente', 'success');
        closeModal('exportModal');
    }, 1500);
}

/**
 * Exporta datos a JSON
 */
function exportToJSON() {
    showToast('Exportando a JSON...', 'info');
    
    // Aquí iría la lógica real de exportación a JSON
    setTimeout(() => {
        showToast('JSON exportado exitosamente', 'success');
        closeModal('exportModal');
    }, 1500);
}

// ===== VALIDACIÓN DE FORMULARIOS =====

/**
 * Valida un campo de formulario
 * @param {HTMLElement} field - Campo a validar
 * @returns {boolean} True si es válido, false en caso contrario
 */
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Validaciones específicas por tipo de campo
    if (field.type === 'number' && value && isNaN(value)) {
        isValid = false;
        errorMessage = 'Por favor ingresa un número válido';
    }
    
    if (field.required && !value) {
        isValid = false;
        errorMessage = 'Este campo es obligatorio';
    }
    
    // Aplicar estilos de validación
    if (!isValid) {
        field.classList.add('border-red-500');
        showFieldError(field, errorMessage);
    } else {
        field.classList.remove('border-red-500');
        hideFieldError(field);
    }
    
    return isValid;
}

/**
 * Muestra un mensaje de error para un campo
 * @param {HTMLElement} field - Campo del formulario
 * @param {string} message - Mensaje de error
 */
function showFieldError(field, message) {
    // Remover error anterior si existe
    hideFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-xs mt-1';
    errorDiv.textContent = message;
    errorDiv.id = `${field.id}-error`;
    
    field.parentNode.appendChild(errorDiv);
}

/**
 * Oculta el mensaje de error de un campo
 * @param {HTMLElement} field - Campo del formulario
 */
function hideFieldError(field) {
    const existingError = document.getElementById(`${field.id}-error`);
    if (existingError) {
        existingError.remove();
    }
}

// ===== INICIALIZACIÓN DE MODALES =====

/**
 * Inicializa todos los modales
 */
function initializeAllModals() {
    // Configurar event listeners para botones que abren modales
    setupModalTriggers();
    
    // Configurar validación de formularios
    setupFormValidation();
    
    console.log('🔧 Modales inicializados');
}

/**
 * Configura los triggers de modales
 */
function setupModalTriggers() {
    // Botones de exportación
    const exportButtons = document.querySelectorAll('[data-action="export-pdf"], [data-action="export-csv"], [data-action="export-json"]');
    exportButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const action = button.dataset.action;
            
            switch (action) {
                case 'export-pdf':
                    exportToPDF();
                    break;
                case 'export-csv':
                    exportToCSV();
                    break;
                case 'export-json':
                    exportToJSON();
                    break;
            }
        });
    });
    
    // Botones de acción de tabla
    const actionButtons = document.querySelectorAll('[data-action="change-status"], [data-action="transfer"], [data-action="view"], [data-action="history"]');
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const action = button.dataset.action;
            
            switch (action) {
                case 'change-status':
                    openChangeStatusModal();
                    break;
                case 'transfer':
                    openTransferModal();
                    break;
                case 'view':
                    openViewActaModal();
                    break;
                case 'history':
                    openHistoryModal();
                    break;
            }
        });
    });
}

/**
 * Configura la validación de formularios
 */
function setupFormValidation() {
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
    });
}

// ===== EXPORTAR FUNCIONES =====
window.ModalManager = {
    openModal,
    closeModal,
    closeAllModals,
    openTab,
    openExportModal,
    openChangeStatusModal,
    openTransferModal,
    openHistoryModal,
    openViewActaModal,
    openConfirmSendModal,
    closeConfirmSendModal,
    confirmSend,
    exportToPDF,
    exportToCSV,
    exportToJSON,
    validateField,
    initializeAllModals
};
