'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const formSchema = z.object({
  currentPassword: z.string().min(1, 'رمز عبور فعلی الزامی است.'),
  newPassword: z.string().min(6, 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.'),
  confirmNewPassword: z.string().min(1, 'تایید رمز عبور جدید الزامی است.'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'رمز عبور جدید و تایید آن مطابقت ندارند.',
  path: ['confirmNewPassword'],
});

export function ChangePasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Determine the API endpoint based on user type
      const endpoint = user?.isAdmin ? '/api/change-password' : '/api/producer/change-password';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          username: user?.username, // Include username for producer password change
        }),
      });

      if (response.ok) {
        toast({
          title: 'رمز عبور با موفقیت تغییر یافت',
          description: 'رمز عبور شما با موفقیت به‌روزرسانی شد.',
          action: (
            <div className="flex items-center text-green-500">
              <CheckCircle className="ms-2 h-5 w-5" />
              <span>موفق</span>
            </div>
          ),
        });
        form.reset();
      } else {
        const errorData = await response.json();
        toast({
          title: 'خطا در تغییر رمز عبور',
          description: errorData.message || 'مشکلی در تغییر رمز عبور پیش آمد.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'خطا',
        description: 'ارتباط با سرور برقرار نشد.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رمز عبور فعلی *</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رمز عبور جدید *</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تایید رمز عبور جدید *</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
          تغییر رمز عبور
        </Button>
      </form>
    </Form>
  );
}
