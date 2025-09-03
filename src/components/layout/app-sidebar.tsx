"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/icons/logo";
import { LayoutDashboard, UserPlus, LogIn, ShieldCheck, Settings, LogOut, ChevronRight, ChevronLeft, Home, User, CalendarDays, UserCog, FileSpreadsheet, Calculator } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar"; 
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

// Updated navItems for Studio Reservation System
const navItems = [
  { href: "/admin", label: "پنل مدیریت", icon: ShieldCheck },
  { href: "/engineer-assignment", label: "پنل اختصاص مهندس", icon: UserCog },
  { href: "/excel-export", label: "خروجی اکسل", icon: FileSpreadsheet },
  { href: "/engineer-shifts", label: "محاسبه شیفت مهندسین", icon: Calculator },
  { href: "/weekly-schedule", label: "برنامه هفتگی برنامه‌ها", icon: CalendarDays },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, toggleSidebar, isMobile, state } = useSidebar();
  const { user, isAdmin, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  const CollapseIcon = ChevronRight;
  const ExpandIcon = ChevronLeft;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide sidebar for login and guest pages if they are standalone full-page experiences
  if (pathname === "/login" || pathname === "/guest") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!mounted) {
    return null;
  }

  return (
    <Sidebar side="right" variant="sidebar" collapsible={isMobile ? "offcanvas" : "icon"}>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className={cn(
            "flex items-center gap-2 transition-all duration-300",
            state === "collapsed" && !isMobile ? "justify-center" : ""
          )}>
          <Link href="/" className="flex items-center gap-2">
            <AppLogo className="h-8 w-8 text-primary" />
            <span className={cn(
                "text-2xl font-bold text-sidebar-foreground whitespace-nowrap",
                state === "collapsed" && !isMobile ? "sr-only opacity-0" : "opacity-100"
              )}>
              رزرو استودیو
            </span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
           <SidebarMenuItem>
              <Link href="/" className="w-full">
                <SidebarMenuButton
                  isActive={pathname === "/"}
                  tooltip="صفحه اصلی"
                  className="justify-start w-full"
                >
                  <Home className="h-5 w-5" />
                  <span className={cn(state === "collapsed" && !isMobile ? "sr-only" : "")}>صفحه اصلی</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          {navItems.map((item) => {
            const isAdminOnly = item.href === "/admin" || item.href === "/engineer-assignment" || item.href === "/excel-export" || item.href === "/engineer-shifts";
            if (isAdminOnly && !isAdmin) {
              return null;
            }
            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} className="w-full">
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href) && (item.href === "/" ? pathname === item.href : true)}
                    tooltip={item.label}
                    className="justify-start w-full"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className={cn(state === "collapsed" && !isMobile ? "sr-only" : "")}>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <Link href={isAdmin ? "/admin" : "/profile"} className="w-full">
                <SidebarMenuButton 
                  isActive={pathname === (isAdmin ? "/admin" : "/profile")}
                  className="justify-start w-full" 
                  tooltip={isAdmin ? "پنل مدیریت" : "پروفایل"}
                >
                  <User className="h-5 w-5" />
                  <span className={cn(state === "collapsed" && !isMobile ? "sr-only" : "")}>
                    {isAdmin ? "پنل مدیریت" : "پروفایل"}
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}
           <SidebarMenuItem>
            <Link href="/settings" className="w-full">
              <SidebarMenuButton 
                isActive={pathname === "/settings"}
                className="justify-start w-full" 
                tooltip="تنظیمات"
              >
                <Settings className="h-5 w-5" />
                <span className={cn(state === "collapsed" && !isMobile ? "sr-only" : "")}>تنظیمات</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="justify-start w-full" 
              tooltip="خروج"
            >
              <LogOut className="h-5 w-5" />
              <span className={cn(state === "collapsed" && !isMobile ? "sr-only" : "")}>خروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!isMobile && (
           <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mt-4 self-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            {open ? <CollapseIcon /> : <ExpandIcon />}
            <span className="sr-only">باز/بسته کردن نوار کناری</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

