/**
 * IERIC - Sistema de Gestión
 * Módulo de Utilidades y Helpers
 * 
 * @author IERIC Team
 * @version 1.0.0
 * @license MIT
 */

// ===== SISTEMA DE NOTIFICACIONES TOAST =====

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 * @param {number} duration - Duración en milisegundos
 */
function showToast(message, type = 'success', duration = CONFIG.TOAST_DURATION) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.error('Contenedor de toast no encontrado');
        return;
    }
    
    // Crear el toast
    const toast = createToastElement(message, type);
    
    // Agregar al contenedor
    toastContainer.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto-remover después del tiempo especificado
    setTimeout(() => {
        removeToast(toast);
    }, duration);
    
    console.log(`🍞 Toast mostrado: ${type} - ${message}`);
}

/**
 * Crea un elemento toast
 * @param {string} message - Mensaje del toast
 * @param {string} type - Tipo de toast
 * @returns {HTMLElement} Elemento toast creado
 */
function createToastElement(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Ícono según el tipo
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <span class="material-icons text-xl">${icon}</span>
        <span class="font-medium">${message}</span>
        <button class="toast-close" onclick="removeToast(this.parentElement)">
            <span class="material-icons text-sm">close</span>
        </button>
    `;
    
    return toast;
}

/**
 * Obtiene el ícono para el tipo de toast
 * @param {string} type - Tipo de toast
 * @returns {string} Nombre del ícono
 */
function getToastIcon(type) {
    const icons = {
        'success': 'check_circle',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };
    
    return icons[type] || 'info';
}

/**
 * Remueve un toast específico
 * @param {HTMLElement} toast - Elemento toast a remover
 */
function removeToast(toast) {
    if (!toast || !toast.parentElement) return;
    
    // Animar salida
    toast.classList.remove('show');
    
    // Remover después de la animación
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, CONFIG.ANIMATION_DURATION);
}

/**
 * Limpia todos los toasts
 */
function clearAllToasts() {
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        toastContainer.innerHTML = '';
    }
}

// ===== FUNCIONES DE VALIDACIÓN =====

/**
 * Valida si un email es válido
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida si un CUIT es válido
 * @param {string} cuit - CUIT a validar
 * @returns {boolean} True si es válido
 */
function isValidCUIT(cuit) {
    // Remover guiones y espacios
    const cleanCUIT = cuit.replace(/[-\s]/g, '');
    
    // Verificar longitud (11 dígitos)
    if (cleanCUIT.length !== 11) return false;
    
    // Verificar que sean solo números
    if (!/^\d+$/.test(cleanCUIT)) return false;
    
    // Aquí se podría agregar validación del dígito verificador
    // Por ahora solo validamos formato básico
    
    return true;
}

/**
 * Valida si un número de teléfono es válido
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si es válido
 */
function isValidPhone(phone) {
    // Remover espacios, guiones y paréntesis
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Verificar que tenga entre 10 y 15 dígitos
    return cleanPhone.length >= 10 && cleanPhone.length <= 15 && /^\d+$/.test(cleanPhone);
}

/**
 * Valida si una fecha es válida
 * @param {string} date - Fecha a validar (formato YYYY-MM-DD)
 * @returns {boolean} True si es válida
 */
function isValidDate(date) {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
}

/**
 * Valida si una fecha está en el futuro
 * @param {string} date - Fecha a validar
 * @returns {boolean} True si está en el futuro
 */
function isFutureDate(date) {
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dateObj > today;
}

// ===== FUNCIONES DE FORMATEO =====

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Moneda (ARS, USD, etc.)
 * @returns {string} Cantidad formateada
 */
function formatCurrency(amount, currency = 'ARS') {
    const formatter = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    });
    
    return formatter.format(amount);
}

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {string} locale - Locale para el formateo
 * @returns {string} Fecha formateada
 */
function formatDate(date, locale = 'es-AR') {
    const dateObj = new Date(date);
    
    const formatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return formatter.format(dateObj);
}

/**
 * Formatea una fecha y hora
 * @param {string|Date} date - Fecha a formatear
 * @param {string} locale - Locale para el formateo
 * @returns {string} Fecha y hora formateada
 */
function formatDateTime(date, locale = 'es-AR') {
    const dateObj = new Date(date);
    
    const formatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return formatter.format(dateObj);
}

/**
 * Formatea un CUIT con guiones
 * @param {string} cuit - CUIT sin formato
 * @returns {string} CUIT formateado
 */
function formatCUIT(cuit) {
    const cleanCUIT = cuit.replace(/[-\s]/g, '');
    
    if (cleanCUIT.length === 11) {
        return `${cleanCUIT.slice(0, 2)}-${cleanCUIT.slice(2, 10)}-${cleanCUIT.slice(10)}`;
    }
    
    return cuit;
}

/**
 * Formatea un número de teléfono
 * @param {string} phone - Teléfono sin formato
 * @returns {string} Teléfono formateado
 */
function formatPhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (cleanPhone.length === 10) {
        return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
    } else if (cleanPhone.length === 11) {
        return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
    }
    
    return phone;
}

// ===== FUNCIONES DE MANIPULACIÓN DE DATOS =====

/**
 * Clona un objeto de forma profunda
 * @param {*} obj - Objeto a clonar
 * @returns {*} Objeto clonado
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Combina múltiples objetos
 * @param {...Object} objects - Objetos a combinar
 * @returns {Object} Objeto combinado
 */
function mergeObjects(...objects) {
    return objects.reduce((result, obj) => {
        return { ...result, ...obj };
    }, {});
}

/**
 * Obtiene un valor anidado de un objeto
 * @param {Object} obj - Objeto base
 * @param {string} path - Ruta del valor (ej: 'user.profile.name')
 * @param {*} defaultValue - Valor por defecto si no se encuentra
 * @returns {*} Valor encontrado o valor por defecto
 */
function getNestedValue(obj, path, defaultValue = undefined) {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return defaultValue;
        }
    }
    
    return result;
}

/**
 * Establece un valor anidado en un objeto
 * @param {Object} obj - Objeto base
 * @param {string} path - Ruta del valor
 * @param {*} value - Valor a establecer
 * @returns {Object} Objeto modificado
 */
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return result;
}

// ===== FUNCIONES DE ARRAYS =====

/**
 * Agrupa elementos de un array por una clave
 * @param {Array} array - Array a agrupar
 * @param {string} key - Clave para agrupar
 * @returns {Object} Objeto con grupos
 */
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = item[key];
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(item);
        return groups;
    }, {});
}

/**
 * Ordena un array por múltiples criterios
 * @param {Array} array - Array a ordenar
 * @param {...Object} criteria - Criterios de ordenamiento
 * @returns {Array} Array ordenado
 */
function sortBy(array, ...criteria) {
    return array.sort((a, b) => {
        for (const criterion of criteria) {
            const { key, order = 'asc' } = criterion;
            const aVal = getNestedValue(a, key);
            const bVal = getNestedValue(b, key);
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

/**
 * Filtra un array por múltiples condiciones
 * @param {Array} array - Array a filtrar
 * @param {...Object} filters - Filtros a aplicar
 * @returns {Array} Array filtrado
 */
function filterBy(array, ...filters) {
    return array.filter(item => {
        return filters.every(filter => {
            const { key, value, operator = 'equals' } = filter;
            const itemValue = getNestedValue(item, key);
            
            switch (operator) {
                case 'equals':
                    return itemValue === value;
                case 'contains':
                    return String(itemValue).includes(String(value));
                case 'startsWith':
                    return String(itemValue).startsWith(String(value));
                case 'endsWith':
                    return String(itemValue).endsWith(String(value));
                case 'greaterThan':
                    return itemValue > value;
                case 'lessThan':
                    return itemValue < value;
                case 'in':
                    return Array.isArray(value) && value.includes(itemValue);
                default:
                    return true;
            }
        });
    });
}

// ===== FUNCIONES DE STRING =====

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
function capitalize(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Convierte un string a camelCase
 * @param {string} str - String a convertir
 * @returns {string} String en camelCase
 */
function toCamelCase(str) {
    return str.replace(/[-_\s]+(.)?/g, (match, chr) => {
        return chr ? chr.toUpperCase() : '';
    });
}

/**
 * Convierte un string a kebab-case
 * @param {string} str - String a convertir
 * @returns {string} String en kebab-case
 */
function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * Trunca un string a una longitud específica
 * @param {string} str - String a truncar
 * @param {number} length - Longitud máxima
 * @param {string} suffix - Sufijo a agregar
 * @returns {string} String truncado
 */
function truncate(str, length, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
}

// ===== FUNCIONES DE UTILIDAD GENERAL =====

/**
 * Genera un ID único
 * @returns {string} ID único
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Retrasa la ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Retraso en milisegundos
 * @returns {Promise} Promise que se resuelve después del retraso
 */
function delay(func, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(func());
        }, delay);
    });
}

/**
 * Verifica si un elemento está en el viewport
 * @param {HTMLElement} element - Elemento a verificar
 * @returns {boolean} True si está en el viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Scroll suave a un elemento
 * @param {HTMLElement|string} target - Elemento o selector
 * @param {Object} options - Opciones de scroll
 */
function smoothScrollTo(target, options = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
    };
    
    element.scrollIntoView({ ...defaultOptions, ...options });
}

// ===== EXPORTAR FUNCIONES =====
window.Utils = {
    // Toast
    showToast,
    removeToast,
    clearAllToasts,
    
    // Validación
    isValidEmail,
    isValidCUIT,
    isValidPhone,
    isValidDate,
    isFutureDate,
    
    // Formateo
    formatCurrency,
    formatDate,
    formatDateTime,
    formatCUIT,
    formatPhone,
    
    // Manipulación de datos
    deepClone,
    mergeObjects,
    getNestedValue,
    setNestedValue,
    
    // Arrays
    groupBy,
    sortBy,
    filterBy,
    
    // Strings
    capitalize,
    toCamelCase,
    toKebabCase,
    truncate,
    
    // Utilidades generales
    generateId,
    delay,
    isInViewport,
    smoothScrollTo
};
