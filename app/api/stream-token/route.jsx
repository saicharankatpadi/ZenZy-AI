// app/api/stream-token/route.js
import { NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

export async function POST(req) {
  try {
    const { userId } = await req.json();
    
    const serverClient = new StreamClient(apiKey, apiSecret);
    const token = serverClient.generateUserToken({ 
      user_id: userId,
      validity_in_seconds: 3600 // 1 hour
    });

    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}