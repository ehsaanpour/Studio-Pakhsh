import { NextRequest, NextResponse } from 'next/server';
import { deletePakhshManager } from '@/lib/pakhsh-manager-store';

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'شناسه مدیر پخش الزامی است.' },
        { status: 400 }
      );
    }

    await deletePakhshManager(id);
    return NextResponse.json({ message: 'مدیر پخش با موفقیت حذف شد.' });
  } catch (error) {
    console.error('Error deleting pakhsh manager:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطا در حذف مدیر پخش' },
      { status: 400 }
    );
  }
}
