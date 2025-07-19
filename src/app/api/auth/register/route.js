import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import { sendErrorResponse } from '@/utils/sendErrorResponse';

export async function POST(req) {
  try {
    await dbConnect();

    const { name, email, password } = await req.json();
    console.log("Registering user:", { name, email });

    if (!name || !email || !password) {
      return sendErrorResponse({
        code: 'missing_fields',
        message: 'Name, email, and password are required.',
        status: 400,
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return sendErrorResponse({
        code: 'email_in_use',
        message: 'Email already in use.',
        status: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create JWT token with same expiry as login (optional: choose your expiry)
    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set secure cookie (same pattern as login)
    const maxAge = 60 * 60 * 24 * 7; // 7 days in seconds
    const cookie = `authToken=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict; Secure`;

    // Return only safe user data (omit password)
    return new Response(
      JSON.stringify({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        message: 'Register successful',
      }),
      {
        status: 201,
        headers: {
          'Set-Cookie': cookie,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    return sendErrorResponse({
      code: 'registration_failed',
      message: 'An unexpected error occurred during registration.',
      status: 500,
    });
  }
}
