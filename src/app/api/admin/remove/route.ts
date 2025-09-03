import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    console.log('Received remove admin request for:', username);

    const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');
    const usersData = await fs.readFile(usersFilePath, 'utf-8');
    const users = JSON.parse(usersData);

    // Don't allow removing the main admin account
    if (username === 'admin') {
      return NextResponse.json({ message: 'Cannot remove the main admin account' }, { status: 400 });
    }

    // Find and remove the admin
    const updatedUsers = users.filter((user: any) => user.username !== username);
    
    if (updatedUsers.length === users.length) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    await fs.writeFile(usersFilePath, JSON.stringify(updatedUsers, null, 2), 'utf-8');
    console.log('Admin removed successfully');

    return NextResponse.json({ message: 'Admin removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 