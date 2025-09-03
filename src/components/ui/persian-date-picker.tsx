
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  format as formatDateFnsJalali,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay, // For day of week, 0=Sun, 1=Mon, ..., 6=Sat
  isSameDay,
  isSameMonth,
  isToday as isTodayJalali,
} from 'date-fns-jalali';
import faIR from 'date-fns-jalali/locale/fa-IR';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PersianDatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
}

const WEEK_DAYS_PERSIAN = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']; // شنبه تا جمعه

export function PersianDatePicker({ value, onChange, disabled }: PersianDatePickerProps) {
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState<Date>(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);

  useEffect(() => {
    setSelectedDate(value);
    if (value) {
      setCurrentDisplayMonth(startOfMonth(value, { locale: faIR }));
    } else {
      setCurrentDisplayMonth(startOfMonth(new Date(), { locale: faIR }));
    }
  }, [value]);

  const handlePrevMonth = () => {
    setCurrentDisplayMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDisplayMonth((prev) => addMonths(prev, 1));
  };

  const handleDateSelect = (day: Date) => {
    if (disabled && disabled(day)) {
      return;
    }
    setSelectedDate(day);
    if (onChange) {
      onChange(day);
    }
  };

  const monthStart = startOfMonth(currentDisplayMonth, { locale: faIR });
  const monthEnd = endOfMonth(currentDisplayMonth, { locale: faIR });
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate padding days for the start of the month
  // getDay returns 0 for Sunday, 6 for Saturday. faIR locale starts week on Saturday (6).
  const firstDayOfMonthWeekday = getDay(monthStart); // 0 (Sun) to 6 (Sat)
  const paddingDaysCount = (firstDayOfMonthWeekday - (faIR.options?.weekStartsOn || 6) + 7) % 7;
  const paddingCells = Array(paddingDaysCount).fill(null);


  return (
    <div className="p-3 w-full max-w-xs mx-auto bg-card text-card-foreground rounded-md shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="ماه قبل">
          <ChevronRight className="h-5 w-5" />
        </Button>
        <div className="text-sm font-semibold">
          {formatDateFnsJalali(currentDisplayMonth, 'LLLL yyyy', { locale: faIR })}
        </div>
        <Button variant="ghost" size="icon" onClick={handleNextMonth} aria-label="ماه بعد">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
        {WEEK_DAYS_PERSIAN.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {paddingCells.map((_, index) => (
          <div key={`padding-${index}`} className="h-9 w-9"></div>
        ))}
        {daysInMonth.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDisplayMonth = isSameMonth(day, currentDisplayMonth);
          const isDayDisabled = disabled ? disabled(day) : false;
          const isActualToday = isTodayJalali(day);

          return (
            <Button
              key={day.toString()}
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 p-0 font-normal rounded-full",
                !isCurrentDisplayMonth && "text-muted-foreground opacity-50",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary focus:text-primary-foreground",
                !isSelected && isActualToday && "bg-accent text-accent-foreground",
                isDayDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
                !isSelected && !isDayDisabled && isCurrentDisplayMonth && "hover:bg-accent/50"
              )}
              onClick={() => handleDateSelect(day)}
              disabled={isDayDisabled || !isCurrentDisplayMonth}
            >
              {formatDateFnsJalali(day, 'd', { locale: faIR })}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
