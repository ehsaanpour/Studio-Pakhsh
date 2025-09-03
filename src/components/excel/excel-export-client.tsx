"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StudioReservationRequest, Engineer } from "@/types";
import { FileSpreadsheet, Download } from "lucide-react";
import ExcelJS from 'exceljs';
import { format as formatPersian, getMonth, getYear, setMonth, addMonths, setDate, getDate } from 'date-fns-jalali';
import faIR from 'date-fns-jalali/locale/fa-IR';

type MonthOption = {
  value: string;
  label: string;
  startDate: Date;
  endDate: Date;
};

export default function ExcelExportClient() {
  const [reservations, setReservations] = useState<StudioReservationRequest[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const monthOptions: MonthOption[] = useMemo(() => {
    const options: MonthOption[] = [];
    
    // Generate month options using Gregorian calendar for the periods
    // but display them with Persian month names
    for (let i = -6; i <= 6; i++) {
      const baseDate = new Date();
      const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
      
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      
      // Create start date (21st of the target month)
      const startDate = new Date(year, month, 21, 0, 0, 0);
      // Create end date (20th of next month)
      const endDate = new Date(year, month + 1, 20, 23, 59, 59, 999);
      
      // Get Persian month names for display
      const startMonthName = formatPersian(startDate, 'LLLL', { locale: faIR });
      const endMonthName = formatPersian(endDate, 'LLLL', { locale: faIR });
      const persianYear = formatPersian(startDate, 'yyyy', { locale: faIR });
      
      options.push({
        value: `${month}-${year}-${i}`,
        label: `${startMonthName} - ${endMonthName} ${persianYear}`,
        startDate,
        endDate
      });
    }
    
    return options;
  }, []);

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    // Set current month as default
    if (monthOptions.length > 0) {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const currentMonthOption = monthOptions.find(opt => 
        opt.value.startsWith(`${currentMonth}-${currentYear}`)
      );
      if (currentMonthOption) {
        setSelectedMonth(currentMonthOption.value);
      }
    }
  }, [monthOptions]);

  async function fetchData() {
    try {
      setIsLoading(true);
      const [reservationsRes, engineersRes] = await Promise.all([
        fetch("/api/reservations", { cache: "no-store" }),
        fetch("/api/engineer/list", { cache: "no-store" })
      ]);
      if (!reservationsRes.ok) throw new Error("Failed to fetch reservations");
      if (!engineersRes.ok) throw new Error("Failed to fetch engineers");
      const reservationsData = await reservationsRes.json();
      const engineersData = await engineersRes.json();
      setReservations(reservationsData);
      setEngineers(engineersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredReservations = useMemo(() => {
    if (!selectedMonth) return [];
    
    const selectedOption = monthOptions.find(opt => opt.value === selectedMonth);
    if (!selectedOption) return [];
    
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.dateTime.reservationDate);
      return reservationDate >= selectedOption.startDate && 
             reservationDate <= selectedOption.endDate &&
             (reservation.status === 'confirmed' || reservation.status === 'finalized');
    });
  }, [reservations, selectedMonth, monthOptions]);

  const exportToCSV = async () => {
    if (filteredReservations.length === 0) {
      alert("هیچ داده‌ای برای صادرات وجود ندارد");
      return;
    }

    setIsExporting(true);
    
    try {
      // Prepare data for export
      const exportData = filteredReservations.map(reservation => ({
        'شناسه برنامه': reservation.id,
        'نام برنامه': reservation.programName,
        'نام تهیه‌کننده': reservation.requesterName || '',
        'نام سازمان': reservation.personalInfo?.nameOrOrganization || '',
        'شماره تماس': reservation.personalInfo?.phoneNumber || '',
        'آدرس ایمیل': reservation.personalInfo?.emailAddress || '',
        'تاریخ رزرو': new Date(reservation.dateTime.reservationDate).toLocaleDateString('fa-IR'),
        'ساعت شروع': reservation.dateTime.startTime,
        'ساعت پایان': reservation.dateTime.endTime,
        'استودیو': reservation.studio === 'studio2' ? 'استودیو ۲ (فرانسه)' : 
                   reservation.studio === 'studio5' ? 'استودیو ۵ (-۳)' : 
                   reservation.studio === 'studio6' ? 'استودیو ۶ (مایا ناصر)' : reservation.studio,
        'نوع خدمات': reservation.studioServices.serviceType === 'with_crew' ? 'با عوامل' : 'بدون عوامل',
        'تعداد روزها': reservation.studioServices.numberOfDays,
        'ساعات روزانه': reservation.studioServices.hoursPerDay,
        'خدمات اضافی': reservation.additionalServices?.join(', ') || '',
        'خدمات پذیرایی': reservation.cateringServices?.join(', ') || '',
        'وضعیت': reservation.status === 'confirmed' ? 'تایید شده' :
                 reservation.status === 'new' ? 'جدید' :
                 reservation.status === 'read' ? 'خوانده شده' :
                 reservation.status === 'cancelled' ? 'لغو شده' : reservation.status,
        'تاریخ ثبت': new Date(reservation.submittedAt).toLocaleDateString('fa-IR'),
        'تاریخ آخرین به‌روزرسانی': reservation.updatedAt ? new Date(reservation.updatedAt).toLocaleDateString('fa-IR') : '',
        'تعداد مهندس': reservation.engineerCount || '',
        'مهندسین اختصاص یافته': reservation.engineers ? 
          reservation.engineers
            .map(id => engineers.find(e => e.id === id)?.name)
            .filter(Boolean)
            .join(', ') : ''
      }));

      // Convert to CSV format
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const selectedOption = monthOptions.find(opt => opt.value === selectedMonth);
      const filename = `برنامه‌های-استودیو-${selectedOption?.label.replace(/\s+/g, '-')}.csv`;
      
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
    } catch (err) {
      alert('خطا در صادرات فایل: ' + (err instanceof Error ? err.message : 'خطای نامشخص'));
    } finally {
      setIsExporting(false);
    }
  };

  const exportToXLSX = async () => {
    if (filteredReservations.length === 0) {
      alert("هیچ داده‌ای برای صادرات وجود ندارد");
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = filteredReservations.map(reservation => ({
        'شناسه برنامه': reservation.id,
        'نام برنامه': reservation.programName,
        'نام تهیه‌کننده': reservation.requesterName || '',
        'نام سازمان': reservation.personalInfo?.nameOrOrganization || '',
        'شماره تماس': reservation.personalInfo?.phoneNumber || '',
        'آدرس ایمیل': reservation.personalInfo?.emailAddress || '',
        'تاریخ رزرو': new Date(reservation.dateTime.reservationDate).toLocaleDateString('fa-IR'),
        'ساعت شروع': reservation.dateTime.startTime,
        'ساعت پایان': reservation.dateTime.endTime,
        'استودیو': reservation.studio === 'studio2' ? 'استودیو ۲ (فرانسه)' : 
                   reservation.studio === 'studio5' ? 'استودیو ۵ (-۳)' : 
                   reservation.studio === 'studio6' ? 'استودیو ۶ (مایا ناصر)' : reservation.studio,
        'نوع خدمات': reservation.studioServices.serviceType === 'with_crew' ? 'با عوامل' : 'بدون عوامل',
        'تعداد روزها': reservation.studioServices.numberOfDays,
        'ساعات روزانه': reservation.studioServices.hoursPerDay,
        'خدمات اضافی': reservation.additionalServices?.join(', ') || '',
        'خدمات پذیرایی': reservation.cateringServices?.join(', ') || '',
        'وضعیت': reservation.status === 'confirmed' ? 'تایید شده' :
                 reservation.status === 'new' ? 'جدید' :
                 reservation.status === 'read' ? 'خوانده شده' :
                 reservation.status === 'cancelled' ? 'لغو شده' : reservation.status,
        'تاریخ ثبت': new Date(reservation.submittedAt).toLocaleDateString('fa-IR'),
        'تاریخ آخرین به‌روزرسانی': reservation.updatedAt ? new Date(reservation.updatedAt).toLocaleDateString('fa-IR') : '',
        'تعداد مهندس': reservation.engineerCount || '',
        'مهندسین اختصاص یافته': reservation.engineers ? 
          reservation.engineers
            .map(id => engineers.find(e => e.id === id)?.name)
            .filter(Boolean)
            .join(', ') : ''
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('برنامه‌ها');

      // Prepare headers
      worksheet.columns = Object.keys(exportData[0]).map(key => ({
        header: key,
        key: key,
        width: 20 // Adjust column width as needed
      }));

      // Add rows
      worksheet.addRows(exportData);

      const selectedOption = monthOptions.find(opt => opt.value === selectedMonth);
      const filename = `برنامه‌های-استودیو-${selectedOption?.label.replace(/\s+/g, '-')}.xlsx`;

      // Write to buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
    } catch (err) {
      alert('خطا در صادرات فایل: ' + (err instanceof Error ? err.message : 'خطای نامشخص'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold">خروجی اکسل</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            صادرات اطلاعات برنامه‌ها
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="month-select">انتخاب دوره زمانی (بر اساس تقویم شمسی)</Label>
            <Select 
              value={selectedMonth} 
              onValueChange={setSelectedMonth}
              dir="rtl"
            >
              <SelectTrigger id="month-select" className="w-full max-w-md">
                <SelectValue placeholder="دوره زمانی را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedMonth && (
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">پیش‌نمایش داده‌ها</h3>
              {isLoading ? (
                <p>در حال بارگذاری...</p>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    تعداد برنامه‌های تایید شده: <span className="font-medium">{filteredReservations.length}</span>
                  </p>
                  {filteredReservations.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <p>شامل ستون‌ها: شناسه برنامه، نام برنامه، تهیه‌کننده، تاریخ، استودیو، خدمات و...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={exportToCSV} 
              disabled={!selectedMonth || isExporting || filteredReservations.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "در حال صادرات..." : "صادرات به CSV"}
            </Button>
            <Button 
              onClick={exportToXLSX} 
              disabled={!selectedMonth || isExporting || filteredReservations.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "در حال صادرات..." : "صادرات به XLSX"}
            </Button>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
