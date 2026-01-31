"use client"
import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "./ui/input"
import { Switch } from "./ui/switch"
import { Button } from "./ui/button"
import { Loader2, Loader2Icon, Sparkle } from "lucide-react"
import { v4 } from 'uuid';
import axios from "axios"
import { useRouter } from "next/navigation"
const CourseDialog = ({openCourseDialog,setOpenCourseDialog}) => {
   const router = useRouter();
    const [formData,setFormData] = useState({
        name:"",
        description:"",
        includeVideo:false,
        noOfChapters:1,
        catetgory:"",
        level:''
    });

    const[loading,setLoading]=useState(false);
    const handleInputChange=(field,value)=>{
        setFormData(prev=>({
               ...prev,
               [field]:value
        }));
        console.log(formData)
    }
    const onGenerate=async()=>{
        console.log(formData);
        const courseId= v4()
        try{
        setLoading(true);
        const result = await axios.post("/api/generate-course-layout",{
            ...formData,
            courseId:courseId
        })
        console.log(result.data);
        setLoading(false);
        router.push("/ai-course-generator/"+courseId)
    }catch(e){
        setLoading(false);
        console.log(e);
    }
    }
  return (
    <Dialog open={openCourseDialog} onOpenChange={setOpenCourseDialog}>

  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Course Using AI</DialogTitle>
      <DialogDescription asChild>
        <div className="flex flex-col gap-4 mt-3">
            <div>
                <label>Course Name</label>
                <Input placeholder="Course Name"
                 onChange={(event)=>handleInputChange("name",event.target.value)}/>

                </div>
                     <div>
                <label>Course Description (Optional)</label>
                <Input placeholder="Course Description"
                 onChange={(event)=>handleInputChange("Description",event.target.value)}/>

                </div>
                  <div>
                <label>No. of Chapters </label>
                <Input placeholder="No of chapters" type="number"
                 onChange={(event)=>handleInputChange("No.of chapters",event.target.value)}/>

                </div>
                    <div className="flex gap-3 items-center">
                <label>Include Video</label>
               <Switch
                onCheckedChange={()=>handleInputChange("includeVideo",!formData?.includeVideo)}
               />

                </div>
                <div>
                    <label>Difficulty Level</label>
                    <Select className="mt-1" onValueChange={(value)=>handleInputChange("level",value)}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Diffculty Level" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="beginner">Begineer</SelectItem>
    <SelectItem value="moderate">Moderate</SelectItem>
    <SelectItem value="advance">Advanced</SelectItem>
  </SelectContent>
</Select> 
                </div>
                <div>
                    <label >Catetgory</label>
                    <Input placeholder="Category (Separated by comma)"
                     onChange={(event)=>handleInputChange("catetgory",event.target.value)}/>
                </div>
                <div className="mt-5">
                    <Button onClick={onGenerate}className={"w-full"} disabled={loading}>
                        {loading ? <Loader2Icon className="animate-spin"/>:<Sparkle/>}Generate Course</Button>
                </div>

                
        </div>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
  )
}

export default CourseDialog