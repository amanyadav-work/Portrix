import { dbConnect } from '@/lib/mongoose'
import Sandbox from '@/models/Sandbox'
import { sendErrorResponse } from '@/utils/sendErrorResponse'
import { verifyToken } from '@/utils/verifyToken'
import { convertFilesToZipData } from '@/utils/zipUtils'
import { NextResponse } from 'next/server'


export async function GET(req, { params }) {
  const { slug } = params
  // Extract JWT payload from cookie token
  const payload = await verifyToken(req);

  if (!payload) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (!slug) {
    return sendErrorResponse({
      code: 'missing_slug',
      message: 'Missing sandbox slug parameter',
      status: 400,
    })
  }

  try {
    await dbConnect()

    const sandbox = await Sandbox.findOne({ slug }).populate('modelID').lean();

    if (!sandbox) {
      return sendErrorResponse({
        code: 'not_found',
        message: 'Sandbox not found',
        status: 404,
      })
    }

    // Convert Buffer to base64 string to safely send in JSON
    const zipDataBase64 = sandbox.zipData
      ? sandbox.zipData.toString('base64')
      : null

      const { modelID, ...rest } = sandbox;
    // Return all sandbox data + base64 encoded zip
    return NextResponse.json({
      ...rest,
      zipData: zipDataBase64,
      modelInfo: modelID, // Include model info if populated
    })
  } catch (err) {
    console.error('[GET SANDBOX ERROR]', err)
    return sendErrorResponse({
      code: 'internal_error',
      message: err.message || 'Something went wrong',
      status: 500,
    })
  }
}



















// Endpoint to update an existing sandbox
export async function PATCH(req, { params }) {
  try {
    // Extract JWT payload from cookie token
    const isAuthenticated = await verifyToken(req);

    if (!isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = params;
    if (!slug) {
      return sendErrorResponse({
        code: 'missing_slug',
        message: 'Missing sandbox slug in URL',
        status: 400,
      });
    }

    const payload = await req.json();
    const { name, description, zipData, modelID } = payload;

    await dbConnect();

    const sandbox = await Sandbox.findOne({ slug });
    if (!sandbox) {
      return sendErrorResponse({
        code: 'not_found',
        message: 'Sandbox not found',
        status: 404,
      });
    }

    if (name) sandbox.name = name;
    if (description) sandbox.description = description;
    if (modelID) sandbox.modelID = modelID;


    if (zipData) {
      const buffer = Buffer.from(zipData, 'base64');
      sandbox.zipData = buffer;
    }

    await sandbox.save();

    return NextResponse.json({ sandbox }, { status: 200 });
  } catch (err) {
    console.error('[SANDBOX PATCH ERROR]', err);
    return sendErrorResponse({
      code: 'internal_error',
      message: err.message || 'Something went wrong',
      status: 500,
    });
  }
}
