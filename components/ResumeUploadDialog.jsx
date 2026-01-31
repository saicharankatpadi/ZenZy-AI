"use client"
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { File, Loader2Icon, Sparkles, X, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import { v4 } from 'uuid'
import axios from "axios"
import { useRouter } from 'next/navigation'

const ResumeUploadDialog = ({ openResumeDialog, setOpenResumeDialog }) => {
  const [file, setFile] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Clear errors when a new file is picked
    }
  };

  
const onUploadAndAnalyzer = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const recordId = v4();
      const formData = new FormData();
      formData.append("recordId", recordId);
      formData.append("resumeFile", file);

      // 1. We fire the request. 
      // The backend should return IMMEDIATELY after triggering Inngest.
      await axios.post("/api/ai-resume-agent", formData);
      
      console.log("Inngest Triggered successfully");

      // 2. Redirect immediately to the analyzer page.
      // Your AiResumeAnalyzer page is already built to poll/wait for the data!
      router.push("/ai-resume-analyzer/" + recordId);
      setOpenResumeDialog(false);
    } catch (error) {
      console.error("Upload failed:", error);
      // Optional: Add a toast notification here
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={openResumeDialog} onOpenChange={(val) => !loading && setOpenResumeDialog(val)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Resume</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col items-center justify-center mt-4">
             

              {!file ? (
                <label 
                  htmlFor='resumeupload' 
                  className="w-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl hover:bg-primary/5 hover:border-primary/50 cursor-pointer transition-all group"
                >
                  <File className="w-12 h-12 text-slate-300 group-hover:text-primary transition-colors" />
                  <span className="mt-4 text-sm text-slate-500">Click to upload PDF</span>
                  <input 
                    type="file" 
                    id="resumeupload" 
                    accept=".pdf" 
                    onChange={onFileChange} 
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="w-full p-6 border-2 border-primary/20 bg-primary/5 rounded-2xl flex flex-col items-center relative">
                  {!loading && (
                    <button 
                      onClick={() => setFile(null)}
                      className="absolute top-2 right-2 p-1 hover:bg-primary/10 rounded-full text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <File className="w-10 h-10 text-primary mb-2" />
                  <span className="text-sm font-semibold text-primary truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button 
            variant="ghost" 
            disabled={loading} 
            onClick={() => setOpenResumeDialog(false)}
          >
            Cancel
          </Button>
          <Button disabled={!file || loading} className="gap-2" onClick={onUploadAndAnalyzer}>
            {loading ? (
              <>
                <Loader2Icon className="animate-spin w-4 h-4" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Resume
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResumeUploadDialog;