import { GuestReservationForm } from '@/components/forms/guest-reservation-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/icons/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function GuestReservationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
              <AppLogo className="h-8 w-8" />
              <span>رزرو استودیو</span>
            </Link>
            <Button variant="outline" asChild>
              <Link href="/login">
                <ArrowRight className="ms-2 h-4 w-4" />
                بازگشت به صفحه ورود
              </Link>
            </Button>
          </div>
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">فرم رزرو استودیو برای مهمانان</CardTitle>
              <CardDescription>لطفاً اطلاعات زیر را برای ثبت درخواست رزرو خود تکمیل نمایید.</CardDescription>
            </CardHeader>
            <CardContent>
              <GuestReservationForm />
            </CardContent>
          </Card>
        </div>
      </div>
      <footer className="py-4 mt-auto text-center text-xs text-muted-foreground border-t border-border bg-background">
        <p>
          تمامی حقوق این نرم افزار برای <Link href="https://ehsaanpour.github.io/Me/index.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">احسان احسانپور</Link> محفوظ است
        </p>
      </footer>
    </div>
  );
}
