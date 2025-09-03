import { NextRequest, NextResponse } from 'next/server';
import { updatePakhshManager } from '@/lib/pakhsh-manager-store';

export async function PUT(request: NextRequest) {
  try {
    const { id, name, username, password, email, phone, workplace } = await request.json();

    if (!id || !name || !username || !phone) {
      return NextResponse.json(
        { error: 'شناسه، نام، نام کاربری و شماره تماس الزامی هستند.' },
        { status: 400 }
      );
    }

    const updatedManager = await updatePakhshManager(id, {
      name,
      username,
      email: email || '',
      phone,
      workplace: workplace || '',
      ...(password ? { password } : {}),
    });

    if (!updatedManager) {
      return NextResponse.json(
        { error: 'مدیر پخش یافت نشد.' },
        { status: 404 }
      );
    }

    // Return user data without password
    const { password: _, ...managerData } = updatedManager;
    return NextResponse.json(managerData);
  } catch (error) {
    console.error('Error updating pakhsh manager:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطا در بروزرسانی مدیر پخش' },
      { status: 400 }
    );
  }
}
