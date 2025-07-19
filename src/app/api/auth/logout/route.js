// app/api/logout/route.js (or wherever your API routes live)
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

  // Clear the authToken cookie by setting it with an expired date
  response.cookies.set('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0), // Expire immediately
    sameSite: 'lax',
  });

  return response;
}
