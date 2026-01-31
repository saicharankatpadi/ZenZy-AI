import { currentUser } from "@clerk/nextjs/server";
import { inngest } from "../../../lib/inngest/client"; 
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"; 
import { NextResponse } from "next/server";

// Set maxDuration for Vercel if needed, though this route returns fast
export const maxDuration = 60; 

export async function POST(req) {
    try {
        const formData = await req.formData();
        const resumeFile = formData.get("resumeFile");
        const recordId = formData.get("recordId");
        const user = await currentUser();

        if (!resumeFile || !recordId) {
            return NextResponse.json({ error: "Missing file or recordId" }, { status: 400 });
        }

        // 1. Use LangChain PDFLoader to extract text
        // This is done on the server side before the background job starts
        const loader = new PDFLoader(resumeFile);
        const docs = await loader.load();
        const fullText = docs.map(doc => doc.pageContent).join("\n");

        // 2. Convert the file to Base64 for ImageKit upload in the background
        const arrayBuffer = await resumeFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        // 3. Trigger Inngest
        // We do NOT 'await' the result of the AI here. 
        // We only await the sending of the event.
        await inngest.send({
            name: "AiResumeAgent",
            data: { 
                recordId,
                base64ResumeFile: base64,
                pdfText: fullText,
                aiAgentType: "/ai-resume-analyzer",
                userEmail: user?.primaryEmailAddress?.emailAddress
            }
        });

        // 4. Return immediately to the frontend
        // This prevents the "4.7m" hang you saw in your logs.
        return NextResponse.json({ 
            message: "Generation Started", 
            recordId: recordId 
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}