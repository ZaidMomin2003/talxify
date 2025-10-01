// This file is no longer needed as the interview logic is now handled
// by the streaming /api/gemini-live endpoint.
// It can be deleted.

import { NextResponse } from 'next/server';

export async function POST() {
  return new Response('This endpoint is deprecated and no longer in use.', {
    status: 410,
  });
}
