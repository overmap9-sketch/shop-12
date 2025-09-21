import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/front/src/app-core/store';
import { SimpleThemeProvider } from '@/front/src/shared/themes/SimpleThemeProvider';
import { ErrorBoundary } from '@/front/src/components/ErrorBoundary';

// Public Pages
import { Home } from '@/front/src/pages/home/Home';
import { Catalog } from '@/front/src/pages/catalog/Catalog';
import { Categories } from '@/front/src/pages/categories/Categories';
import { ProductDetail } from '@/front/src/pages/product/ProductDetail';
import { Cart } from '@/front/src/pages/cart/Cart';
import { Favourites } from '@/front/src/pages/favourites/Favourites';
import { Profile } from '@/front/src/pages/profile/Profile';
import { Login, Register } from '@/front/src/pages/auth';
import { NotFound } from '@/front/src/pages/NotFound';

// Admin Pages
import {
  AdminLayout,
  AdminLogin,
  AdminDashboard,
  AdminProducts,
  AdminCategories,
  AdminUsers,
  AdminOrders
} from '@/front/src/pages/admin';
import { AdminAuthGuard } from '@/front/src/components/admin/ProtectedAdminRoute';

// Layout Components
import { Header } from '@/front/src/widgets/header/Header';
import { Footer } from '@/front/src/widgets/footer/Footer';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AdminApp() {
  return (
    <Provider store={store}>
      <SimpleThemeProvider>
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={
                  <AdminAuthGuard>
                    <AdminLayout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="analytics" element={<div>Analytics Page (Coming Soon)</div>} />
                        <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                      </Routes>
                    </AdminLayout>
                  </AdminAuthGuard>
                } />

                {/* Public Routes */}
                <Route path="/*" element={
                  <PublicLayout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/favourites" element={<Favourites />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </PublicLayout>
                } />
              </Routes>
            </div>
          </Router>
        </ErrorBoundary>
      </SimpleThemeProvider>
    </Provider>
  );
}

export default AdminApp;
