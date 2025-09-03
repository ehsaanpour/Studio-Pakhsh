'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ProfilePictureUpload } from '@/components/profile/profile-picture-upload';

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!isAdmin) { // If user is not admin, redirect to producer panel
      router.push('/producer');
      return;
    }
  }, [user, isAdmin, router]);

  if (!user || !isAdmin) { // Also return null if not admin, as they will be redirected
    return null;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/dashboard" className="flex items-center">
          <ArrowRight className="ms-2 h-4 w-4" /> بازگشت به داشبورد
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {isAdmin ? 'پروفایل مدیر' : 'پروفایل تهیه‌کننده'}
          </CardTitle>
          <CardDescription>
            {isAdmin ? 'اطلاعات شخصی و تنظیمات حساب کاربری مدیر' : 'اطلاعات شخصی و تنظیمات حساب کاربری تهیه‌کننده'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ProfilePictureUpload /> {/* Add profile picture upload component */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <h3 className="text-lg font-semibold">اطلاعات شخصی</h3>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">نام:</span>
                    <span>{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">نام کاربری:</span>
                    <span>{user.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">ایمیل:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">شماره تماس:</span>
                    <span>{user.phone}</span>
                  </div>
                  {user?.workplace && ( // Display workplace if available
                    <div className="flex items-center gap-2">
                      <span className="font-medium">محل کار:</span>
                      <span>{user.workplace}</span>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">نقش:</span>
                      <span className="text-primary font-semibold">مدیر سیستم</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">تنظیمات حساب کاربری</h3>
              <div className="grid gap-4">
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/profile/change-password">
                    تغییر رمز عبور
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/profile/edit-profile">
                    ویرایش اطلاعات شخصی
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="outline" className="justify-start">
                    مدیریت کاربران
                  </Button>
                )}
              </div>
            </div>

            {!isAdmin && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">آمار رزروها</h3>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">تعداد رزروهای فعال:</span>
                    <span>0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">تعداد رزروهای گذشته:</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
