const menuItems = {
  items: [
    {
      id: 'main',
      title: 'Principal',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'feather icon-home',
          url: '/dashboard',
          roles: ['ADMIN', 'VENDEDOR']
        },
        {
          id: 'pos',
          title: 'Punto de Venta',
          type: 'item',
          icon: 'feather icon-shopping-cart',
          url: '/pos',
          roles: ['ADMIN', 'VENDEDOR', 'CAJERO']
        }
      ]
    },
    {
      id: 'catalog',
      title: 'Catálogo',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'products',
          title: 'Productos',
          type: 'item',
          icon: 'feather icon-package',
          url: '/products',
          roles: ['ADMIN', 'VENDEDOR']
        },
        {
          id: 'categories',
          title: 'Categorías',
          type: 'item',
          icon: 'feather icon-folder',
          url: '/categories',
          roles: ['ADMIN', 'VENDEDOR']
        },
        {
          id: 'inventory',
          title: 'Inventario',
          type: 'item',
          icon: 'feather icon-layers',
          url: '/inventory',
          roles: ['ADMIN']
        }
      ]
    },
    {
      id: 'sales',
      title: 'Ventas',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'sales-history',
          title: 'Historial de Ventas',
          type: 'item',
          icon: 'feather icon-file-text',
          url: '/sales',
          roles: ['ADMIN', 'VENDEDOR']
        },
        {
          id: 'clients',
          title: 'Clientes',
          type: 'item',
          icon: 'feather icon-user',
          url: '/clients',
          roles: ['ADMIN', 'VENDEDOR']
        },
        {
          id: 'segmentation',
          title: 'Segmentación IA',
          type: 'item',
          icon: 'feather icon-cpu',
          url: '/segmentation',
          roles: ['ADMIN']
        },
        {
          id: 'reports',
          title: 'Reportes',
          type: 'item',
          icon: 'feather icon-bar-chart-2',
          url: '/reports',
          roles: ['ADMIN']
        }
      ]
    },
    {
      id: 'ecommerce',
      title: 'Tienda Online',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'pedidos-online',
          title: 'Pedidos Online',
          type: 'item',
          icon: 'feather icon-shopping-bag',
          url: '/ecommerce/pedidos',
          roles: ['ADMIN']
        },
        {
          id: 'banners',
          title: 'Banners',
          type: 'item',
          icon: 'feather icon-image',
          url: '/ecommerce/banners',
          roles: ['ADMIN']
        },
        {
          id: 'codigos-promo',
          title: 'Códigos Promo',
          type: 'item',
          icon: 'feather icon-percent',
          url: '/ecommerce/codigos-promo',
          roles: ['ADMIN']
        },
        {
          id: 'zonas-envio',
          title: 'Zonas de Envío',
          type: 'item',
          icon: 'feather icon-truck',
          url: '/ecommerce/zonas-envio',
          roles: ['ADMIN']
        },
        {
          id: 'clientes-app',
          title: 'Clientes App',
          type: 'item',
          icon: 'feather icon-users',
          url: '/ecommerce/clientes-app',
          roles: ['ADMIN']
        }
      ]
    },
    {
      id: 'admin',
      title: 'Administración',
      type: 'group',
      icon: 'icon-support',
      children: [
        {
          id: 'users',
          title: 'Usuarios',
          type: 'item',
          icon: 'feather icon-users',
          url: '/users',
          roles: ['ADMIN']
        },
        {
          id: 'settings',
          title: 'Configuración',
          type: 'item',
          icon: 'feather icon-settings',
          url: '/settings',
          roles: ['ADMIN']
        }
      ]
    }
  ]
};

export default menuItems;
