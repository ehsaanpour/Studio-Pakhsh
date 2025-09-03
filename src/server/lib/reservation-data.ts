'use server';

import { readJsonFile, writeJsonFile } from '@/lib/fs-utils';
import type { StudioReservationRequest } from '@/types';

interface ReservationsData {
  reservations: StudioReservationRequest[];
}

const RESERVATIONS_FILE = 'reservations.json';

function calculateDuration(startTime: string, endTime: string): number {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
        return 0;
    }
    const difference = end.getTime() - start.getTime();
    return difference / (1000 * 60 * 60);
}

async function getStoredReservations(): Promise<StudioReservationRequest[]> {
  try {
    const data = await readJsonFile<ReservationsData>(RESERVATIONS_FILE);
    return data?.reservations || [];
  } catch (error) {
    console.error('Error reading reservations file:', error);
    return [];
  }
}

async function saveReservations(reservations: StudioReservationRequest[]): Promise<void> {
  try {
    const correctedReservations = reservations.map(r => {
        if (r.type === 'producer') {
            r.studioServices.hoursPerDay = calculateDuration(r.dateTime.startTime, r.dateTime.endTime);
        }
        return r;
    });
    await writeJsonFile(RESERVATIONS_FILE, { reservations: correctedReservations });
  } catch (error) {
    console.error('Error saving reservations:', error);
    throw error;
  }
}

export async function getReservationsServer(): Promise<StudioReservationRequest[]> {
  try {
    return await getStoredReservations();
  } catch (error) {
    console.error('Server Error getting all reservations:', error);
    throw error;
  }
}

export async function addReservationServer(newRequests: Omit<StudioReservationRequest, 'id' | 'submittedAt' | 'status'>[]): Promise<void> {
  try {
    const existingReservations = await getStoredReservations();
    const reservationsWithIds = newRequests.map((request) => ({
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      submittedAt: new Date(),
      status: 'new' as const,
    }));
    const updatedReservations = [...existingReservations, ...reservationsWithIds];
    await saveReservations(updatedReservations);
  } catch (error) {
    console.error('Server Error adding reservations:', error);
    throw error;
  }
}

export async function updateReservationStatusServer(requestId: string, newStatus: StudioReservationRequest['status']): Promise<void> {
  try {
    const reservations = await getStoredReservations();
    const index = reservations.findIndex(r => r.id === requestId);
    if (index !== -1) {
      reservations[index].status = newStatus;
      reservations[index].updatedAt = new Date();
      await saveReservations(reservations);
    } else {
      throw new Error('Reservation not found');
    }
  } catch (error) {
    console.error('Server Error updating reservation status:', error);
    throw error;
  }
}

export async function assignEngineerToServer(reservationId: string, engineerIds: string[], engineerCount: number): Promise<void> {
  try {
    const reservations = await getStoredReservations();
    const index = reservations.findIndex(r => r.id === reservationId);
    if (index !== -1) {
      reservations[index].engineers = engineerIds;
      reservations[index].engineerCount = engineerCount;
      reservations[index].status = 'finalized';
      reservations[index].updatedAt = new Date();
      if ('engineerId' in reservations[index]) {
        delete (reservations[index] as any).engineerId;
      }
      await saveReservations(reservations);
    } else {
      throw new Error('Reservation not found');
    }
  } catch (error) {
    console.error('Server Error assigning engineer:', error);
    throw error;
  }
}

export async function deleteReservationServer(id: string): Promise<void> {
  try {
    const reservations = await getStoredReservations();
    const updatedReservations = reservations.filter(r => r.id !== id);
    if (reservations.length === updatedReservations.length) {
      throw new Error('Reservation to delete not found');
    }
    await saveReservations(updatedReservations);
  } catch (error) {
    console.error(`Server Error deleting reservation ${id}:`, error);
    throw error;
  }
}

export async function deleteAllReservationsServer(): Promise<void> {
  try {
    await saveReservations([]);
  } catch (error) {
    console.error('Server Error deleting all reservations:', error);
    throw error;
  }
}

