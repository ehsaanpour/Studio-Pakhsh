'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PakhshManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isPakhshManager } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !isPakhshManager) {
      router.push('/login');
    }
  }, [user, isPakhshManager, router]);

  if (!user || !isPakhshManager) {
    return null;
  }

  return <>{children}</>;
}
