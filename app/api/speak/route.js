import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req) {
  try {
    const { text } = await req.json();

    const audio = await client.generate({
      voice: "Rachel",
      text: text,
      model_id: "eleven_multilingual_v2",
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}