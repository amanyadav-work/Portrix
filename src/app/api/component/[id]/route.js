import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/mongoose'
import { sendErrorResponse } from '@/utils/sendErrorResponse'

export async function GET(request, { params }) {
  const { id } = params  

  try {
    await dbConnect()

    const Component = mongoose.connection.collection('components')

    // _id in Mongo is an ObjectId, so you may need to convert id to ObjectId first:
    const objectId = new mongoose.Types.ObjectId(id)

    const doc = await Component.findOne({ _id: objectId })

    if (!doc) {
      return sendErrorResponse({ code: 'not_found', message: 'Component not found', status: 404 })
    }

    return NextResponse.json({ code: doc.code })
  } catch (error) {
    console.error('Error fetching component:', error)
    return sendErrorResponse({ code: 'internal_error', message: 'Error fetching component', status: 500 })
  }
}
