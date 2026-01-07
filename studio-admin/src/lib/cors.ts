import { NextResponse } from 'next/server';

// List of allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://shivay-video.vercel.app',
  process.env.NEXT_PUBLIC_FRONTEND_URL,
].filter(Boolean);

export function corsHeaders(origin?: string | null) {
  // Check if the origin is allowed
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCors(request: Request) {
  const origin = request.headers.get('origin');
  return corsHeaders(origin);
}

// Helper to create a response with CORS headers
export function createCorsResponse(data: any, status = 200, request?: Request) {
  const headers = request ? handleCors(request) : corsHeaders();
  return NextResponse.json(data, { status, headers });
}

// Handle OPTIONS preflight request
export function handleOptions(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: handleCors(request),
  });
}
