import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questions, jobTitle, jobDescription, techStack, resumeUrl } = body;

    const interview = await db.interview.create({
      data: {
        userId,
        jobTitle: jobTitle || "Technical Interview",
        jobDescription: jobDescription || "",
        resumeUrl: resumeUrl || "",
        status: "pending",
        currentIndex: 0,
        techStack: techStack || [],
        questions: {
          create: questions.map((q, idx) => ({
            questionText: typeof q === "string" ? q : q.question,
            type: "technical",
            orderIndex: idx,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({ interviewId: interview.id });
  } catch (error) {
    console.error("Create interview error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}