// app/components/CreateInterviewDialog.jsx
"use client"

import React, { useContext, useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResumeUpload from './ResumeUpload'
import JobDescription from './JobDescription'
import axios from 'axios'
import { Loader2Icon } from 'lucide-react'
import { UserDetailContext } from '@/context/UserDetailContext'
import { useRouter } from 'next/navigation'

const CreateInterviewDialog = () => {
  const [formData, setFormData] = useState()
  const [file, setFile] = useState();
  const router = useRouter()
  const [loading, setLoading] = useState(false)
 
  const { userDetail } = useContext(UserDetailContext);

  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }
    
  const onSubmit = async () => {
    setLoading(true)
    const formData_ = new FormData();
    formData_.append("file", file ?? "");
    formData_.append("jobTitle", formData?.jobTitle)
    formData_.append("jobDescription", formData?.jobDescription)
    
    try {
      // Generate questions using your existing API
      const res = await axios.post("/api/generate-interview-questions", formData_)
      console.log(res.data);
      
      if (!res.data?.questions || !Array.isArray(res.data.questions)) {
        alert("Failed to generate questions");
        return;
      }

      // Save to Prisma/Neon instead of Convex
      const saveRes = await fetch('/api/interview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: res.data.questions,
          resumeUrl: res?.data?.resumeUrl ?? "",
          uid: userDetail?._id,
          jobTitle: formData?.jobTitle ?? "",
          jobDescription: formData?.jobDescription ?? ""
        })
      });

      const data = await saveRes.json();
      
      if (data.interviewId) {
        router.push("/start-interview/" + data.interviewId)
      } else {
        alert("Failed to create interview");
      }

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button>+ Create Interview</Button>
      </DialogTrigger>
      <DialogContent className="min-w-3xl">
        <DialogHeader>
          <DialogTitle>Please submit following details</DialogTitle>
          <DialogDescription>
            <Tabs defaultValue="resume-upload" className="w-full mt-5">
              <TabsList>
                <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                <TabsTrigger value="job-description">Job Description</TabsTrigger>
              </TabsList>
              <TabsContent value="resume-upload">
                <ResumeUpload setFiles={(file) => setFile(file)} />
              </TabsContent>
              <TabsContent value="job-description">
                <JobDescription onHandleInputChange={onHandleInputChange} />
              </TabsContent>
            </Tabs>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-6">
          <DialogClose>
            <Button variant={"ghost"}>Cancel</Button>
          </DialogClose>
          <Button 
            onClick={onSubmit} 
            disabled={loading || (!file && (!formData?.jobTitle || !formData?.jobDescription))}
          >
            {loading && <Loader2Icon className="animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateInterviewDialog