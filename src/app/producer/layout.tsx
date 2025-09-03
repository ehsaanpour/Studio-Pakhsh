'use client';

import type React from 'react';
import { AppHeader } from '@/components/layout/app-header';

export default function ProducerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1">
        {/* Removed the fixed-width black sidebar */}
        <main className="flex-1 bg-background overflow-auto w-full"> {/* Added w-full */}
          <div className="flex justify-center w-full">
            <div className="w-full max-w-[1200px] px-4">
              {children}
            </div>
          </div>
        </main>
      </div>
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border bg-background">
        <p>
          تمامی حقوق این نرم افزار برای <a href="https://ehsaanpour.github.io/Me/index.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">احسان احسانپور</a> محفوظ است
        </p>
      </footer>
    </div>
  );
}
