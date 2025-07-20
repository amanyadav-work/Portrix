import { uploadModelGLB } from '@/lib/cloudinary';
import { dbConnect } from '@/lib/mongoose';
import Model from '@/models/Model';
import { sendErrorResponse } from '@/utils/sendErrorResponse'; // import it
import { verifyToken } from '@/utils/verifyToken';
import { NextResponse } from 'next/server';


export async function GET(req) {
  try {
    const payload = await verifyToken(req)
    if (!payload) {
      return Response.json({ message: 'Unauthorized' }, { status: 400 });
    }
    const userID = payload.userID;

    if (!userID) {
      return sendErrorResponse({
        code: 'missing_user_id',
        message: 'Missing required fields',
        status: 400,
      });
    }

    await dbConnect();

    const models = await Model.find({ userID }).sort({ createdAt: -1 });

    return NextResponse.json(models);
  } catch (err) {
    console.error('[FETCH MODELS ERROR]', err);
    return sendErrorResponse({
      code: 'fetch_failed',
      message: err.message || 'Failed to fetch models',
      status: 500,
    });
  }
}


export async function POST(req) {
  try {
    const payload = await verifyToken(req)
    if (!payload) {
      return Response.json({ message: 'Unauthorized' }, { status: 400 });
    }
    const userID = payload.userID;

    const body = await req.json();
    const { data, name } = body;

    if (!data || !userID) {
      return sendErrorResponse({
        code: 'missing_fields',
        message: 'Missing required fields',
        status: 400,
      });
    }

    await dbConnect();

    const url = await uploadModelGLB(data, userID);

    try {
      const model = await Model.create({ userID, name, url });
      return NextResponse.json({ model });
    } catch (err) {
      if (err.code === 11000) {
        return sendErrorResponse({
          code: 'duplicate_model',
          message: 'Model with this name already exists.',
          status: 409,
        });
      }

      return sendErrorResponse({
        code: 'model_creation_failed',
        message: err.message || 'Failed to create model',
        status: 500,
      });
    }
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    return sendErrorResponse({
      code: 'upload_failed',
      message: err.message || 'Upload failed',
      status: 500,
    });
  }
}
