import { dbConnect } from '@/lib/mongoose'
import Sandbox from '@/models/Sandbox'
import { sendErrorResponse } from '@/utils/sendErrorResponse'
import { verifyToken } from '@/utils/verifyToken'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await dbConnect()
    const payload = await verifyToken(req)
    if (!payload) {
      return Response.json({ message: 'Unauthorized' }, { status: 400 });
    }
    const userID = payload.userID;
    const sandboxes = await Sandbox.find({ userID }).lean()

    return NextResponse.json({ sandboxes }, { status: 200 })
  } catch (err) {
    console.error('[SANDBOX GET ERROR]', err)
    return sendErrorResponse({
      code: 'fetch_failed',
      message: err.message || 'Failed to fetch sandboxes',
      status: 500,
    })
  }
}
