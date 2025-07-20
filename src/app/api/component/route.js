import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/mongoose'




export async function POST(request) {
    try {
        await dbConnect()

        const { id, code } = await request.json()

        if (!code) {
            return NextResponse.json({ error: 'No code provided' }, { status: 400 })
        }

        // Minify the code by removing line breaks and extra spaces (basic minify)
        const minifiedCode = code.replace(/\s+/g, ' ').trim()

        const doc = {
            _id: id, // You can customize this to accept from request too
            code: minifiedCode,
            createdAt: new Date(),
        }

        const Component = mongoose.connection.collection('components')

        const result = await Component.updateOne(
            { _id: doc._id },
            { $set: doc },
            { upsert: true }
        )

        if (result.upsertedId) {
            return NextResponse.json({ message: 'Component inserted', id: result.upsertedId._id }, { status: 201 })
        } else if (result.modifiedCount > 0) {
            return NextResponse.json({ message: 'Component updated', id: doc._id })
        } else {
            return NextResponse.json({ message: 'Component already up-to-date', id: doc._id })
        }
    } catch (error) {
        console.error('Error saving component:', error)
        return NextResponse.json({ error: 'Error saving component', details: error.message }, { status: 500 })
    }
}
