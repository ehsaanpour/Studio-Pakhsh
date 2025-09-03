import { NextRequest, NextResponse } from 'next/server';
import { assignEngineerToServer } from '@/server/lib/reservation-data';

export async function POST(req: NextRequest) {
  try {
    const { reservationId, engineerIds, engineerCount } = await req.json();

    if (!reservationId || !Array.isArray(engineerIds)) {
      return NextResponse.json({ error: 'Reservation ID and an array of Engineer IDs are required' }, { status: 400 });
    }

    await assignEngineerToServer(reservationId, engineerIds, engineerCount);

    return NextResponse.json({ message: 'Engineers assigned successfully' }, { status: 200 });
  } catch (error) {
    console.error('API Error assigning engineer:', error);
    return NextResponse.json({ error: 'Failed to assign engineer' }, { status: 500 });
  }
}
