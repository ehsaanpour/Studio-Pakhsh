'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChangePasswordForm } from '@/components/forms/change-password-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ChangePasswordPage() {
  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/profile" className="flex items-center">
          <ArrowRight className="ms-2 h-4 w-4" /> بازگشت به پروفایل
        </Link>
      </Button>

      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">تغییر رمز عبور</CardTitle>
          <CardDescription>
            برای امنیت حساب کاربری خود، رمز عبور خود را به‌روزرسانی کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
