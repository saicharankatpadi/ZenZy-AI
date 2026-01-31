import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  UserTable: defineTable({
    // add your own user fields if needed
    name: v.optional(v.string()),
    email: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
  }),

  InterviewSessionTable: defineTable({
    // basic interview info
    interviewQuestions: v.any(),
    resumeUrl: v.optional(v.string()),
    userId: v.id("UserTable"),
    status: v.string(), // "draft" | "in_progress" | "completed"
    jobTitle: v.optional(v.string()),
    jobDescription: v.optional(v.string()),

    // answers collected during interview
    answers: v.optional(
      v.array(
        v.object({
          question: v.string(),
          answer: v.string(),
          confidence: v.number(),
          timestamp: v.string(),
        })
      )
    ),

    // final AI feedback
    feedback: v.optional(
      v.object({
        overallScore: v.number(),
        technicalScore: v.number(),
        communicationScore: v.number(),
        confidenceScore: v.number(),
        summary: v.string(),
        strengths: v.array(v.string()),
        weaknesses: v.array(v.string()),
        improvementTips: v.array(v.string()),
      })
    ),
  })
  // optional: index by user if you later want "all interviews of a user"
  .index("by_user", ["userId"]),
});
