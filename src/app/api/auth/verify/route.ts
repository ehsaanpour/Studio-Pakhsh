import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, getAdminByUsername } from '@/lib/admin-store';
import { verifyProducerPassword, getProducerByUsername } from '@/lib/producer-store';
import { verifyPakhshManagerPassword, getPakhshManagerByUsername } from '@/lib/pakhsh-manager-store';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('Authentication attempt for username:', username);

    if (!username || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی هستند.' },
        { status: 400 }
      );
    }

    // Try admin first
    try {
      const isValidAdmin = await verifyAdminPassword(username, password);
      if (isValidAdmin) {
        const adminUser = await getAdminByUsername(username);
        if (adminUser) {
          return NextResponse.json({
            success: true,
            user: {
              name: adminUser.name || username,
              username: adminUser.username,
              email: adminUser.email,
              phone: adminUser.phone,
              workplace: adminUser.workplace,
              isAdmin: true,
              isPakhshManager: false,
              profilePictureUrl: adminUser.profilePictureUrl,
            }
          });
        }
      }
    } catch (error) {
      console.log('Admin verification failed:', error);
    }

    // Try pakhsh manager
    try {
      console.log('Trying pakhsh manager authentication for:', username);
      const isValidPakhsh = await verifyPakhshManagerPassword(username, password);
      console.log('Pakhsh manager password verification result:', isValidPakhsh);
      
      if (isValidPakhsh) {
        const pakhshManager = await getPakhshManagerByUsername(username);
        console.log('Found pakhsh manager:', pakhshManager ? 'Yes' : 'No');
        
        if (pakhshManager) {
          console.log('Returning pakhsh manager user data');
          return NextResponse.json({
            success: true,
            user: {
              name: pakhshManager.name,
              username: pakhshManager.username,
              email: pakhshManager.email,
              phone: pakhshManager.phone,
              workplace: pakhshManager.workplace,
              isAdmin: false,
              isPakhshManager: true,
              profilePictureUrl: pakhshManager.profilePictureUrl,
            }
          });
        }
      }
    } catch (error) {
      console.log('Pakhsh manager verification failed with error:', error);
    }

    // Try producer
    try {
      const isValidProducer = await verifyProducerPassword(username, password);
      if (isValidProducer) {
        const producer = await getProducerByUsername(username);
        if (producer) {
          return NextResponse.json({
            success: true,
            user: {
              name: producer.name,
              username: producer.username,
              email: producer.email,
              phone: producer.phone,
              workplace: producer.workplace,
              isAdmin: false,
              isPakhshManager: false,
            }
          });
        }
      }
    } catch (error) {
      console.log('Producer verification failed:', error);
    }

    // If none matched
    return NextResponse.json(
      { success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در سیستم احراز هویت' },
      { status: 500 }
    );
  }
}
