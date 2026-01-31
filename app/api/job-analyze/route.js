import { currentUser } from "@clerk/nextjs/server";
import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobUrl, jobText } = await req.json();
    if (!jobUrl && !jobText) {
      return NextResponse.json({ error: "Provide job URL or text" }, { status: 400 });
    }

    // Validate URL format if provided
    if (jobUrl) {
      try {
        new URL(jobUrl);
      } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
      }
    }

    // 1. Create initial record in Database
    let analysis;
    try {
      analysis = await db.jobAnalysis.create({
        data: {
          userId: user.id,
          jobUrl: jobUrl || null,
          status: "analyzing",
        },
      });
    } catch (dbError) {
      console.error("PRISMA ERROR:", dbError);
      return NextResponse.json({ error: "Database save failed" }, { status: 500 });
    }

    // 2. Trigger background job via Inngest
    try {
      await inngest.send({
        name: "job.analyze",
        data: {
          analysisId: analysis.id,
          jobUrl,
          jobText,
          userId: user.id,
          userSkills: user.publicMetadata?.skills || [],
        },
      });
    } catch (inngestError) {
      console.error("INNGEST ERROR:", inngestError);
      return NextResponse.json({ error: "Background task failed to start" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Analysis started", 
      analysisId: analysis.id 
    });

  } catch (error) {
    console.error("GENERAL ROUTE ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });
    
    const analysis = await db.jobAnalysis.findUnique({ 
      where: { id } 
    });
    
    if (!analysis) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}