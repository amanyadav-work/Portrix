import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(req, context) {
  const { params } = await context;
  try {
    // Extract JWT payload from cookie token
    const payload = await verifyToken(req);

    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
    }

    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      console.error('User not found:', id);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
