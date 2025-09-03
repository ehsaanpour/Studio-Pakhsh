'use client';

// This component was part of "FormEase". It is not directly used in the
// "Studio Reservation System" in its current form.
// It can be removed or heavily adapted if a generic form builder is needed later.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export function CreateFormClient_DEPRECATED() {
 return (
    <div className="space-y-8">
       <Card>
        <CardHeader className="items-center">
           <Construction className="h-16 w-16 text-destructive mb-4" />
          <CardTitle className="text-2xl">کامپوننت قدیمی (CreateFormClient)</CardTitle>
          <CardDescription>این کامپوننت مربوط به پروژه "فرم‌ایزی" است و در سیستم رزرواسیون استودیو استفاده نمی‌شود. می‌تواند حذف شود.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
            محتوای این کامپوننت برای پروژه فعلی معتبر نیست.
        </CardContent>
      </Card>
    </div>
  );
}
