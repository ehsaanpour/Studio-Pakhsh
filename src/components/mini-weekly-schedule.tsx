"use client";

import React, { useState, useEffect } from 'react';
import {
  format as formatDateFnsJalali,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from 'date-fns-jalali';
import faIR from 'date-fns-jalali/locale/fa-IR';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Define studio colors (reused from main calendar, though might not be used in mini version)
const STUDIO_COLORS: { [key: string]: string } = {
  "استودیو ۲ (فرانسه)": "bg-blue-500 text-white",
  "استودیو ۵ (-۳)": "bg-green-500 text-white",
  "استودیو ۶ (مایا ناصر)": "bg-purple-500 text-white",
};

// Helper to map backend studio names to display names and colors
const getStudioDisplayName = (studioName: string): string => {
  if (studioName.toLowerCase().includes("studio2")) return "استودیو ۲ (فرانسه)";
  if (studioName.toLowerCase().includes("studio5")) return "استودیو ۵ (-۳)";
  if (studioName.toLowerCase().includes("studio6")) return "استودیو ۶ (مایا ناصر)";
  return "نامشخص"; 
};

interface Reservation {
  id: string;
  programName: string;
  dateTime: {
    reservationDate: string; // ISO string
    startTime: string;
    endTime: string;
  };
  studio: string;
  status: string;
}

interface Program {
  id: string;
  name: string;
  time: string;
  studio: string; // Display name
  date: Date;
}

const WEEK_DAYS_PERSIAN_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function MiniWeeklySchedule() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentWeekStart = startOfWeek(new Date(), { locale: faIR, weekStartsOn: 6 });
  const weekEnd = endOfWeek(currentWeekStart, { locale: faIR, weekStartsOn: 6 });
  const daysInWeek = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/reservations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Reservation[] = await response.json();
        
        const fetchedPrograms: Program[] = data
          .filter((res: Reservation) => res.status === "confirmed")
          .map((res: Reservation) => ({
            id: res.id,
            name: res.programName,
            time: `${res.dateTime.startTime} - ${res.dateTime.endTime}`,
            studio: getStudioDisplayName(res.studio),
            date: parseISO(res.dateTime.reservationDate),
          }));
        setPrograms(fetchedPrograms);
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch programs:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const programsByDay: { [key: string]: Program[] } = {};
  daysInWeek.forEach(day => {
    const dayKey = formatDateFnsJalali(day, 'yyyy-MM-dd', { locale: faIR });
    programsByDay[dayKey] = programs.filter(program => isSameDay(program.date, day));
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">برنامه هفتگی (خلاصه)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center text-sm">
            خطا در بارگذاری برنامه‌ها: {error}
          </div>
        ) : (
          <div className="space-y-4">
            {daysInWeek.map((day, index) => {
              const dayKey = formatDateFnsJalali(day, 'yyyy-MM-dd', { locale: faIR });
              const programsForThisDay = programsByDay[dayKey] || [];
              return (
                <div key={dayKey} className="border-b pb-2 last:border-b-0">
                  <h4 className="font-semibold text-sm mb-1">
                    {WEEK_DAYS_PERSIAN_SHORT[index]} {formatDateFnsJalali(day, 'd LLLL', { locale: faIR })}
                  </h4>
                  {programsForThisDay.length > 0 ? (
                    <ul className="space-y-1">
                      {programsForThisDay.map(program => (
                        <li key={program.id} className={cn("p-1 rounded-md text-xs", STUDIO_COLORS[program.studio])}>
                          <span className="font-medium">{program.name}</span> ({program.time}) - {program.studio}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-xs">برنامه‌ای نیست</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
