'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, CheckCircle, Loader2 } from 'lucide-react';
import { format as formatDateFnsJalali } from 'date-fns-jalali'; 
import faIR from 'date-fns-jalali/locale/fa-IR';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { addReservation } from '@/lib/reservation-store';
import { PersianDatePicker } from '@/components/ui/persian-date-picker'; // New Import
import type { AdditionalService, CateringService } from '@/types';

const guestFormSchema = z.object({
  personalInfoName: z.string().min(1, 'نام موسسه یا نام و نام خانوادگی الزامی است.'),
  personalInfoPhone: z.string().min(1, 'شماره همراه الزامی است.').regex(/^09[0-9]{9}$/, 'شماره همراه نامعتبر است.'),
  personalInfoEmail: z.string().email('آدرس ایمیل نامعتبر است.').min(1, 'آدرس ایمیل الزامی است.'),
  reservationDate: z.date({ required_error: 'تاریخ رزرو الزامی است.' }),
  reservationStartTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'ساعت شروع نامعتبر است (HH:MM).'),
  reservationEndTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'ساعت پایان نامعتبر است (HH:MM).'),
  studioSelection: z.enum(['studio2', 'studio5', 'studio6'], { required_error: 'انتخاب استودیو الزامی است.'}),
  studioServiceType: z.enum(['with_crew', 'without_crew'], { required_error: 'انتخاب سرویس استودیو الزامی است.' }),
  studioServiceDays: z.number().min(1, 'تعداد روز باید حداقل ۱ باشد.'),
  studioServiceHoursPerDay: z.number().min(1, 'تعداد ساعت در روز باید حداقل ۱ باشد.'),
  additionalServices: z.array(z.enum(['videowall', 'led_monitor', 'xdcam', 'stream_iranian', 'stream_foreign', 'stream_server', 'zoom', 'google_meet', 'ms_teams', 'lobby', 'crane', 'makeup_artist', 'service_staff'])).optional(),
  cateringServices: z.array(z.enum(['drinks', 'breakfast', 'snack', 'lunch', 'dinner'])).optional(),
});

export type GuestFormValues = z.infer<typeof guestFormSchema>;

const studioOptions = [
  { id: 'studio2', label: 'استودیو ۲ (فرانسه)' },
  { id: 'studio5', label: 'استودیو ۵ (-۳)' },
  { id: 'studio6', label: 'استودیو ۶ (مایا ناصر)' },
];

const additionalServiceItems = [
  { id: 'videowall', label: 'ویدئووال' },
  { id: 'led_monitor', label: 'LED Monitor' },
  { id: 'xdcam', label: 'XDCAM' },
  { id: 'stream_iranian', label: 'استریم روی سرویس‌های ایرانی' },
  { id: 'stream_foreign', label: 'استریم روی سرویس‌های خارجی' },
  { id: 'stream_server', label: 'راه‌اندازی سرور استریم شخصی' },
  { id: 'zoom', label: 'ZOOM' },
  { id: 'google_meet', label: 'Google Meet' },
  { id: 'ms_teams', label: 'Microsoft Teams' },
  { id: 'lobby', label: 'لابی پذیرایی مهمان' },
  { id: 'crane', label: 'کرین' },
  { id: 'makeup_artist', label: 'گریمور' },
  { id: 'service_staff', label: 'نیروی خدمات' },
];

const cateringServiceItems = [
  { id: 'drinks', label: 'نوشیدنی' },
  { id: 'breakfast', label: 'صبحانه' },
  { id: 'snack', label: 'میان وعده' },
  { id: 'lunch', label: 'ناهار' },
  { id: 'dinner', label: 'شام' },
];


export function GuestReservationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);


  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      personalInfoName: '',
      personalInfoPhone: '',
      personalInfoEmail: '',
      reservationDate: new Date(), // Default to today
      reservationStartTime: '09:00',
      reservationEndTime: '17:00',
      studioSelection: undefined,
      studioServiceType: undefined,
      studioServiceDays: 1,
      studioServiceHoursPerDay: 8,
      additionalServices: [],
      cateringServices: [],
    },
  });

  async function onSubmit(data: GuestFormValues) {
    setIsLoading(true);
    console.log('Guest Reservation Data Submitted:', data);
    
    addReservation(data, 'guest');

    await new Promise(resolve => setTimeout(resolve, 500)); 
    setIsLoading(false);
    toast({
      title: 'درخواست شما ثبت شد',
      description: 'درخواست رزرو شما با موفقیت برای بررسی ارسال شد. کارشناسان ما به زودی با شما تماس خواهند گرفت.',
      action: (
        <div className="flex items-center text-green-500">
          <CheckCircle className="ms-2 h-5 w-5" />
          <span>موفق</span>
        </div>
      ),
    });
    form.reset({ // Reset form to default values, ensuring date is also reset
      personalInfoName: '',
      personalInfoPhone: '',
      personalInfoEmail: '',
      reservationDate: new Date(),
      reservationStartTime: '09:00',
      reservationEndTime: '17:00',
      studioSelection: undefined,
      studioServiceType: undefined,
      studioServiceDays: 1,
      studioServiceHoursPerDay: 8,
      additionalServices: [],
      cateringServices: [],
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <div className="space-y-4 p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-xl font-semibold text-primary border-b pb-2 mb-4">اطلاعات شخصی</h3>
          <FormField
            control={form.control}
            name="personalInfoName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>موسسه شرکت حقوقی / نام و نام خانوادگی حقیقی *</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: شرکت آوای هنر / علی رضایی" {...field} />
                </FormControl>
                <FormDescription>
                 نام دقیق قسمت در خواست دهنده استودیو را بنویسید
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="personalInfoPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شماره همراه *</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="مثال: 09123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalInfoEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>آدرس ایمیل *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="مثال: user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Reservation Date and Time */}
        <div className="space-y-4 p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-xl font-semibold text-primary border-b pb-2 mb-4">تاریخ و ساعت رزرو</h3>
          <div className="grid md:grid-cols-3 gap-4 items-start">
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
                          className={cn(
                            "w-full justify-start text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ms-2 h-4 w-4 opacity-50" />
                          {field.value ? (
                            formatDateFnsJalali(field.value, 'PPP', { locale: faIR }) 
                          ) : (
                            <span>یک تاریخ انتخاب کنید</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <PersianDatePicker
                        value={field.value}
                        onChange={(date) => {
                           field.onChange(date);
                           setIsDatePickerOpen(false); // Close popover on date select
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
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
                  <FormLabel>ساعت شروع رزرو *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
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
                  <FormLabel>ساعت پایان رزرو *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Studio Selection */}
        <div className="space-y-4 p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-xl font-semibold text-primary border-b pb-2 mb-4">انتخاب استودیو *</h3>
            <FormField
              control={form.control}
              name="studioSelection"
              render={({ field }) => (
                <FormItem>
                   <FormControl>
                     <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:rtl:space-x-reverse"
                      >
                        {studioOptions.map((option) => (
                          <FormItem key={option.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                            <FormControl>
                              <RadioGroupItem value={option.id} />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">{option.label}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>


        {/* Studio Services */}
        <div className="space-y-4 p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-xl font-semibold text-primary border-b pb-2 mb-4">خدمات استودیو</h3>
          <FormField
            control={form.control}
            name="studioServiceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>انتخاب سرویس استودیو *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="یک سرویس را انتخاب کنید" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="with_crew">استودیو با عوامل</SelectItem>
                    <SelectItem value="without_crew">استودیو بدون عوامل و تجهیزات (استودیو و ویدیووال)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="studioServiceDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تعداد روز *</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studioServiceHoursPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تعداد ساعت در روز *</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Additional Services */}
        <div className="space-y-2 p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-xl font-semibold text-primary border-b pb-2 mb-4">خدمات جانبی</h3>
          <FormField
            control={form.control}
            name="additionalServices"
            render={() => (
              <FormItem className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                {additionalServiceItems.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="additionalServices"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-2 rtl:space-x-reverse space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item.id])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage /> 
              </FormItem>
            )}
          />
        </div>

        {/* Catering Services */}
        <div className="space-y-2 p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-xl font-semibold text-primary border-b pb-2 mb-4">خدمات پذیرایی</h3>
          <FormField
            control={form.control}
            name="cateringServices"
            render={() => (
              <FormItem className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                {cateringServiceItems.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="cateringServices"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-2 rtl:space-x-reverse space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item.id])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage /> 
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
           {isLoading && <Loader2 className="ms-2 h-5 w-5 animate-spin" />}
          ارسال درخواست رزرو
        </Button>
      </form>
    </Form>
  );
}
