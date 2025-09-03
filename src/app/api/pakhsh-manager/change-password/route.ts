import { NextRequest, NextResponse } from 'next/server';
import { changePassword } from '@/lib/pakhsh-manager-store';

export async function POST(request: NextRequest) {
  try {
    const { username, oldPassword, newPassword } = await request.json();

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'تمام فیلدها الزامی هستند.' },
        { status: 400 }
      );
    }

    await changePassword(username, oldPassword, newPassword);
    return NextResponse.json({ message: 'رمز عبور با موفقیت تغییر کرد.' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطا در تغییر رمز عبور' },
      { status: 400 }
    );
  }
}
