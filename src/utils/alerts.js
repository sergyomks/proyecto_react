import Swal from 'sweetalert2';

/**
 * Utilidades de alertas con SweetAlert2
 */

// Configuración base
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
});

/**
 * Mostrar confirmación antes de una acción
 * @param {Object} options - { title, text, confirmText, cancelText, icon }
 * @returns {Promise<boolean>}
 */
export const confirmAction = async ({
  title = '¿Estás seguro?',
  text = '',
  confirmText = 'Sí, continuar',
  cancelText = 'Cancelar',
  icon = 'warning',
  confirmButtonColor = '#4680ff',
  cancelButtonColor = '#6c757d'
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  });
  return result.isConfirmed;
};

/**
 * Confirmación de eliminación/desactivación
 * @param {string} itemName - Nombre del item a eliminar
 * @returns {Promise<boolean>}
 */
export const confirmDelete = async (itemName) => {
  return confirmAction({
    title: '¿Desactivar este elemento?',
    text: `Se desactivará "${itemName}". Podrás reactivarlo después.`,
    confirmText: 'Sí, desactivar',
    icon: 'warning',
    confirmButtonColor: '#dc3545'
  });
};

/**
 * Confirmación de eliminación permanente
 * @param {string} itemName - Nombre del item
 * @returns {Promise<boolean>}
 */
export const confirmDeletePermanent = async (itemName) => {
  return confirmAction({
    title: '¿Eliminar permanentemente?',
    text: `Se eliminará "${itemName}" de forma permanente. Esta acción no se puede deshacer.`,
    confirmText: 'Sí, eliminar',
    icon: 'error',
    confirmButtonColor: '#dc3545'
  });
};

/**
 * Confirmación de vaciar carrito
 * @returns {Promise<boolean>}
 */
export const confirmClearCart = async () => {
  return confirmAction({
    title: '¿Vaciar el carrito?',
    text: 'Se eliminarán todos los productos del carrito.',
    confirmText: 'Sí, vaciar',
    icon: 'question',
    confirmButtonColor: '#ffc107'
  });
};

/**
 * Confirmación de anulación
 * @param {string} itemName - Nombre del item
 * @returns {Promise<{confirmed: boolean, reason: string}>}
 */
export const confirmAnular = async (itemName) => {
  const result = await Swal.fire({
    title: '¿Anular esta venta?',
    text: `Se anulará la venta "${itemName}".`,
    icon: 'warning',
    input: 'text',
    inputLabel: 'Motivo de anulación',
    inputPlaceholder: 'Ingresa el motivo...',
    inputValidator: (value) => {
      if (!value) return 'Debes ingresar un motivo';
    },
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Anular',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });

  return {
    confirmed: result.isConfirmed,
    reason: result.value || ''
  };
};

/**
 * Mostrar éxito
 * @param {string} title
 * @param {string} text
 */
export const showSuccess = (title = '¡Éxito!', text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#4680ff',
    timer: 2000,
    timerProgressBar: true
  });
};

/**
 * Mostrar error
 * @param {string} title
 * @param {string} text
 */
export const showError = (title = 'Error', text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#dc3545'
  });
};

/**
 * Mostrar información
 * @param {string} title
 * @param {string} text
 */
export const showInfo = (title, text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonColor: '#4680ff'
  });
};

/**
 * Toast de éxito
 * @param {string} message
 */
export const toastSuccess = (message) => {
  Toast.fire({
    icon: 'success',
    title: message
  });
};

/**
 * Toast de error
 * @param {string} message
 */
export const toastError = (message) => {
  Toast.fire({
    icon: 'error',
    title: message
  });
};

/**
 * Toast de información
 * @param {string} message
 */
export const toastInfo = (message) => {
  Toast.fire({
    icon: 'info',
    title: message
  });
};

/**
 * Mostrar loading
 * @param {string} title
 */
export const showLoading = (title = 'Procesando...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

/**
 * Cerrar loading
 */
export const hideLoading = () => {
  Swal.close();
};

export default {
  confirmAction,
  confirmDelete,
  confirmDeletePermanent,
  confirmClearCart,
  confirmAnular,
  showSuccess,
  showError,
  showInfo,
  toastSuccess,
  toastError,
  toastInfo,
  showLoading,
  hideLoading
};
