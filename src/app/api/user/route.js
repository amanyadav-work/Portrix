import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import { verifyToken } from '@/utils/verifyToken';

export async function GET(req) {
  await dbConnect();

  // Extract JWT payload from cookie token
  const payload = await verifyToken(req);

  if (!payload) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userID = payload.userID;

  // Fetch user by ID, exclude password
  const user = await User.findById(userID).select('-password').lean();

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  // Return user data as JSON response
  return NextResponse.json(user, { status: 200 });
}
