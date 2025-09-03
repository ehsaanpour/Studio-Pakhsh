"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Engineer, StudioReservationRequest } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format as formatPersian, getDate, getMonth, getYear, setDate, setMonth, addMonths } from 'date-fns-jalali';
import faIR from 'date-fns-jalali/locale/fa-IR';

type ShiftData = {
  engineerName: string;
  shifts: {
    under1Hour: number;
    between1And2Hours: number;
    between3And4Hours: number;
  };
};

export default function EngineerShiftsPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [reservations, setReservations] = useState<StudioReservationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      setIsLoading(true);
      const [engineersRes, reservationsRes] = await Promise.all([
        fetch("/api/engineer/list", { cache: "no-store" }),
        fetch("/api/reservations", { cache: "no-store" }),
      ]);
      if (!engineersRes.ok) throw new Error("Failed to fetch engineers");
      if (!reservationsRes.ok) throw new Error("Failed to fetch reservations");
      const engineersData = await engineersRes.json();
      const reservationsData = await reservationsRes.json();
      setEngineers(engineersData);
      setReservations(reservationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const { shiftData, dateRangeText } = useMemo(() => {
    const today = new Date();
    const persianDate = getDate(today);
    const persianMonth = getMonth(today);
    const persianYear = getYear(today);

    let startDate: Date;
    let endDate: Date;

    if (persianDate <= 20) {
      startDate = setDate(setMonth(today, persianMonth - 1), 21);
      endDate = setDate(today, 20);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = setDate(today, 21);
      endDate = setDate(setMonth(today, persianMonth + 1), 20);
      endDate.setHours(23, 59, 59, 999);
    }

    const dateRangeText = `محاسبه برنامه‌ها از ${formatPersian(startDate, 'd LLLL yyyy', { locale: faIR })} تا ${formatPersian(endDate, 'd LLLL yyyy', { locale: faIR })}`;

    const filteredReservations = reservations.filter(reservation => {
      const reservationDate = new Date(reservation.dateTime.reservationDate);
      return reservationDate >= startDate && reservationDate <= endDate && (reservation.status === 'confirmed' || reservation.status === 'finalized');
    });

    const data = engineers.map(engineer => ({
      engineerName: engineer.name,
      shifts: {
        under1Hour: 0,
        between1And2Hours: 0,
        between3And4Hours: 0,
      }
    }));

    filteredReservations.forEach(reservation => {
      const assignedEngineers = [];
      
      if (reservation.engineers && reservation.engineers.length > 0) {
        assignedEngineers.push(...reservation.engineers.filter(id => id));
      } else if ((reservation as any).engineerId) {
        assignedEngineers.push((reservation as any).engineerId);
      }
      
      if (assignedEngineers.length === 0) return;

      assignedEngineers.forEach(engineerId => {
        if (!engineerId) return;
        const engineerIndex = engineers.findIndex(e => e.id === engineerId);
        if (engineerIndex === -1) return;

        const duration = reservation.studioServices?.hoursPerDay || 0;

        if (duration > 0 && duration < 1) {
          data[engineerIndex].shifts.under1Hour++;
        } else if (duration >= 1 && duration <= 2) {
          data[engineerIndex].shifts.between1And2Hours++;
        } else if (duration >= 3 && duration <= 4) {
          data[engineerIndex].shifts.between3And4Hours++;
        } else if (duration > 4) {
          data[engineerIndex].shifts.between3And4Hours += 2;
        }
      });
    });

    return { shiftData: data, dateRangeText };
  }, [engineers, reservations]);

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold">محاسبه شیفت مهندسین</h1>
      {isLoading && <p>در حال بارگذاری...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <Card>
        <CardHeader>
          <CardTitle>جدول شیفت مهندسین</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">{dateRangeText}</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">نام مهندس</TableHead>
                <TableHead className="text-right">برنامه‌های زیر ۱ ساعت</TableHead>
                <TableHead className="text-right">برنامه‌های بین ۱ و ۲ ساعت</TableHead>
                <TableHead className="text-right">برنامه‌های بین ۳ و ۴ ساعت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shiftData.map((row: ShiftData, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-right">{row.engineerName}</TableCell>
                  <TableCell className="text-right">{row.shifts.under1Hour}</TableCell>
                  <TableCell className="text-right">{row.shifts.between1And2Hours}</TableCell>
                  <TableCell className="text-right">{row.shifts.between3And4Hours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
