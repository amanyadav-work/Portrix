import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';


export async function POST(req) {
  await dbConnect();

  const { name, email, password } = await req.json();
  console.log("Registering user:", { name, email, password });

  if (!name || !email || !password) {
    return Response.json({ message: "Name, Email, and Password are required." }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return Response.json({ message: "Email already in use." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ email }, process.env.JWT_SECRET);
  return Response.json({ user, message: "Register successful", jwttoken: token }, { status: 201 });
}

