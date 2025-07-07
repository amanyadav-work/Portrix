import { uploadModelGLB } from '@/lib/cloudinary';
import { dbConnect } from '@/lib/mongoose';
import Model from '@/models/Model';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { data, userId, sandboxId, name } = body;

    if (!data || !userId || !sandboxId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const url = await uploadModelGLB(data, userId, sandboxId);

    // Upsert: if model for this sandbox exists, update it; else create new
    const model = await Model.findOneAndUpdate(
      { userId, sandboxId },
      { url, name },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ url: model.url, model });
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    return NextResponse.json({ error: 'Upload failed', details: err.message }, { status: 500 });
  }
}
