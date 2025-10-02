// This file is no longer needed.
// The interview orchestration is being rebuilt.
import { NextResponse } from 'next/server';

export async function POST() {
  return new Response('This endpoint is inactive.', {
    status: 410,
  });
}
