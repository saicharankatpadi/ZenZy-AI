import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("recordId");

    if (!recordId) {
      return NextResponse.json({ error: "recordId required" }, { status: 400 });
    }

    const result = await db.historyTable.findUnique({
      where: { recordId: recordId },
    });

    if (!result) {
      // Keep this for polling support
      return NextResponse.json({ 
        status: "processing",
        message: "Record pending creation" 
      });
    }

    // FIXED: Return "content" directly so result.data.content works in Frontend
    return NextResponse.json({
      status: "completed",
      content: result.content, // This maps to roadMapDetail in your UI
      metaData: result.metaData,
      createdAt: result.createdAt
    });

  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ 
      error: "Database error" 
    }, { status: 500 });
  }
}