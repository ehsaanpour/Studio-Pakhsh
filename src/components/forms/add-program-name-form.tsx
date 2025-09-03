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
import { addProgramName } from '@/lib/program-name-store';

const formSchema = z.object({
  programName: z.string().min(1, 'نام برنامه الزامی است.'),
});

export function AddProgramNameForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programName: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    await addProgramName(data.programName);
    setIsLoading(false);
    toast({
      title: 'نام برنامه اضافه شد',
      description: `برنامه "${data.programName}" با موفقیت اضافه شد.`,
      action: (
        <div className="flex items-center text-green-500">
          <CheckCircle className="ms-2 h-5 w-5" />
          <span>موفق</span>
        </div>
      ),
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="programName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام برنامه جدید</FormLabel>
              <FormControl>
                <Input placeholder="نام برنامه را وارد کنید" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
          افزودن برنامه
        </Button>
      </form>
    </Form>
  );
}
