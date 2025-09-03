import { NextRequest, NextResponse } from 'next/server';
import { addPakhshManager } from '@/lib/pakhsh-manager-store';

export async function POST(request: NextRequest) {
  try {
    const { name, username, password, email, phone, workplace } = await request.json();

    if (!name || !username || !password || !phone) {
      return NextResponse.json(
        { error: 'نام، نام کاربری، رمز عبور و شماره تماس الزامی هستند.' },
        { status: 400 }
      );
    }

    const newManager = await addPakhshManager({
      name,
      username,
      password,
      email: email || '',
      phone,
      workplace: workplace || '',
    });

    // Return user data without password
    const { password: _, ...managerData } = newManager;
    return NextResponse.json(managerData);
  } catch (error) {
    console.error('Error adding pakhsh manager:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطا در افزودن مدیر پخش' },
      { status: 400 }
    );
  }
}
