import { getInterviewsByUserId } from "@/lib/actions/general.action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InterviewCard from "@/components/InterviewCard";
import { Plus, Sparkles } from "lucide-react";
import CreateInterviewDialog from "./_components/CreateInterviewDialog";

const AIMockInterviewPage = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const interviews = await getInterviewsByUserId(userId);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Interviews</h1>
          <p className="text-gray-600">
            Review your past interviews and AI feedback
          </p>
        </div>
      </div>

      {interviews.length === 0 ? (
        // ✅ EMPTY STATE: Centered Create Interview Card
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-3xl p-12 text-center max-w-md w-full hover:shadow-lg transition-all duration-300">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Start Your First Interview
            </h3>
            <p className="text-gray-600 mb-8">
              Upload your resume or enter a job description to generate AI-powered interview questions tailored to your profile.
            </p>
            <CreateInterviewDialog />
          </div>
        </div>
      ) : (
        // ✅ WITH INTERVIEWS: Grid + Create New at Bottom
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
            
            {/* Create New Interview Card at the end of grid */}
            <div className="flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:bg-blue-50/30 transition-all min-h-[300px]">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Create New Interview
              </h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Start a new mock interview practice session
              </p>
              <CreateInterviewDialog />
            </div>
          </div>
          
          {/* Alternative: Bottom floating bar style */}
          <div className="flex justify-center pt-8 border-t border-gray-100">
            <CreateInterviewDialog />
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMockInterviewPage;