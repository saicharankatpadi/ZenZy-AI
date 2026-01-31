"use client"
import { useParams } from 'next/navigation'
import axios from "axios"
import React, { useEffect, useState, useRef } from 'react';
import { Sparkle, Loader2Icon, CheckCircle2, AlertCircle } from 'lucide-react';
import ResumeUploadDialog from '@/components/ResumeUploadDialog';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

// --- UI Sub-Components ---
const ScoreCircle = ({ score = 0 }) => {
    const circumference = 2 * Math.PI * 36;
    const progress = score / 100;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="relative w-[100px] h-[100px]">
            <svg height="100%" width="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                <circle cx="50" cy="50" r="36" stroke="#e5e7eb" strokeWidth="8" fill="transparent" />
                <defs>
                    <linearGradient id="grad" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF97AD" />
                        <stop offset="100%" stopColor="#5171FF" />
                    </linearGradient>
                </defs>
                <circle
                    cx="50" cy="50" r="36" stroke="url(#grad)"
                    strokeWidth="8" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-bold text-lg">{score}</span>
            </div>
        </div>
    );
};

const AccordionItem = ({ title, score, comment, id, activeId, setActiveId }) => {
    const isOpen = activeId === id;
    const isGood = score > 70;
    const isWarning = score > 49 && score <= 70;
    
    const colorClass = isGood ? 'text-green-600' : isWarning ? 'text-yellow-600' : 'text-red-600';
    const bgClass = isGood ? 'bg-green-50' : isWarning ? 'bg-yellow-50' : 'bg-red-50';

    return (
        <div className="border-b border-gray-100 last:border-0">
            <button 
                onClick={() => setActiveId(isOpen ? null : id)}
                className="w-full py-4 px-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={cn("px-2 py-0.5 rounded text-xs font-bold", bgClass, colorClass)}>
                        {score}/100
                    </div>
                    <span className="font-medium text-gray-700 capitalize">{title.replace('_', ' ')}</span>
                </div>
                <svg className={cn("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={cn("overflow-hidden transition-all duration-300", isOpen ? "max-h-60 opacity-100 mb-4" : "max-h-0 opacity-0")}>
                <p className="px-2 text-sm text-gray-600 leading-relaxed border-l-2 border-gray-200 ml-2">
                    {comment}
                </p>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const AiResumeAnalyzer = () => {
  const params = useParams();
  // Standardizing recordId name (Check if your folder is [recordId] or [recordid])
  const recordid = params.recordId || params.recordid; 
  
  const [pdfUrl, setPdfUrl] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [openResumeDialog, setOpenResumeDialog] = useState(false);

  useEffect(() => {
    let interval;
    
    const GetResumeAnalyzerRecord = async () => {
      try {
        const result = await axios.get("/api/history?recordId=" + recordid);
        
        if (result.data) {
          // If metadata exists (ImageKit URL), set it immediately so the scan GIF disappears
          if (result.data.metaData) {
            setPdfUrl(result.data.metaData);
          }

          // If AI content exists, stop polling and show report
          if (result.data.content) {
            setAiReport(result.data.content);
            setLoading(false);
            if (interval) clearInterval(interval);
          }
        }
      } catch (error) {
        console.log("Waiting for Inngest background process...");
      }
    };

    if (recordid) {
      GetResumeAnalyzerRecord();
      // Polling every 3.5 seconds
      interval = setInterval(GetResumeAnalyzerRecord, 3500); 
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordid]);

  // Global Loading State - Matches your UI exactly
  if (loading && !pdfUrl) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <div className="flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
          <img 
            src="/resume-scan-2.gif" 
            alt="Scanning..." 
            className="w-80 h-80 object-contain mb-6" 
          />
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
              Analyzing Your Resume...
            </h3>
            <p className="text-gray-500 animate-pulse">
              Our AI is generating your report. Please wait.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sectionData = aiReport?.sections ? Object.entries(aiReport.sections) : [];

  return (
    <div className="mt-20 mb-10 px-6 max-w-[1440px] mx-auto">
      <div className="grid lg:grid-cols-5 grid-cols-1 gap-12">
        
        {/* Left Section: Report */}
        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left duration-700">
          <div className="flex justify-between items-center">
             <h2 className="font-extrabold text-3xl tracking-tight">Report</h2>
             <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setOpenResumeDialog(true)} 
                className="gap-2 shadow-sm border-gray-200"
             >
                Re-analyze <Sparkle size={16} className="text-blue-500" />
             </Button>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-6 mb-8">
              <ScoreCircle score={aiReport?.overall_score || 0} />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Resume Score</h2>
                <p className="text-blue-600 font-semibold">{aiReport?.overall_feedback || "Analysis in progress..."}</p>
                <p className="text-xs text-gray-400 mt-1">Based on content, structure, and impact</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm italic leading-relaxed bg-slate-50 p-4 rounded-xl border-l-4 border-blue-400">
              "{aiReport?.summary_comment || "Synthesizing AI feedback..."}"
            </p>
          </div>

          {/* ATS Score Panel */}
          <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-6 shadow-lg border border-green-100">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle2 className="text-white w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">ATS Suggestions</h2>
             </div>
             
             <div className="space-y-4">
                {aiReport?.tips_for_improvement ? (
                  aiReport.tips_for_improvement.slice(0, 4).map((tip, idx) => (
                    <div key={idx} className="flex gap-3 items-start group">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 leading-snug">
                            {tip.replace(/\*\*/g, '')}
                        </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">Generating ATS tips...</p>
                )}
             </div>
          </div>

          {/* Detailed breakdown list */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Section Breakdown</h3>
            <div className="divide-y divide-gray-50">
                {sectionData.length > 0 ? sectionData.map(([key, val], index) => (
                    <AccordionItem 
                        key={key}
                        id={index}
                        title={key}
                        score={val.score}
                        comment={val.comment}
                        activeId={activeSection}
                        setActiveId={setActiveSection}
                    />
                )) : (
                    <div className="py-10 text-center text-gray-400 text-sm italic">
                        Detailed breakdown is being generated...
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Right Section: Resume Preview */}
        <div className="lg:col-span-3 flex flex-col min-h-full">
          <h2 className="font-bold text-2xl mb-5 text-gray-800">Resume Preview</h2>
          
          <div className="sticky top-24 w-full flex-grow rounded-2xl shadow-2xl border-4 border-white bg-white overflow-hidden transition-all duration-500"
               style={{ height: 'calc(100vh - 160px)' }}>
            
            {pdfUrl ? (
              <iframe 
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                className="w-full h-full border-none"
                title="Resume Preview"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full p-10 text-center bg-white">
                <img 
                  src="/resume-scan-2.gif" 
                  alt="Scanning..." 
                  className="w-72 h-72 object-contain mb-6"
                />
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-700">Finalizing Preview...</h3>
                    <p className="text-gray-400 text-sm">Rendering your high-resolution document</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ResumeUploadDialog 
        openResumeDialog={openResumeDialog} 
        setOpenResumeDialog={() => setOpenResumeDialog(false)}
      />
    </div>
  )
}

export default AiResumeAnalyzer;