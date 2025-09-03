import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Film, UserCog, UserPlus } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">به داشبورد سیستم رزرواسیون استودیو خوش آمدید</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          از این بخش می‌توانید به قابلیت‌های مختلف سیستم دسترسی پیدا کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <UserPlus className="h-10 w-10 text-primary mb-2" />
            <CardTitle>رزرو به عنوان مهمان</CardTitle>
            <CardDescription>یک درخواست رزرو جدید به عنوان کاربر مهمان ثبت کنید.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/guest">فرم رزرو مهمان</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Film className="h-10 w-10 text-accent mb-2" />
            <CardTitle>پنل تهیه‌کننده</CardTitle>
            <CardDescription>وارد پنل اختصاصی خود شوید و رزروهایتان را مدیریت کنید.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/producer">ورود به پنل تهیه‌کننده</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <UserCog className="h-10 w-10 text-destructive mb-2" />
            <CardTitle>پنل مدیریت</CardTitle>
            <CardDescription>مدیریت درخواست‌ها، کاربران و تنظیمات سیستم.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin">ورود به پنل مدیریت</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-12 bg-muted/30">
        <CardHeader>
          <CardTitle>راهنمایی</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            این صفحه داشبورد اصلی شماست. از لینک‌های بالا برای دسترسی به بخش‌های مختلف استفاده کنید.
            برای ورود به عنوان تهیه‌کننده یا مدیر، از <Link href="/login" className="text-primary hover:underline">صفحه ورود</Link> استفاده کنید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
