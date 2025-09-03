import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react'; // Using Construction icon as a generic placeholder

export default function TemplatesPage() {
  // This page is no longer relevant for the Studio Reservation System in its current form.
  // It can be removed or repurposed later if template functionality is desired.
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-foreground">قالب‌ها (غیرفعال)</h2>
      <p className="text-muted-foreground">
        این بخش در حال حاضر برای سیستم رزرواسیون استودیو کاربردی ندارد و ممکن است در آینده حذف یا بازطراحی شود.
      </p>
      
      <Card className="mt-12 text-center py-12 bg-muted/50">
        <CardHeader>
          <Construction className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <CardTitle>بخش در دست بررسی</CardTitle>
          <CardDescription>محتوای این صفحه مربوط به پروژه قبلی بوده و در حال حاضر غیرفعال است.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
