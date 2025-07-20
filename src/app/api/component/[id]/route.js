import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/mongoose'
import { sendErrorResponse } from '@/utils/sendErrorResponse'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // or restrict to your frontend domain
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Preflight response
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export async function GET(request, { params }) {
  const { id } = params

  try {
    await dbConnect()
    const Component = mongoose.connection.collection('components')
    const doc = await Component.findOne({ _id: id })

    if (!doc) {
      const errorRes = sendErrorResponse({
        code: 'not_found',
        message: 'Component not found',
        status: 404,
      })
      corsify(errorRes)
      return errorRes
    }

    const response = NextResponse.json({ code: doc.code })
    corsify(response)
    return response
  } catch (error) {
    console.error('Error fetching component:', error)
    const errorRes = sendErrorResponse({
      code: 'internal_error',
      message: 'Error fetching component',
      status: 500,
    })
    corsify(errorRes)
    return errorRes
  }
}

// Attach CORS headers to a response
function corsify(response) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
}
