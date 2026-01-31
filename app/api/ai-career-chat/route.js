import { inngest } from "../../../lib/inngest/client"; // Fixed Import
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
    try {
        const { userInput } = await req.json();
        
        const resultIds = await inngest.send({
            name: "AiCareerAgent",
            data: { userInput: userInput }
        });

        const runId = resultIds?.ids[0];
        let runStatus;
        let attempts = 0;

        // Polling loop with safety and delay
        while (attempts < 30) { // Safety: Stop after 30 seconds
            runStatus = await getRuns(runId);
            
            if (runStatus?.data[0]?.status === "completed") {
                break;
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        }

        return NextResponse.json(runStatus.data?.[0].output?.output[0]);

    } catch (error) {
        console.error("API Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function getRuns(runId) {
    // Ensure INNGEST_SERVER_HOST is http://127.0.0.1:8288 for local dev
    const host = process.env.INNGEST_SERVER_HOST || "http://127.0.0.1:8288";
    const result = await axios.get(`${host}/v1/events/${runId}/runs`, {
        headers: {
            Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`
        }
    });
    return result.data;
}