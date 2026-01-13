/**
 * Filtra los items del menú según el rol del usuario
 * @param {Array} items - Array de grupos/items del menú
 * @param {string} userRole - Rol del usuario (ADMIN, VENDEDOR, CAJERO)
 * @returns {Array} Items filtrados según el rol
 */
export const filterMenuByRole = (items, userRole) => {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  if (!userRole) {
    return [];
  }

  return items
    .map((item) => {
      // Si el item tiene children (es un grupo), filtrar recursivamente
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuByRole(item.children, userRole);

        // Si no quedan hijos después del filtrado, ocultar el grupo
        if (filteredChildren.length === 0) {
          return null;
        }

        return {
          ...item,
          children: filteredChildren
        };
      }

      // Si el item no tiene propiedad roles, es visible para todos
      if (!item.roles || !Array.isArray(item.roles)) {
        return item;
      }

      // Verificar si el rol del usuario está en la lista de roles permitidos
      if (item.roles.includes(userRole)) {
        return item;
      }

      // El rol no tiene permiso, ocultar el item
      return null;
    })
    .filter((item) => item !== null);
};

export default filterMenuByRole;
