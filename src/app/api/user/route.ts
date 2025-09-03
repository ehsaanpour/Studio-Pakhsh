import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { User, Producer } from '../../../types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-secret-key');

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { value } = sessionCookie;
    const { payload } = await jwtVerify(value, secret, {
      algorithms: ['HS256'],
    });

    const { sub, role, name } = payload;

    if (!sub || !role) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({ user: { username: sub, role, name } });

  } catch (error) {
    console.error('User route error:', error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
  }
}
