'use client';

import type React from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = useAuth();

  return (
    <>
      {isAdmin ? (
        <SidebarProvider defaultOpen>
          <div className="flex min-h-screen flex-col">
            <div className="flex flex-1">
              <AppSidebar /> {/* AppSidebar is always rendered if isAdmin is true */}
              <div className="flex flex-1 flex-col">
                <AppHeader />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-auto">
                  <div className="w-full h-full flex items-center justify-center">
                    {children}
                  </div>
                </main>
              </div>
            </div>
            <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border bg-background">
              <p>
                تمامی حقوق این نرم افزار برای <Link href="https://ehsaanpour.github.io/Me/index.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">احسان احسانپور</Link> محفوظ است
              </p>
            </footer>
          </div>
        </SidebarProvider>
      ) : (
        <div className="flex min-h-screen flex-col">
          <div className="flex flex-1">
            {/* No sidebar for non-admins */}
            <div className="flex flex-1 flex-col w-full"> {/* Added w-full here */}
              <AppHeader />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-auto">
                <div className="w-full h-full flex items-center justify-center">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border bg-background">
            <p>
              تمامی حقوق این نرم افزار برای <Link href="https://ehsaanpour.github.io/Me/index.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">احسان احسانپور</Link> محفوظ است
            </p>
          </footer>
        </div>
      )}
    </>
  );
}
