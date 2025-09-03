import { NextResponse } from 'next/server';
import { getProducerByUsername, updateProducer } from '@/lib/producer-store';
import { comparePassword } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword, username } = await request.json();
    console.log('Received producer password change request for:', username);

    // Get the producer
    const producer = await getProducerByUsername(username);
    if (!producer) {
      console.log('Producer not found:', username);
      return NextResponse.json({ message: 'Producer not found' }, { status: 404 });
    }

    // Verify current password
    const isPasswordCorrect = await comparePassword(currentPassword, producer.password);
    if (!isPasswordCorrect) {
      console.log('Incorrect current password provided for producer:', username);
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 401 });
    }

    // Update the password
    await updateProducer(producer.id, { password: newPassword });
    console.log('Password updated successfully for producer:', username);

    return NextResponse.json({ message: 'Password changed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error changing producer password:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 