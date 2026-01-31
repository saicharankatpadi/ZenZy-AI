import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { interviewId, questionId, answerText, confidence } = await req.json();

    const interview = await db.interview.findUnique({
      where: { id: interviewId, userId },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const question = await db.question.findFirst({
      where: { id: questionId, interviewId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Invalid question" },
        { status: 400 }
      );
    }

    const existingAnswer = await db.answer.findFirst({
      where: { interviewId, questionId },
    });

    if (existingAnswer) {
      const updated = await db.answer.update({
        where: { id: existingAnswer.id },
        data: { answerText, confidence: confidence || 0 },
      });
      return NextResponse.json({ success: true, answer: updated });
    }

    const answer = await db.answer.create({
      data: {
        interviewId,
        questionId,
        answerText,
        confidence: confidence || 0,
      },
    });

    return NextResponse.json({ success: true, answer });
  } catch (error) {
    console.error("Answer save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}