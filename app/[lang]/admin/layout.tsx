'use client';

import { withAdminAuth } from '@/lib/auth-context';
import AdminLayout from '@/components/admin-layout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutWrapper({ children }: AdminLayoutProps) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}

export default withAdminAuth(AdminLayoutWrapper);
