import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/fs-utils';
import type { StudioReservationRequest } from '@/types';

const RESERVATIONS_FILE = 'reservations.json';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'Reservation ID is required' }, { status: 400 });
    }

    const data = await readJsonFile<{ reservations: StudioReservationRequest[] }>(RESERVATIONS_FILE);
    const reservations = data?.reservations || [];

    const newReservations = reservations.filter((r: StudioReservationRequest) => r.id !== id);

    if (reservations.length === newReservations.length) {
      return NextResponse.json({ message: 'Reservation not found' }, { status: 404 });
    }

    await writeJsonFile(RESERVATIONS_FILE, { reservations: newReservations });

    return NextResponse.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

