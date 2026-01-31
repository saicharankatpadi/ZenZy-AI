// app/interview/[id]/feedback/page.jsx

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getFeedbackByInterviewId, getInterviewById } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { 
  Star, 
  Calendar, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  RotateCcw 
} from "lucide-react";

const InterviewFeedbackPage = async ({ params }) => {
  const { id } = await params;
  const { userId } = await auth();
  
  if (!userId) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/ai-mock-interview");

  const feedback = await getFeedbackByInterviewId({ interviewId: id, userId });

  if (!feedback) redirect(`/start-interview/${id}/begin`);

  return (
    <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Feedback on the Interview -{" "}
          <span className="capitalize text-blue-600">{interview.role}</span> Interview
        </h1>
        
        <div className="flex flex-wrap justify-center gap-4">
          {/* Overall Score */}
          <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <p className="text-gray-700">
              Overall Impression:{" "}
              <span className="text-blue-600 font-bold text-lg">
                {feedback?.totalScore}
              </span>
              <span className="text-gray-400">/100</span>
            </p>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
            <Calendar className="w-5 h-5 text-gray-500" />
            <p className="text-gray-700">
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Final Assessment */}
      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Final Assessment
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {feedback?.finalAssessment || "No assessment provided."}
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Breakdown of the Interview:
        </h2>
        
        <div className="grid gap-4">
          {feedback?.categoryScores?.map((category, index) => (
            <div 
              key={index} 
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <p className="font-bold text-gray-800 text-lg">
                  {index + 1}. {category.name}
                </p>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                  {category.score}/100
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">{category.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100">
          <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Strengths
          </h3>
          <ul className="space-y-3">
            {feedback?.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
          <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {feedback?.areasForImprovement?.map((area, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <Button variant="outline" className="flex-1 h-14 rounded-xl" asChild>
          <Link href="/ai-mock-interview" className="flex items-center justify-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </Button>

        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl shadow-lg" asChild>
          <Link 
            href={`/start-interview/${id}/begin`}
            className="flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Interview
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default InterviewFeedbackPage;