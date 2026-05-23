import { Outlet, Navigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function AdminLayout() {
  const { admin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return null; 

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1 pt-16">
        <div className="hidden md:block">
          <AdminSidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="md:hidden">
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
