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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, CheckCircle, Loader2 } from 'lucide-react';
import { format as formatDateFnsJalali, parse } from 'date-fns-jalali';
import faIR from 'date-fns-jalali/locale/fa-IR';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { addReservations, updateReservation } from '@/lib/reservation-store';
import { PersianDatePicker } from '@/components/ui/persian-date-picker';
import type { AdditionalService, StudioReservationRequest } from '@/types';
import { getProgramNames } from '@/lib/program-name-store';

const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseYYYYMMDD = (dateString: string): Date => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};
export const producerFormSchema = z.object({
  programName: z.string().min(1, 'نام برنامه الزامی است.'),
  reservationDate: z.date({
    required_error: 'تاریخ رزرو الزامی است.',
  }).refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return date >= tomorrow;
  }, 'تاریخ رزرو باید حداقل از فردا باشد.'),
  reservationStartTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'ساعت شروع نامعتبر است (HH:MM).'),
  reservationEndTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'ساعت پایان نامعتبر است (HH:MM).'),
  studioSelection: z.enum(['studio2', 'studio5', 'studio6'], { required_error: 'انتخاب استودیو الزامی است.' }),
  studioServiceType: z.enum(['with_crew', 'without_crew'], { required_error: 'انتخاب سرویس استودیو الزامی است.' }),
  repetitionType: z.enum(['no_repetition', 'weekly_1month', 'weekly_3months', 'daily_until_date'], { required_error: 'انتخاب نوع تکرار الزامی است.' }),
  repetitionEndDate: z.date().optional(),
  additionalServices: z.array(z.enum([
    'videowall',
    'xdcam',
    'crane',
    'makeup_artist',
    'service_staff',
    'live_communication',
    'stream',
    'live_program',
  ])).optional(),
  details: z.string().optional(),
}).refine((data) => {
  if (data.additionalServices?.includes('live_communication') || data.additionalServices?.includes('stream')) {
    return data.details && data.details.trim().length > 0;
  }
  return true;
}, {
  message: 'در صورت انتخاب ارتباط زنده یا استریم، توضیحات تکمیلی الزامی است.',
  path: ['details'],
}).refine((data) => {
  if (data.reservationStartTime && data.reservationEndTime) {
    return data.reservationEndTime > data.reservationStartTime;
  }
  return true;
}, {
  message: 'ساعت پایان برنامه نمی‌تواند زودتر از ساعت شروع باشد.',
  path: ['reservationEndTime'],
});

export type ProducerFormValues = z.infer<typeof producerFormSchema>;

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
  { id: 'live_program', label: 'برنامه زنده' },
];

interface ProducerReservationFormProps {
  producerName: string;
  existingReservation?: StudioReservationRequest | null;
}

export function ProducerReservationForm({ producerName, existingReservation }: ProducerReservationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [programNames, setProgramNames] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    const fetchAndSetProgramNames = async () => {
      try {
        const names = await getProgramNames();
        if (isSubscribed) setProgramNames(names);
      } catch (error) {
        console.error('Error fetching program names:', error);
      }
    };
    fetchAndSetProgramNames();
    return () => { isSubscribed = false; };
  }, []);

  const form = useForm<ProducerFormValues>({
    resolver: zodResolver(producerFormSchema),
    defaultValues: existingReservation ? {
      ...existingReservation,
      programName: existingReservation.programName || '',
      reservationDate: parseYYYYMMDD(existingReservation.dateTime.reservationDate as string),
      reservationStartTime: existingReservation.dateTime.startTime,
      reservationEndTime: existingReservation.dateTime.endTime,
      studioSelection: existingReservation.studio,
      studioServiceType: existingReservation.studioServices.serviceType,
      repetitionType: existingReservation.repetition?.type || 'no_repetition',
      repetitionEndDate: existingReservation.repetition?.endDate,
    } : {
      programName: '',
      reservationDate: new Date(),
      reservationStartTime: '09:00',
      reservationEndTime: '17:00',
      studioSelection: undefined,
      studioServiceType: undefined,
      repetitionType: 'no_repetition',
      additionalServices: [],
      details: '',
    },
  });

  async function onSubmit(data: ProducerFormValues) {
    setIsLoading(true);
    try {
      if (existingReservation) {
        await updateReservation(existingReservation.id, data);
        toast({ title: 'درخواست شما بروزرسانی شد', description: 'درخواست رزرو شما با موفقیت بروزرسانی شد.' });
      } else {
        let reservationsToCreate: ProducerFormValues[] = [];
        if (data.repetitionType === 'no_repetition') {
          reservationsToCreate.push(data);
        } else if (data.repetitionType === 'daily_until_date' && data.repetitionEndDate) {
          let currentDate = new Date(data.reservationDate);
          const endDate = new Date(data.repetitionEndDate);
          while (currentDate <= endDate) {
            reservationsToCreate.push({ ...data, reservationDate: new Date(currentDate) });
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } else { // Weekly repetitions
          const weeks = data.repetitionType === 'weekly_1month' ? 4 : 12;
          for (let i = 0; i < weeks; i++) {
            const reservationDate = new Date(data.reservationDate);
            reservationDate.setDate(reservationDate.getDate() + (i * 7));
            reservationsToCreate.push({ ...data, reservationDate });
          }
        }

        for (const reservationData of reservationsToCreate) {
          const response = await fetch('/api/reservations/check-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dateTime: {
                reservationDate: formatDateToYYYYMMDD(reservationData.reservationDate),
                startTime: reservationData.reservationStartTime,
                endTime: reservationData.reservationEndTime,
              },
              studio: reservationData.studioSelection,
              reservationIdToExclude: undefined,
            }),
          });
          const { isAvailable, message } = await response.json();
          if (!isAvailable) {
            toast({ title: 'زمان رزرو در دسترس نیست', description: message, variant: 'destructive' });
            setIsLoading(false);
            return;
          }
        }

        const reservationRequests: Omit<StudioReservationRequest, 'id' | 'submittedAt' | 'status'>[] = reservationsToCreate.map(d => ({
          type: 'producer',
          requesterName: producerName,
          programName: d.programName,
          dateTime: {
            reservationDate: formatDateToYYYYMMDD(d.reservationDate),
            startTime: d.reservationStartTime,
            endTime: d.reservationEndTime,
          },
          studio: d.studioSelection,
          studioServices: {
            serviceType: d.studioServiceType,
            numberOfDays: 1,
            hoursPerDay: 0, // Server calculates this
          },
          additionalServices: d.additionalServices || [],
          details: d.details || '',
          repetition: {
            type: d.repetitionType,
            endDate: d.repetitionEndDate,
          },
          engineers: [],
          engineerCount: 1,
          cateringServices: [],
          personalInfo: undefined,
        }));

        await addReservations(reservationRequests);
        toast({ title: 'درخواست شما ثبت شد', description: `درخواست رزرو شما با موفقیت برای ${reservationsToCreate.length} روز ارسال شد.` });
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      toast({ title: 'خطا در ثبت درخواست', description: 'متأسفانه در ثبت درخواست شما مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  const iranTime = currentTime ? new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full', timeStyle: 'medium', timeZone: 'Asia/Tehran' }).format(currentTime) : '';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8" dir="rtl">
        <div className="space-y-4 p-4 sm:p-6 border rounded-lg shadow-sm bg-card">
          <div className="flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-semibold text-primary">اطلاعات برنامه</h3>
            <div className="text-sm text-muted-foreground">{iranTime}</div>
          </div>
          <FormField
            control={form.control}
            name="programName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام برنامه *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                  <FormControl>
                    <SelectTrigger className="w-full text-right">
                      <SelectValue placeholder="یک برنامه را انتخاب کنید" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent dir="rtl">
                    {programNames.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground text-right">
                        ابتدا در پنل تهیه‌کننده نام برنامه اضافه کنید.
                      </div>
                    ) : (
                      programNames.map((name) => (
                        <SelectItem key={name} value={name} className="text-right">{name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 p-4 sm:p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-lg sm:text-xl font-semibold text-primary border-b pb-2 mb-4">تاریخ و ساعت رزرو</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            <FormField
              control={form.control}
              name="reservationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>تاریخ رزرو *</FormLabel>
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-end text-right font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? formatDateFnsJalali(field.value, 'PPP', { locale: faIR }) : <span>یک تاریخ انتخاب کنید</span>}
                          <CalendarIcon className="me-2 h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <PersianDatePicker
                        value={field.value}
                        onChange={(date) => { field.onChange(date); setIsDatePickerOpen(false); }}
                        disabled={(date) => { const today = new Date(); today.setHours(0, 0, 0, 0); const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1); return date < tomorrow; }}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-muted-foreground mt-1 text-right">توجه: امکان رزرو برای روز جاری وجود ندارد. لطفاً از فردا به بعد را انتخاب کنید.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reservationStartTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ساعت شروع برنامه *</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      {...field} 
                      className="w-full text-right cursor-pointer" 
                      onKeyDown={(e) => e.preventDefault()}
                      onKeyPress={(e) => e.preventDefault()}
                      onInput={(e) => e.preventDefault()}
                      onChange={(e) => field.onChange(e.target.value)}
                      onClick={(e) => {
                        e.currentTarget.showPicker?.();
                      }}
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
                  <FormLabel>ساعت پایان برنامه *</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      {...field} 
                      className="w-full text-right cursor-pointer" 
                      onKeyDown={(e) => e.preventDefault()}
                      onKeyPress={(e) => e.preventDefault()}
                      onInput={(e) => e.preventDefault()}
                      onChange={(e) => field.onChange(e.target.value)}
                      onClick={(e) => {
                        e.currentTarget.showPicker?.();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-lg sm:text-xl font-semibold text-primary border-b pb-2 mb-4">انتخاب استودیو و سرویس</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="studioSelection"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>استودیو *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                      {studioOptions.map((option) => (
                        <FormItem key={option.id} className="flex items-center justify-between flex-row-reverse">
                          <FormLabel className="font-normal cursor-pointer">{option.label}</FormLabel>
                          <FormControl><RadioGroupItem value={option.id} /></FormControl>
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
                <FormItem className="space-y-3">
                  <FormLabel>نوع سرویس استودیو *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center justify-between flex-row-reverse">
                        <FormLabel className="font-normal cursor-pointer">استودیو با عوامل پخش</FormLabel>
                        <FormControl><RadioGroupItem value="with_crew" /></FormControl>
                      </FormItem>
                      <FormItem className="flex items-center justify-between flex-row-reverse">
                        <FormLabel className="font-normal cursor-pointer">فضای استودی و یک نیروی فنی</FormLabel>
                        <FormControl><RadioGroupItem value="without_crew" /></FormControl>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center justify-between flex-row-reverse">
                        <FormLabel className="font-normal">بدون تکرار</FormLabel>
                        <FormControl><RadioGroupItem value="no_repetition" /></FormControl>
                      </FormItem>
                      <FormItem className="flex items-center justify-between flex-row-reverse">
                        <FormLabel className="font-normal">هفتگی (یک ماه)</FormLabel>
                        <FormControl><RadioGroupItem value="weekly_1month" /></FormControl>
                      </FormItem>
                      <FormItem className="flex items-center justify-between flex-row-reverse">
                        <FormLabel className="font-normal">هفتگی (سه ماه)</FormLabel>
                        <FormControl><RadioGroupItem value="weekly_3months" /></FormControl>
                      </FormItem>
                      <FormItem className="flex items-center justify-between flex-row-reverse">
                        <FormLabel className="font-normal">روزانه تا تاریخ مشخص</FormLabel>
                        <FormControl><RadioGroupItem value="daily_until_date" /></FormControl>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('repetitionType') === 'daily_until_date' && (
              <FormField
                control={form.control}
                name="repetitionEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاریخ پایان تکرار *</FormLabel>
                    <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-end text-right font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? formatDateFnsJalali(field.value, 'PPP', { locale: faIR }) : <span>یک تاریخ انتخاب کنید</span>}
                            <CalendarIcon className="me-2 h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <PersianDatePicker
                          value={field.value}
                          onChange={(date) => { field.onChange(date); setIsEndDatePickerOpen(false); }}
                          disabled={(date) => { const startDate = form.getValues('reservationDate'); return date < startDate; }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-lg sm:text-xl font-semibold text-primary border-b pb-2 mb-4">سرویس‌های تکمیلی</h3>
          <FormField
            control={form.control}
            name="additionalServices"
            render={({ field }) => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">سرویس‌های مورد نیاز را انتخاب کنید</FormLabel>
                  <p className="text-sm text-muted-foreground mt-2">
                    در صورت انتخاب پخش زنده و استریم، لطفا بستر پخش زنده مانند گوگل میت، زوم، مایکروسافت تیمز و... 
                    و برای پخش زنده بسترهای آن مثل یوتیوب، اینستاگرام، آپارات و... در قسمت توضیحات به صورت کامل درج شود.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {additionalServiceItems.map((item) => (
                    <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-x-reverse rtl:space-x-reverse p-4 border rounded-lg">
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
        </div>

        <div className="space-y-4 p-4 sm:p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-lg sm:text-xl font-semibold text-primary border-b pb-2 mb-4">توضیحات تکمیلی</h3>
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>توضیحات</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={form.watch('additionalServices')?.includes('live_communication') || form.watch('additionalServices')?.includes('stream') ? "لطفاً بستر پخش زنده و بسترهای آن را مشخص کنید..." : "توضیحات تکمیلی خود را وارد کنید..."}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="me-2 h-4 w-4 animate-spin" /><span>در حال ثبت...</span></>
          ) : (
            'ثبت درخواست'
          )}
        </Button>
      </form>
    </Form>
  );
}
