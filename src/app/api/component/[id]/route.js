import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/mongoose'

export async function GET(request, { params }) {
    const { id } = PathParamsContext

    try {
        await dbConnect()

        const Component = mongoose.connection.collection('components')

        const doc = await Component.findOne({ _id: id })

        if (!doc) {
            return NextResponse.json({ error: 'Component not found' }, { status: 404 })
        }

        return NextResponse.json({ code: doc.code })
    } catch (error) {
        console.error('Error fetching component:', error)
        return NextResponse.json({ error: 'Error fetching component', details: error.message }, { status: 500 })
    }
}
