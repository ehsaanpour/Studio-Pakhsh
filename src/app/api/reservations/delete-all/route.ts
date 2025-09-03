import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/fs-utils';
import type { StudioReservationRequest } from '@/types';

const RESERVATIONS_FILE = 'reservations.json';

export async function DELETE() {
  try {
    const data = await readJsonFile<{ reservations: StudioReservationRequest[] }>(RESERVATIONS_FILE);
    const reservations = data?.reservations || [];

    const remainingReservations = reservations.filter((r: StudioReservationRequest) => r.status !== 'cancelled');

    await writeJsonFile(RESERVATIONS_FILE, { reservations: remainingReservations });

    return NextResponse.json({ message: 'All rejected reservations have been deleted.' });
  } catch (error) {
    console.error('Error deleting all rejected reservations:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

