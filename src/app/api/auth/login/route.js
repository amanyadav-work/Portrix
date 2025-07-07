import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '@/models/User';
import { dbConnect } from '@/lib/mongoose';

export async function POST(req) {
    await dbConnect();

    const { email, password } = await req.json();

    let user = await User.findOne({ email }).lean();

    if (!user) {
        return Response.json({ message: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return Response.json({ message: 'Incorrect Password' }, { status: 401 });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET);
    return Response.json({ user, message: 'Login successful', jwttoken: token }, { status: 201 });
}