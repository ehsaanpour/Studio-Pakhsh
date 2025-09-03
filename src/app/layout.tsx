import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/auth-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const vazirmatn = Vazirmatn({ subsets: ['arabic'] });

export const metadata: Metadata = {
  title: 'رزرو استودیو',
  description: 'سیستم رزرو استودیو',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={cn(vazirmatn.className, 'bg-background')} suppressHydrationWarning>
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          <ThemeProvider defaultTheme="system" enableSystem>
            <AuthProvider>
              <SidebarProvider>
                {children}
                <Toaster />
              </SidebarProvider>
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
