import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/fs-utils';
import type { StudioReservationRequest } from '@/types';

const RESERVATIONS_FILE = 'reservations.json';

export async function PUT(request: Request) {
  try {
    const { id, formData: updatedData } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Reservation ID is required' }, { status: 400 });
    }

    const data = await readJsonFile<{ reservations: StudioReservationRequest[] }>(RESERVATIONS_FILE);
    const reservations = data?.reservations || [];

    const reservationIndex = reservations.findIndex((r) => r.id === id);

    if (reservationIndex === -1) {
      return NextResponse.json({ message: 'Reservation not found' }, { status: 404 });
    }

    const originalReservation = reservations[reservationIndex];

    // Construct the updated reservation object from the form data
    const updatedReservation: StudioReservationRequest = {
      ...originalReservation,
      programName: updatedData.programName,
      dateTime: {
        reservationDate: updatedData.reservationDate, // Expecting a string
        startTime: updatedData.reservationStartTime,
        endTime: updatedData.reservationEndTime,
      },
      studio: updatedData.studioSelection,
      studioServices: {
        ...originalReservation.studioServices,
        serviceType: updatedData.studioServiceType,
      },
      additionalServices: updatedData.additionalServices,
      details: updatedData.details,
      repetition: {
        type: updatedData.repetitionType,
        endDate: updatedData.repetitionEndDate, // Expecting a string or undefined
      },
      updatedAt: new Date(),
    };

    reservations[reservationIndex] = updatedReservation;

    await writeJsonFile(RESERVATIONS_FILE, { reservations });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

