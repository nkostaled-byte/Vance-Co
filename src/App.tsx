import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/ui/Layout';
import { AlertNotification } from './components/ui/AlertNotification';

// Import pages
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Book } from './pages/Book';
import { Shop } from './pages/Shop';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

// Initialize React Query Client for central state management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public Marketing Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Workflows & Checkout Engines */}
              <Route path="/book" element={<Book />} />
              <Route path="/shop" element={<Shop />} />

              {/* Owner Admin & Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Catch-all fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          {/* Global Event Notification System Overlay */}
          <AlertNotification />
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}
