import { NextResponse } from 'next/server';
import { hashPassword, comparePassword } from '@/lib/utils'; // Import hashing utilities
import { readJsonFile, writeJsonFile } from '@/lib/fs-utils';
import type { User } from '@/types';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    console.log('Received password change request:', { currentPassword, newPassword });

    // Get current user from cookie
    const cookies = request.headers.get('cookie') || '';
    const userCookie = cookies.split(';').find(c => c.trim().startsWith('user='));
    
    if (!userCookie) {
      console.log('No user cookie found.');
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    let currentUser;
    try {
      const cookieValue = decodeURIComponent(userCookie.split('=')[1]);
      currentUser = JSON.parse(cookieValue);
      console.log('Current user from cookie:', currentUser);
    } catch (error) {
      console.log('Invalid user cookie:', error);
      return NextResponse.json({ message: 'Invalid authentication' }, { status: 401 });
    }

    if (!currentUser?.username) {
      console.log('No username in user cookie.');
      return NextResponse.json({ message: 'Invalid user data' }, { status: 401 });
    }

    // Use the proper data path utilities to read from /data/users.json
    const users = await readJsonFile<User[]>('users.json');
    console.log('Users data read from file:', users);
    
    if (!users) {
      console.log('Users file not found.');
      return NextResponse.json({ message: 'Users file not found' }, { status: 404 });
    }

    // Find the current user (not hardcoded to 'admin')
    const userIndex = users.findIndex((user: User) => user.username === currentUser.username);
    console.log(`User index for ${currentUser.username}:`, userIndex);

    if (userIndex === -1) {
      console.log(`User ${currentUser.username} not found.`);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!users[userIndex].password) {
      console.log(`No password found for user ${currentUser.username}.`);
      return NextResponse.json({ message: 'User password not found' }, { status: 404 });
    }

    console.log(`Current password in file for ${currentUser.username}:`, users[userIndex].password);
    const isPasswordCorrect = await comparePassword(currentPassword, users[userIndex].password);
    if (!isPasswordCorrect) {
      console.log('Incorrect current password provided.');
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 401 });
    }

    // Hash the new password before saving
    const hashedPassword = await hashPassword(newPassword);
    users[userIndex].password = hashedPassword;
    console.log(`New password (hashed) set in memory for ${currentUser.username}:`, users[userIndex].password);

    // Use the proper data path utilities to write to /data/users.json
    await writeJsonFile<User[]>('users.json', users);
    console.log('Users file written successfully with new password.');

    return NextResponse.json({ message: 'Password changed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
