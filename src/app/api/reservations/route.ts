import { NextResponse } from 'next/server';
import { getReservationsServer, addReservationServer, updateReservationStatusServer } from '@/server/lib/reservation-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const reservations = await getReservationsServer();
    if (id) {
      const reservation = reservations.find(r => r.id === id);
      if (reservation) {
        return NextResponse.json(reservation);
      } else {
        return NextResponse.json({ message: 'Reservation not found' }, { status: 404 });
      }
    }
    return NextResponse.json(reservations, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('API Error fetching reservations:', error);
    return NextResponse.json({ message: 'Error fetching reservations' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request: Request) {
  try {
    const { reservations } = await request.json();
    if (!Array.isArray(reservations) || reservations.length === 0) {
      return NextResponse.json({ message: 'Reservations array is required' }, { status: 400 });
    }
    await addReservationServer(reservations);
    return NextResponse.json({ message: 'Reservations added successfully' }, { status: 201 });
  } catch (error) {
    console.error('API Error adding reservations:', error);
    return NextResponse.json({ message: 'Error adding reservations' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { requestId, newStatus } = await request.json();
    if (!requestId || !newStatus) {
      return NextResponse.json({ message: 'Request ID and new status are required' }, { status: 400 });
    }
    await updateReservationStatusServer(requestId, newStatus);
    return NextResponse.json({ message: 'Reservation status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('API Error updating reservation status:', error);
    return NextResponse.json({ message: 'Error updating reservation status' }, { status: 500 });
  }
}

