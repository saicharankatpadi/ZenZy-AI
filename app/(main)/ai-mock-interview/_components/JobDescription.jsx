import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'

const JobDescription = ({onHandleInputChange}) => {
  return (
    <div className="border rounded-2xl p-10">
    <div>
   <label>Job Title</label>
   <Input placeholder="Ex.Full Stack React Developer"
   onChange={(event)=>onHandleInputChange("jobTitle",event.target.value)}/>
   </div>
    <div className="mt-6">
   <label>Job Description</label>
   <Textarea className="h-[200px]" placeholder="Enter or paste Job Description"
   onChange={(event)=>onHandleInputChange("jobDescription",event.target.value)}/>
   </div>
   </div>
  )
}

export default JobDescription