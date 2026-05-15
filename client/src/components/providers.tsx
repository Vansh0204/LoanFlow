'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
