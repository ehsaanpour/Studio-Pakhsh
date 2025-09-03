import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');
    const usersData = await fs.readFile(usersFilePath, 'utf-8');
    const users = JSON.parse(usersData);

    // Filter only admin users and remove sensitive information
    const admins = users
      .filter((user: any) => user.isAdmin)
      .map(({ name, username }: any) => ({ name, username }));

    return NextResponse.json(admins, { status: 200 });
  } catch (error) {
    console.error('Error getting admin list:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 