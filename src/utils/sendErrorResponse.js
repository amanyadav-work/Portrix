
import { NextResponse } from 'next/server';

/**
 * Sends a standardized error response
 * @param {Object} options
 * @param {string} options.code - A short error code (e.g. "invalid_input")
 * @param {string} options.message - A human-readable message
 * @param {number} [options.status=400] - HTTP status code
 */
export function sendErrorResponse({ code, message, status = 400 }) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}
