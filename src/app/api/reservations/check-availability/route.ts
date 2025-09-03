import { NextResponse } from 'next/server';
import { readJsonFile } from '@/lib/fs-utils';
import type { StudioReservationRequest } from '@/types';

interface ReservationsData {
  reservations: StudioReservationRequest[];
}

const RESERVATIONS_FILE = 'reservations.json';

export async function POST(request: Request) {
  try {
    const { dateTime, studio, reservationIdToExclude } = await request.json();
    
    // Read existing reservations
    const data = await readJsonFile<ReservationsData>(RESERVATIONS_FILE);
    const reservations = data?.reservations || [];

    // Find conflicting reservations (same studio, same date, overlapping time)
    const conflictingReservation = reservations.find(reservation => {
      // Skip cancelled reservations
      if (reservation.status === 'cancelled') return false;
      
      // Skip the reservation being excluded (for edit operations)
      if (reservationIdToExclude && reservation.id === reservationIdToExclude) return false;

      // Only check reservations for the SAME studio
      if (reservation.studio !== studio) return false;

      // Only check reservations for the same date
      const reservationDate = new Date(reservation.dateTime.reservationDate);
      const requestedDate = new Date(dateTime.reservationDate);
      if (reservationDate.toDateString() !== requestedDate.toDateString()) return false;

      // Check for time overlap
      const reservationStart = reservation.dateTime.startTime;
      const reservationEnd = reservation.dateTime.endTime;
      const requestedStart = dateTime.startTime;
      const requestedEnd = dateTime.endTime;

      return (
        (requestedStart >= reservationStart && requestedStart < reservationEnd) ||
        (requestedEnd > reservationStart && requestedEnd <= reservationEnd) ||
        (requestedStart <= reservationStart && requestedEnd >= reservationEnd)
      );
    });

    const isAvailable = !conflictingReservation;
    
    let message;
    if (isAvailable) {
      message = 'این زمان و استودیو قابل رزرو است.';
    } else if (conflictingReservation) {
      // Get studio display name for the message
      const studioDisplayNames: { [key: string]: string } = {
        "studio2": "استودیو ۲ (فرانسه)",
        "studio5": "استودیو ۵ (-۳)",
        "studio6": "استودیو ۶ (مایا ناصر)"
      };
      const studioName = studioDisplayNames[studio] || studio;
      const conflictTime = `${conflictingReservation.dateTime.startTime} - ${conflictingReservation.dateTime.endTime}`;
      message = `این زمان در ${studioName} قبلاً رزرو شده است (${conflictTime}). لطفاً زمان دیگری انتخاب کنید یا استودیو دیگری را امتحان کنید.`;
    } else {
      message = 'این زمان قبلاً رزرو شده است.';
    }

    return NextResponse.json({ 
      isAvailable,
      message
    });
  } catch (error) {
    console.error('Error checking reservation availability:', error);
    return NextResponse.json({ 
      isAvailable: false,
      message: 'خطا در بررسی دسترسی‌پذیری زمان رزرو.'
    }, { status: 500 });
  }
}
