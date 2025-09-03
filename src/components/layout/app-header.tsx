"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, CircleUser, LogOut, LogIn, UserPlus, ShieldCheck, LayoutDashboard, Home } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AppLogo } from "@/components/icons/logo";
import { useAuth } from '@/lib/auth-context';

const getPageTitle = (pathname: string): string => {
  if (pathname === "/login") return "ورود به سیستم";
  if (pathname === "/guest") return "فرم رزرو مهمان";
  if (pathname === "/producer") return "پنل تهیه‌کننده";
  if (pathname.startsWith("/producer/new-request")) return "ثبت درخواست جدید تهیه‌کننده";
  if (pathname === "/admin") return "پنل مدیریت";
  if (pathname === "/settings") return "تنظیمات سیستم";
  if (pathname === "/profile") return "پروفایل کاربر";
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard")) return "داشبورد اصلی";
  return "سیستم رزرواسیون استودیو";
};

const navItems = [
  { href: "/", label: "صفحه اصلی", icon: Home },
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/producer", label: "پنل تهیه‌کننده", icon: LogIn },
  { href: "/admin", label: "پنل مدیریت", icon: ShieldCheck },
];

export function AppHeader() {
  const { toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { logout } = useAuth();
  const router = useRouter();

  if (pathname === "/login" || pathname === "/guest") {
    return null;
  }

  // Show profile and logout together for /producer routes
  const isProducerPanel = pathname === "/producer" || pathname.startsWith("/producer/");

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
      {isMobile && (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">باز/بسته کردن منو</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                  <AppLogo className="h-6 w-6" />
                  <span className="">رزرو استودیو</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpenMobile(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) && "bg-muted text-primary"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
      </div>
      {isProducerPanel ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <Link href="/profile">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">پروفایل</span>
            </Link>
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">خروج</span>
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="icon" className="rounded-full" asChild>
          <Link href="/profile">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">باز/بسته کردن منوی کاربر</span>
          </Link>
        </Button>
      )}
    </header>
  );
}
