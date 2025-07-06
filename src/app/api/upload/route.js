// app/api/upload/route.js
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  const body = await req.json();
  const { data, modelId } = body;

  try {
    const uploaded = await cloudinary.uploader.upload(data, {
      resource_type: 'raw',
      public_id: `models/${modelId}.glb`, // 👈 ADD .glb extension here
    });

    return NextResponse.json({ url: uploaded.secure_url });
  } catch (err) {
    return NextResponse.json({ error: 'Upload failed', details: err.message }, { status: 500 });
  }
}
