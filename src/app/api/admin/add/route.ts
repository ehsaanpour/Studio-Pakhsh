import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { hashPassword } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { name, username, password } = await request.json();
    console.log('Received add admin request:', { name, username });

    const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');
    const usersData = await fs.readFile(usersFilePath, 'utf-8');
    const users = JSON.parse(usersData);

    // Check if username already exists
    if (users.some((user: any) => user.username === username)) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Add new admin
    users.push({
      name,
      username,
      password: hashedPassword,
      isAdmin: true
    });

    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    console.log('New admin added successfully');

    return NextResponse.json({ message: 'Admin added successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error adding admin:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 