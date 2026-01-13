import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import renderRoutes, { routes } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.VITE_APP_BASE_NAME}>
      <AuthProvider>
        <CartProvider>{renderRoutes(routes)}</CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
