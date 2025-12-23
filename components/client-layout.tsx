"use client";

import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/simple-data-fetcher";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = useAuth();
  
  // Fetch public data
  const { data: publicData, loading: publicLoading, error: publicError } = useData<unknown>(
    "data/public-data",
    { immediate: true }
  );
  
  // Fetch admin data only if user is authenticated and is admin
  const { data: adminData, loading: adminLoading, error: adminError } = useData<unknown>(
    user && isAdmin ? "admin/users" : null,
    { immediate: !!(user && isAdmin) }
  );
  
  // Log errors for debugging
  if (publicError) {
    console.log(publicError, "public data error");
  }
  
  if (adminError) {
    console.log(adminError, "admin data error");
  }

  return <>{children}</>;
}

