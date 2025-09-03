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
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context'; // Assuming useAuth provides user data

const formSchema = z.object({
  name: z.string().min(1, 'نام الزامی است.'),
  username: z.string().min(1, 'نام کاربری الزامی است.'),
  email: z.string().email('ایمیل نامعتبر است.').min(1, 'ایمیل الزامی است.'),
  phone: z.string().min(1, 'شماره تماس الزامی است.'),
  workplace: z.string().optional(),
});

export function EditProfileForm() {
  const { user, updateProfile } = useAuth(); // Assuming updateProfile function exists in useAuth
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      workplace: user?.workplace || '',
    },
  });

  // Update form defaults if user data changes (e.g., after initial load)
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        workplace: user.workplace || '',
      });
    }
  }, [user, form]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setIsLoading(false);

    // In a real application, you would send updated data to your backend.
    // For now, we'll simulate updating the local user state and show a success toast.
    if (updateProfile) {
      updateProfile({
        ...user,
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        workplace: data.workplace,
      });
    }

    toast({
      title: 'پروفایل با موفقیت به‌روزرسانی شد',
      description: 'اطلاعات شخصی شما با موفقیت به‌روزرسانی شد.',
      action: (
        <div className="flex items-center text-green-500">
          <CheckCircle className="ms-2 h-5 w-5" />
          <span>موفق</span>
        </div>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام کاربری *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ایمیل *</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>شماره تماس *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="workplace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>محل کار (اختیاری)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
          ذخیره تغییرات
        </Button>
      </form>
    </Form>
  );
}
