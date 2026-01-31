// app/api/getToken/route.js
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch("https://api.assemblyai.com/v2/realtime/token", {
            method: "POST",
            headers: {
                "Authorization": process.env.ASSEMBLY_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ expires_in: 3600 }),
        });

        const data = await response.json();
        // data should be { token: "..." }
        return NextResponse.json(data); 
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}