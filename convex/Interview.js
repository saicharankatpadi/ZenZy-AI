import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Save interview questions (create new interview session)
export const SaveInterviewQuestion = mutation({
  args: {
    questions: v.any(),
    uid: v.id("UserTable"),
    resumeUrl: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert("InterviewSessionTable", {
      interviewQuestions: args.questions,
      resumeUrl: args.resumeUrl,
      userId: args.uid,
      status: "draft",
      jobTitle: args.jobTitle,
      jobDescription: args.jobDescription,
      answers: [],
    });
    return result;
  },
});

// Get one interview session by id
export const GetInterviewQuestions = query({
  args: {
    interviewRecordId: v.id("InterviewSessionTable"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("InterviewSessionTable")
      .filter((q) => q.eq(q.field("_id"), args.interviewRecordId))
      .collect();

    return result[0];
  },
});

// Save a single answer during interview
export const SaveAnswer = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
    question: v.string(),
    answer: v.string(),
    confidence: v.number(),
    timestamp: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.interviewId);
    const currentAnswers = existing?.answers || [];

    await ctx.db.patch(args.interviewId, {
      answers: [
        ...currentAnswers,
        {
          question: args.question,
          answer: args.answer,
          confidence: args.confidence,
          timestamp: args.timestamp,
        },
      ],
      status: "in_progress",
    });
  },
});

// Generate AI feedback using Gemini and passed answers
export const generateAIFeedback = action({
  args: {
    interviewId: v.id("InterviewSessionTable"),
    answers: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
        confidence: v.number(),
        timestamp: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    try {
      const answers = args.answers;

      const avgConfidence =
        answers.length > 0
          ? answers.reduce((sum, a) => sum + a.confidence, 0) /
            answers.length
          : 0;

      const qaContext = answers
        .map(
          (a, idx) => `Q${idx + 1}: ${a.question}\nA: ${a.answer}`
        )
        .join("\n\n");

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error("GEMINI_API_KEY not set in Convex environment");
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this interview and return JSON only:

${qaContext}

Average Confidence: ${avgConfidence}%

Return format:
{
  "overallScore": number,
  "technicalScore": number,
  "communicationScore": number,
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvementTips": ["string"]
}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${err}`);
      }

      const data = await response.json();

      // safe read
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Invalid Gemini response format");
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      const feedback = {
        overallScore: parsed.overallScore ?? Math.round(avgConfidence),
        technicalScore: parsed.technicalScore ?? 70,
        communicationScore: parsed.communicationScore ?? 75,
        confidenceScore: Math.round(avgConfidence),
        summary: parsed.summary ?? "Interview completed successfully",
        strengths: parsed.strengths ?? ["Good participation"],
        weaknesses: parsed.weaknesses ?? ["Could provide more detail"],
        improvementTips: parsed.improvementTips ?? ["Practice more"],
      };

      // save feedback in DB
      await ctx.runMutation(api.Interview.saveFeedback, {
        interviewId: args.interviewId,
        feedback,
      });

      return feedback;
    } catch (error) {
      console.error("generateAIFeedback error:", error);

      // fallback response
      const fallbackConfidence =
        args.answers.length > 0
          ? Math.round(
              args.answers.reduce((s, a) => s + a.confidence, 0) /
                args.answers.length
            )
          : 0;

      return {
        overallScore: 70,
        technicalScore: 70,
        communicationScore: 70,
        confidenceScore: fallbackConfidence,
        summary: "Error generating AI feedback: " + error.message,
        strengths: ["Unable to analyze answers"],
        weaknesses: ["AI service error"],
        improvementTips: [
          "Check GEMINI_API_KEY",
          "Check API quota and network",
        ],
      };
    }
  },
});

// Save final feedback to interview record
export const saveFeedback = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
    feedback: v.object({
      overallScore: v.number(),
      technicalScore: v.number(),
      communicationScore: v.number(),
      confidenceScore: v.number(),
      summary: v.string(),
      strengths: v.array(v.string()),
      weaknesses: v.array(v.string()),
      improvementTips: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interviewId, {
      feedback: args.feedback,
      status: "completed",
    });
  },
});
