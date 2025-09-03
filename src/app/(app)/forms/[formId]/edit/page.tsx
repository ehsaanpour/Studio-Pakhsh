// This file is part of the old "FormEase" project.
// It is not relevant to the "Studio Reservation System" and can be removed.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Construction } from 'lucide-react'; 

export default function EditFormPage_DEPRECATED({ params }: { params: { formId: string } }) {
  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href="/dashboard">
          <ArrowRight className="ms-2 h-4 w-4" /> بازگشت به داشبورد
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <Construction className="mx-auto h-12 w-12 text-destructive mb-2" />
          <CardTitle className="text-2xl">صفحه قدیمی (ویرایش فرم): {params.formId}</CardTitle>
          <CardDescription>
            این صفحه مربوط به پروژه قبلی "فرم‌ایزی" بوده و برای سیستم رزرواسیون استودیو کاربردی ندارد.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>محتوای این صفحه برای پروژه فعلی معتبر نیست.</p>
        </CardContent>
      </Card>
    </div>
  );
}
