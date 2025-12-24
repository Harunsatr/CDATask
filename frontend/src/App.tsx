import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MerchantDashboardPage from './pages/MerchantDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { Role } from './types';

// Role-based access control
const customerRoles: Role[] = ['customer'];
const merchantRoles: Role[] = ['merchant'];
const adminRoles: Role[] = ['admin'];
const allAuthenticatedRoles: Role[] = ['customer', 'merchant', 'admin'];

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route
          path="/booking"
          element={<ProtectedRoute roles={allAuthenticatedRoles} element={<BookingPage />} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute roles={customerRoles} element={<DashboardPage />} />}
        />
        <Route
          path="/merchant"
          element={<ProtectedRoute roles={merchantRoles} element={<MerchantDashboardPage />} />}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute roles={adminRoles} element={<AdminDashboardPage />} />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
