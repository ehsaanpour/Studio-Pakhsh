// This file is part of the old "FormEase" project.
// It is not relevant to the "Studio Reservation System" and can be removed.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Eye, Construction } from 'lucide-react'; 

export default function PreviewFormPage_DEPRECATED({ params }: { params: { formId: string } }) {
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
          <CardTitle className="text-2xl flex items-center">
            <Eye className="ms-3 h-7 w-7 text-primary" />
            صفحه قدیمی (پیش‌نمایش فرم): {params.formId}
          </CardTitle>
          <CardDescription>
            این صفحه مربوط به پروژه قبلی "فرم‌ایزی" بوده و برای سیستم رزرواسیون استودیو کاربردی ندارد.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 border border-dashed rounded-lg bg-muted/30 min-h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground text-center">
             محتوای این صفحه برای پروژه فعلی معتبر نیست.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
