"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import DisplayTechIcons from "./DisplayTechIcons";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MessageSquare, Star, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFeedback } from "@/lib/actions/general.action";

const InterviewCard = ({ interview }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const hasFeedback = !!interview.feedback;

  const handleGenerateFeedback = async () => {
    setLoading(true);
    try {
      await createFeedback({ interviewId: interview.id });
      router.push(`/interview/${interview.id}/feedback`);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 capitalize mb-1">
              {interview.role || interview.jobTitle}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Calendar size={14} />
              <span>{formatDate(interview.createdAt)}</span>
            </div>
          </div>

          {hasFeedback && (
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
              <Star
                size={16}
                className="text-yellow-500 fill-yellow-500"
              />
              <span className="font-bold text-yellow-700">
                {interview.feedback.totalScore}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageSquare size={16} />
            <span>
              {interview._count?.questions || interview.questions?.length || 0}{" "}
              Questions
            </span>
          </div>
          <DisplayTechIcons techStack={interview.techStack || []} />
        </div>

        <div className="flex gap-2">
          {interview.status === "completed" ? (
            hasFeedback ? (
              <Link href={`/interview/${interview.id}/feedback`} className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  View Feedback
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleGenerateFeedback}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : null}
                Generate Feedback
              </Button>
            )
          ) : (
            <Link
              href={`/start-interview/${interview.id}/begin`}
              className="flex-1"
            >
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                Continue Interview
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InterviewCard;