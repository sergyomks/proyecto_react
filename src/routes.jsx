import React, { Suspense, Fragment, lazy } from 'react';
import { Routes, Navigate, Route } from 'react-router-dom';

import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

// Componente para redirección por defecto según rol
const DefaultRedirect = () => {
  const { user } = useAuth();
  const defaultRoutes = {
    ADMIN: '/dashboard',
    VENDEDOR: '/dashboard',
    CAJERO: '/pos'
  };
  const defaultRoute = defaultRoutes[user?.rol] || '/dashboard';
  return <Navigate to={defaultRoute} replace />;
};

// Lazy load pages
const Login = lazy(() => import('./views/auth/Login'));
const Dashboard = lazy(() => import('./views/dashboard'));
const POS = lazy(() => import('./views/pos/POS'));
const ProductList = lazy(() => import('./views/products/ProductList'));
const CategoryList = lazy(() => import('./views/categories/CategoryList'));
const UserList = lazy(() => import('./views/users/UserList'));
const SalesList = lazy(() => import('./views/sales/SalesList'));
const Reports = lazy(() => import('./views/reports/Reports'));
const ClientList = lazy(() => import('./views/clients/ClientList'));
const InventoryList = lazy(() => import('./views/inventory/InventoryList'));
const Settings = lazy(() => import('./views/settings/Settings'));

// Ecommerce
const PedidosList = lazy(() => import('./views/ecommerce/PedidosList'));
const BannersList = lazy(() => import('./views/ecommerce/BannersList'));
const CodigosPromoList = lazy(() => import('./views/ecommerce/CodigosPromoList'));
const ZonasEnvioList = lazy(() => import('./views/ecommerce/ZonasEnvioList'));
const ClientesAppList = lazy(() => import('./views/ecommerce/ClientesAppList'));
const Segmentation = lazy(() => import('./views/segmentation'));

const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Element = route.element;

        return (
          <Route
            key={i}
            path={route.path}
            exact={route.exact}
            element={
              <Guard>
                <Layout>{route.routes ? renderRoutes(route.routes) : <Element props={true} />}</Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);

export const routes = [
  {
    exact: 'true',
    path: '/login',
    element: Login
  },
  {
    path: '*',
    layout: AdminLayout,
    guard: ProtectedRoute,
    routes: [
      {
        exact: 'true',
        path: '/dashboard',
        element: Dashboard
      },
      {
        exact: 'true',
        path: '/pos',
        element: POS
      },
      {
        exact: 'true',
        path: '/products',
        element: ProductList
      },
      {
        exact: 'true',
        path: '/categories',
        element: CategoryList
      },
      {
        exact: 'true',
        path: '/users',
        element: UserList
      },
      {
        exact: 'true',
        path: '/sales',
        element: SalesList
      },
      {
        exact: 'true',
        path: '/reports',
        element: Reports
      },
      {
        exact: 'true',
        path: '/clients',
        element: ClientList
      },
      {
        exact: 'true',
        path: '/inventory',
        element: InventoryList
      },
      {
        exact: 'true',
        path: '/settings',
        element: Settings
      },
      // Ecommerce
      {
        exact: 'true',
        path: '/ecommerce/pedidos',
        element: PedidosList
      },
      {
        exact: 'true',
        path: '/ecommerce/banners',
        element: BannersList
      },
      {
        exact: 'true',
        path: '/ecommerce/codigos-promo',
        element: CodigosPromoList
      },
      {
        exact: 'true',
        path: '/ecommerce/zonas-envio',
        element: ZonasEnvioList
      },
      {
        exact: 'true',
        path: '/ecommerce/clientes-app',
        element: ClientesAppList
      },
      {
        exact: 'true',
        path: '/segmentation',
        element: Segmentation
      },
      {
        path: '*',
        exact: 'true',
        element: DefaultRedirect
      }
    ]
  }
];

export default renderRoutes;
