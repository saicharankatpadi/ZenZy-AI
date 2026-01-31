"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { feedbackSchema } from "@/lib/constants";

export async function createFeedback(params) {
  const { interviewId, transcript } = params;

  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const interview = await db.interview.findUnique({
      where: { id: interviewId, userId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          include: { answers: true },
        },
      },
    });

    if (!interview) throw new Error("Interview not found");

    const formattedTranscript = transcript
      ? transcript.map((item) => `- ${item.role}: ${item.content}`).join("\n")
      : interview.questions
          .map((q) => {
            const answer = q.answers[0]?.answerText || "No answer provided";
            return `- Interviewer: ${q.questionText}\n- Candidate: ${answer}`;
          })
          .join("\n");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
You are an expert technical interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.

Job Title: ${interview.jobTitle}
Job Description: ${interview.jobDescription || "Not provided"}

Interview Transcript:
${formattedTranscript}

Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
- **Communication Skills**: Clarity, articulation, structured responses.
- **Technical Knowledge**: Understanding of key concepts for the role.
- **Problem-Solving**: Ability to analyze problems and propose solutions.
- **Cultural & Role Fit**: Alignment with company values and job role.
- **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
      `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = await db.feedback.create({
      data: {
        interviewId,
        totalScore: object.totalScore,
        categoryScores: object.categoryScores,
        strengths: object.strengths,
        areasForImprovement: object.areasForImprovement,
        finalAssessment: object.finalAssessment,
      },
    });

    await db.interview.update({
      where: { id: interviewId },
      data: { status: "completed" },
    });

    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false, error: error.message };
  }
}

export async function getInterviewById(id) {
  try {
    const interview = await db.interview.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!interview) return null;

    return {
      ...interview,
      role: interview.jobTitle,
      techStack: interview.techStack || [],
    };
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

export async function getFeedbackByInterviewId(params) {
  const { interviewId, userId } = params;

  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId || currentUserId !== userId) {
      throw new Error("Unauthorized");
    }

    const feedback = await db.feedback.findUnique({
      where: { interviewId },
    });

    if (!feedback) return null;

    return {
      id: feedback.id,
      interviewId: feedback.interviewId,
      totalScore: feedback.totalScore,
      categoryScores: feedback.categoryScores,
      strengths: feedback.strengths,
      areasForImprovement: feedback.areasForImprovement,
      finalAssessment: feedback.finalAssessment,
      createdAt: feedback.createdAt,
    };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}

export async function getInterviewsByUserId(userId) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId || currentUserId !== userId) {
      throw new Error("Unauthorized");
    }

    const interviews = await db.interview.findMany({
      where: { userId },
      include: {
        feedback: true,
        _count: {
          select: { questions: true, answers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return interviews.map((interview) => ({
      ...interview,
      role: interview.jobTitle,
      techStack: interview.techStack || [],
      feedback: interview.feedback || null,
    }));
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return [];
  }
}