import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function CreateNewFormPage_DEPRECATED() {
  // This page is from the old "FormEase" project and is not relevant
  // to the "Studio Reservation System". It can be removed.
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
           <Construction className="mx-auto h-12 w-12 text-destructive mb-2" />
          <CardTitle className="text-3xl font-bold">صفحه قدیمی (ایجاد فرم)</CardTitle>
          <CardDescription>
            این صفحه مربوط به پروژه قبلی "فرم‌ایزی" بوده و در سیستم رزرواسیون استودیو کاربردی ندارد. این فایل می‌تواند حذف شود.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">محتوای این صفحه برای پروژه فعلی معتبر نیست.</p>
        </CardContent>
      </Card>
    </div>
  );
}
