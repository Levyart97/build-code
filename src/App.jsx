import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import useAuth from '@/hooks/useAuth';
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

// Placeholder untuk dashboard, ganti dengan komponen Anda
const KabagDashboard = () => <div className="p-4 text-white"><h1>Dashboard Kabag</h1><LogoutButton/></div>;
const MonitoringDashboard = () => <div className="p-4 text-white"><h1>Dashboard Monitoring</h1><LogoutButton/></div>;
const StaffDashboard = () => <div className="p-4 text-white"><h1>Dashboard Staff</h1><LogoutButton/></div>;
const TbDashboard = () => <div className="p-4 text-white"><h1>Dashboard TB</h1><LogoutButton/></div>;
const AdminDashboard = () => <div className="p-4 text-white"><h1>Dashboard Admin</h1><LogoutButton/></div>;
const NotFoundPage = () => <div className="p-4 text-white"><h1>404 - Halaman Tidak Ditemukan</h1><LogoutButton/></div>;

const LogoutButton = () => {
  const { logout } = useAuth();
  return <Button onClick={logout} className="mt-4 bg-red-500 hover:bg-red-600">Logout</Button>;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900"><div className="text-white font-semibold text-lg">Memuat Aplikasi ACTRA...</div></div>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user ? `/${user.role.toLowerCase()}` : '/'} replace />} />

        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['Kabag']} />}>
          <Route path="/kabag" element={<KabagDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['Monitoring']} />}>
          <Route path="/monitoring" element={<MonitoringDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['Staff']} />}>
          <Route path="/staff" element={<StaffDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['TB']} />}>
          <Route path="/tb" element={<TbDashboard />} />
        </Route>
        
        <Route path="/" element={ <RootRedirect /> } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900"><div className="text-white font-semibold text-lg">Memuat...</div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role.toLowerCase()) {
    case 'kabag': return <Navigate to="/kabag" replace />;
    case 'monitoring': return <Navigate to="/monitoring" replace />;
    case 'staff': return <Navigate to="/staff" replace />;
    case 'tb': return <Navigate to="/tb" replace />;
    case 'admin': return <Navigate to="/admin" replace />;
    default: return <Navigate to="/login" replace />; 
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;