import { NextResponse } from 'next/server';
import { getAllPakhshManagers } from '@/lib/pakhsh-manager-store';

export async function GET() {
  try {
    const managers = await getAllPakhshManagers();
    
    // Return managers without passwords
    const managersWithoutPasswords = managers.map(({ password, ...manager }) => manager);
    
    return NextResponse.json(managersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching pakhsh managers:', error);
    return NextResponse.json(
      { error: 'خطا در بارگذاری لیست مدیران پخش' },
      { status: 500 }
    );
  }
}
