import { NextResponse } from 'next/server';
import { getProgramNamesServer, addProgramNameServer, removeProgramNameServer } from '@/server/lib/program-name-data';

export async function GET() {
  try {
    const programNames = await getProgramNamesServer();
    return NextResponse.json(programNames);
  } catch (error) {
    console.error('API Error fetching program names:', error);
    return NextResponse.json({ message: 'Error fetching program names' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { programName } = await request.json();
    if (!programName) {
      return NextResponse.json({ message: 'Program name is required' }, { status: 400 });
    }
    await addProgramNameServer(programName);
    return NextResponse.json({ message: 'Program name added successfully' }, { status: 201 });
  } catch (error) {
    console.error('API Error adding program name:', error);
    return NextResponse.json({ message: 'Error adding program name' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { programName } = await request.json();
    if (!programName) {
      return NextResponse.json({ message: 'Program name is required' }, { status: 400 });
    }
    await removeProgramNameServer(programName);
    return NextResponse.json({ message: 'Program name removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('API Error removing program name:', error);
    return NextResponse.json({ message: 'Error removing program name' }, { status: 500 });
  }
}
