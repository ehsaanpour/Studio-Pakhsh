import { NextResponse } from 'next/server';
import { getProducerByUsername, verifyProducerPassword } from '@/lib/producer-store';
import { getAdminByUsername, verifyAdminPassword } from '@/lib/admin-store';
import { SignJWT } from 'jose';
import type { User, Producer } from '@/types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-secret-key');

export async function POST(request: Request) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json({ message: 'Username, password, and role are required' }, { status: 400 });
    }

    let user: User | Producer | null = null;
    let isPasswordValid = false;

    if (role === 'admin') {
      user = await getAdminByUsername(username);
      if (user) {
        isPasswordValid = await verifyAdminPassword(username, password);
      }
    } else if (role === 'producer') {
      user = await getProducerByUsername(username);
      if (user) {
        isPasswordValid = await verifyProducerPassword(username, password);
      }
    } else {
      return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 });
    }

    if (user && isPasswordValid) {
      // Create session token
      const payload = { sub: user.username, role: role, name: user.name };
      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h') // Token expires in 1 hour
        .sign(secret);
      
      // Create the response and set the cookie
      const response = NextResponse.json({ message: 'Login successful', user: { name: user.name, role } }, { status: 200 });
      
      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });

      return response;

    } else {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
