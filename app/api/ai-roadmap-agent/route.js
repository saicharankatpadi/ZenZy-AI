
import { currentUser } from "@clerk/nextjs/server";
import { inngest } from "../../../lib/inngest/client"; 
//import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"; 
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { roadmapId, userInput } = await req.json();
        const user = await currentUser();

        // 1. Send event to Inngest (This is near-instant)
        await inngest.send({
            name: "AiRoadMapAgent",
            data: { 
                userInput: userInput,
                roadmapId: roadmapId,
                userEmail: user?.primaryEmailAddress?.emailAddress
            }
        });

        // 2. Immediately tell the Frontend: "I've started, go check the history table"
        return NextResponse.json({
            message: "Generation Started",
            roadmapId: roadmapId,
            status: "processing"
        });

    } catch (error) {
        console.error("API Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}