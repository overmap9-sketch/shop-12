import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch } from '@/front/src/app/hooks';
import { initializeTheme } from '@/front/src/features/theme-switcher/themeSlice';
import { fetchCart } from '@/front/src/features/cart/cartSlice';
import { fetchFavourites } from '@/front/src/features/favourites/favouritesSlice';
import { initializeCurrency } from '@/front/src/features/currency/currencySlice';

// Layout components
import { Header } from '@/front/src/widgets/header/Header';
import { Footer } from '@/front/src/widgets/footer/Footer';
import { Toaster } from '@/front/src/components/ui/toaster';
import { ErrorBoundary } from '@/front/src/components/ErrorBoundary';

// Pages
import { Home } from '@/front/src/pages/home/Home';
import NotFound from '@/front/src/pages/NotFound';
import { Login } from '@/front/src/pages/auth/Login';
import { Register } from '@/front/src/pages/auth/Register';
import { Profile } from '@/front/src/pages/profile/Profile';
import { Cart } from '@/front/src/pages/cart/Cart';
import { Catalog } from '@/front/src/pages/catalog/Catalog';
import { Favourites } from '@/front/src/pages/favourites/Favourites';
import { ProductDetail } from '@/front/src/pages/product/ProductDetail';
import { Categories } from '@/front/src/pages/categories/Categories';

// Placeholder pages (will be implemented later)
import { PlaceholderPage } from '@/front/src/pages/PlaceholderPage';

// Admin Pages
import {
  AdminLayout,
  AdminLogin,
  AdminDashboard,
  AdminProducts,
  AdminCategories,
  AdminUsers,
  AdminOrders,
  AdminSettings,
  AdminContacts,
  AdminShipping,
  AdminCoupons,
  AdminBulkUpdate
} from '@/front/src/pages/admin';
import { ProductForm as AdminProductForm } from '@/front/src/pages/admin/ProductForm';
import { CategoryForm as AdminCategoryForm } from '@/front/src/pages/admin/CategoryForm';
import { AdminAuthGuard } from '@/front/src/components/admin/ProtectedAdminRoute';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize app state
    dispatch(initializeTheme());

    // Initialize mock data with a slight delay to avoid blocking initial render

    // Initialize Redux state after mock data is ready
    setTimeout(() => {
      dispatch(fetchCart());
      dispatch(fetchFavourites());
      dispatch(initializeCurrency());
    }, 200);
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Routes>
        {/* Admin Routes - Separate Layout */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminAuthGuard>
            <AdminLayout />
          </AdminAuthGuard>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/new" element={<AdminCategoryForm />} />
          <Route path="categories/:id/edit" element={<AdminCategoryForm />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="shipping" element={<AdminShipping />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="bulk-update" element={<AdminBulkUpdate />} />
        </Route>

        {/* Shop Routes - Main Layout */}
        <Route path="/*" element={
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/favourites" element={<Favourites />} />
                <Route path="/checkout" element={<PlaceholderPage title="Checkout" />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<PlaceholderPage title="Order History" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create-product" element={<PlaceholderPage title="Create Product" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </div>
        } />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
