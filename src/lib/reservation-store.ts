'use client';

import type { StudioReservationRequest, PersonalInformation, ReservationDateTime, StudioSelection, StudioServicesInfo, AdditionalService, CateringService, Repetition } from '@/types';
import type { GuestFormValues } from '@/components/forms/guest-reservation-form';
import type { ProducerFormValues } from '@/components/forms/producer-reservation-form';

// Helper to format date to YYYY-MM-DD
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


export async function getReservations(): Promise<StudioReservationRequest[]> {
  try {
    const response = await fetch('/api/reservations');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const reservationsWithDates = data.map((reservation: StudioReservationRequest) => ({
      ...reservation,
      submittedAt: new Date(reservation.submittedAt)
    }));
    return reservationsWithDates.sort((a: StudioReservationRequest, b: StudioReservationRequest) => b.submittedAt.getTime() - a.submittedAt.getTime());
  } catch (error) {
    console.error('Error fetching reservations from API:', error);
    return [];
  }
}

export async function getReservationById(id: string): Promise<StudioReservationRequest | null> {
  try {
    const response = await fetch(`/api/reservations?id=${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const reservation = await response.json();
    return {
      ...reservation,
      submittedAt: new Date(reservation.submittedAt),
    };
  } catch (error) {
    console.error('Error fetching reservation by ID from API:', error);
    return null;
  }
}

// This function now accepts an array of reservations to prevent duplicate API calls from loops.
export async function addReservations(
  reservations: Omit<StudioReservationRequest, 'id' | 'submittedAt' | 'status'>[]
): Promise<void> {
  try {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reservations }), // Send the array of reservations
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error adding reservations via API:', error);
    throw error;
  }
}

export async function updateReservationStatus(requestId: string, newStatus: StudioReservationRequest['status']): Promise<void> {
  try {
    const response = await fetch('/api/reservations', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId, newStatus }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating reservation status via API:', error);
    throw error;
  }
}

export async function deleteReservation(requestId: string): Promise<void> {
  try {
    const response = await fetch('/api/reservations/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: requestId }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting reservation via API:', error);
    throw error;
  }
}

export async function deleteAllRejectedReservations(): Promise<void> {
  try {
    const response = await fetch('/api/reservations/delete-all', {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting all rejected reservations via API:', error);
    throw error;
  }
}

export async function updateReservation(id: string, formData: ProducerFormValues): Promise<void> {
  try {
    const formattedData = {
      ...formData,
      reservationDate: formatDateToYYYYMMDD(formData.reservationDate),
      repetitionEndDate: formData.repetitionEndDate ? formatDateToYYYYMMDD(formData.repetitionEndDate) : undefined,
    };

    const response = await fetch('/api/reservations/edit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, formData: formattedData }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating reservation via API:', error);
    throw error;
  }
}

