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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format as formatDateFnsJalali } from 'date-fns-jalali';
import faIR from 'date-fns-jalali/locale/fa-IR';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import type { AdditionalService, StudioReservationRequest } from '@/types';
import { useRouter } from 'next/navigation';

export const producerEditFormSchema = z.object({
  reservationDate: z.date(),
  reservationStartTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
  reservationEndTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
  studioSelection: z.enum(['studio2', 'studio5', 'studio6']),
  studioServiceType: z.enum(['with_crew', 'without_crew']),
  additionalServices: z.array(z.enum([
    'videowall',
    'xdcam',
    'crane',
    'makeup_artist',
    'service_staff',
    'live_communication',
    'stream',
  ])).optional(),
  details: z.string().optional(),
  repetitionType: z.enum(['no_repetition', 'weekly_1month', 'weekly_3months', 'daily_until_date']).optional(),
}).refine((data) => {
  if (data.reservationStartTime && data.reservationEndTime) {
    return data.reservationEndTime > data.reservationStartTime;
  }
  return true;
}, {
  message: 'ساعت پایان نمی‌تواند زودتر از ساعت شروع باشد.',
  path: ['reservationEndTime'],
});

export type ProducerEditFormValues = z.infer<typeof producerEditFormSchema>;

const studioOptions = [
  { id: 'studio2', label: 'استودیو ۲ (فرانسه)' },
  { id: 'studio5', label: 'استودیو ۵ (-۳)' },
  { id: 'studio6', label: 'استودیو ۶ (مایا ناصر)' },
];

const additionalServiceItems: { id: AdditionalService; label: string }[] = [
  { id: 'videowall', label: 'ویدئووال' },
  { id: 'xdcam', label: 'XDCAM' },
  { id: 'crane', label: 'کرین' },
  { id: 'makeup_artist', label: 'گریمور' },
  { id: 'service_staff', label: 'نیروی خدمات' },
  { id: 'live_communication', label: 'ارتباط زنده' },
  { id: 'stream', label: 'استریم' },
];

interface ProducerEditReservationFormProps {
  request: StudioReservationRequest;
}

export function ProducerEditReservationForm({ request }: ProducerEditReservationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const form = useForm<ProducerEditFormValues>({
    resolver: zodResolver(producerEditFormSchema),
    defaultValues: {
      reservationDate: new Date(request.dateTime.reservationDate),
      reservationStartTime: request.dateTime.startTime,
      reservationEndTime: request.dateTime.endTime,
      studioSelection: request.studio,
      studioServiceType: request.studioServices.serviceType,
      additionalServices: request.additionalServices || [],
      details: request.details || '',
      repetitionType: request.repetition?.type || 'no_repetition',
    },
  });

  async function onSubmit(data: ProducerEditFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reservations/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: request.id, ...data }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reservation.');
      }

      toast({
        title: 'درخواست بروزرسانی شد',
        description: 'درخواست رزرو شما با موفقیت بروزرسانی شد.',
      });
      router.push('/producer');
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بروزرسانی درخواست. لطفاً دوباره تلاش کنید.',
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
          name="reservationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاریخ رزرو</FormLabel>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className={cn('w-full', !field.value && 'text-muted-foreground')}>
                      {field.value ? formatDateFnsJalali(field.value, 'PPP', { locale: faIR }) : <span>یک تاریخ انتخاب کنید</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <PersianDatePicker
                    value={field.value}
                    onChange={(date) => {
                      if (date) field.onChange(date);
                      setIsDatePickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reservationStartTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ساعت شروع</FormLabel>
              <FormControl>
                <Input
                  type="time"
                  {...field}
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    const target = e.currentTarget as HTMLInputElement;
                    if (target.showPicker) {
                      target.showPicker();
                    }
                  }}
                  className="w-full text-right"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reservationEndTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ساعت پایان</FormLabel>
              <FormControl>
                <Input
                  type="time"
                  {...field}
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    const target = e.currentTarget as HTMLInputElement;
                    if (target.showPicker) {
                      target.showPicker();
                    }
                  }}
                  className="w-full text-right"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="studioSelection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>استودیو</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                  {studioOptions.map((option) => (
                    <FormItem key={option.id} className="flex items-center space-x-3">
                      <FormControl>
                        <RadioGroupItem value={option.id} />
                      </FormControl>
                      <FormLabel className="font-normal">{option.label}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="studioServiceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع سرویس</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                  <FormItem className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem value="with_crew" />
                    </FormControl>
                    <FormLabel className="font-normal">با عوامل</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3">
                    <FormControl>
                      <RadioGroupItem value="without_crew" />
                    </FormControl>
                    <FormLabel className="font-normal">بدون عوامل</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="additionalServices"
          render={({ field }) => (
            <FormItem>
              <FormLabel>خدمات اضافی</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {additionalServiceItems.map((item) => (
                  <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(item.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), item.id])
                            : field.onChange(field.value?.filter((value) => value !== item.id));
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{item.label}</FormLabel>
                  </FormItem>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>جزئیات</FormLabel>
              <FormControl>
                <Textarea placeholder="جزئیات بیشتر..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4 p-4 sm:p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-lg sm:text-xl font-semibold text-primary border-b pb-2 mb-4">جزئیات سرویس</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="repetitionType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>تکرار برنامه *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center justify-between flex-row-reverse">
                        <FormLabel className="font-normal">
                          بدون تکرار
                        </FormLabel>
                        <FormControl>
                          <RadioGroupItem value="no_repetition" />
                        </FormControl>
                      </FormItem>
                      <FormItem className="flex items-center justify-between flex-row-reverse">
                        <FormLabel className="font-normal">
                          هفتگی (یک ماه)
                        </FormLabel>
                        <FormControl>
                          <RadioGroupItem value="weekly_1month" />
                        </FormControl>
                      </FormItem>
                      <FormItem className="flex items-center justify-between flex-row-reverse">
                        <FormLabel className="font-normal">
                          هفتگی (سه ماه)
                        </FormLabel>
                        <FormControl>
                          <RadioGroupItem value="weekly_3months" />
                        </FormControl>
                      </FormItem>
                      <FormItem className="flex items-center justify-between flex-row-reverse">
                        <FormLabel className="font-normal">
                          روزانه تا تاریخ مشخص
                        </FormLabel>
                        <FormControl>
                          <RadioGroupItem value="daily_until_date" />
                        </FormControl>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           </div>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'بروزرسانی درخواست'}
        </Button>
      </form>
    </Form>
  );
}

