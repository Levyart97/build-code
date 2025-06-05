import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
        <div className="text-white text-xl font-semibold">Memuat data pengguna...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Pengguna tidak memiliki role yang diizinkan, arahkan ke halaman default atau 'tidak diizinkan'
    // Untuk sekarang, arahkan ke halaman utama mereka jika ada, atau login jika tidak spesifik
    console.warn(`User role ${user.role} not in allowedRoles: ${allowedRoles}. Redirecting.`);
    // Bisa diganti dengan halaman "Unauthorized"
    switch (user.role) {
        case 'Kabag': return <Navigate to="/kabag" replace />;
        case 'Monitoring': return <Navigate to="/monitoring" replace />;
        case 'Staff': return <Navigate to="/staff" replace />;
        case 'TB': return <Navigate to="/tb" replace />;
        case 'Admin': return <Navigate to="/admin" replace />;
        default: return <Navigate to="/login" replace />; 
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;