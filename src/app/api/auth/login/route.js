import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '@/models/User';
import { dbConnect } from '@/lib/mongoose';
import { sendErrorResponse } from '@/utils/sendErrorResponse';

export async function POST(req) {
  try {
    await dbConnect();

    const { email, password, rememberMe  } = await req.json();

    if (!email || !password) {
      return sendErrorResponse({
        code: 'missing_fields',
        message: 'Email and password are required',
        status: 400,
      });
    }

    const user = await User.findOne({ email }).lean();

    if (!user) {
      return sendErrorResponse({
        code: 'user_not_found',
        message: 'User not found',
        status: 404,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendErrorResponse({
        code: 'incorrect_credentials',
        message: 'Incorrect email or password',
        status: 401,
      });
    }

    // Create JWT token
    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
      expiresIn: rememberMe ? '30d' : '2h', // controls JWT expiration itself
    });

    // Set secure cookie
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 2; // 30d or 2h
    const cookie = `authToken=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict; Secure`;

    return new Response(
      JSON.stringify({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        message: 'Login successful',
      }),
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return sendErrorResponse({
      code: 'login_failed',
      message: 'An unexpected error occurred during login',
      status: 500,
    });
  }
}
