import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Landing from './pages/Landing';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import RetailerManagement from './pages/admin/RetailerManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import ReportManagement from './pages/admin/ReportManagement';

// Retailer pages
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import BrowseProducts from './pages/retailer/BrowseProducts';
import MyOrders from './pages/retailer/MyOrders';
import PlaceOrder from './pages/retailer/PlaceOrder';
import RetailerPayments from './pages/retailer/RetailerPayments';

// Shared pages
import Profile from './pages/Profile';

const RedirectByRole = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/retailer'} />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="retailers" element={<RetailerManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="payments" element={<PaymentManagement />} />
                <Route path="reports" element={<ReportManagement />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Retailer routes */}
              <Route path="/retailer" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<RetailerDashboard />} />
                <Route path="products" element={<BrowseProducts />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="place-order" element={<PlaceOrder />} />
                <Route path="payments" element={<RetailerPayments />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Root redirect */}
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<RedirectByRole />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </AuthProvider>
      </>
    </ThemeProvider>
  );
}

export default App;
