'use client';

import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        containerStyle={{
          zIndex: 999999999999999999999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(16px)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px 20px',
            maxWidth: '400px',
            zIndex: 999999999999999999999,
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f8fafc',
            },
            style: {
              background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              zIndex: 999999999999999999999,
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f8fafc',
            },
            style: {
              background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              zIndex: 999999999999999999999,
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#f8fafc',
            },
            style: {
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              zIndex: 999999999999999999999,
            },
          },  
        }}
      />
    </>
  )
}
