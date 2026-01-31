
"use client"
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'
import Image from "next/image"
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

const CourseDetailBanner = ({loading,refreshData,courseDetail}) => {
  const[loading_,setLoading_] = useState(false)
  
  const EnrollCourse=async()=>{
     setLoading_(true);
     const result= await axios.post("/api/join-course",{
      courseId:courseDetail?.courseId
     })
     console.log(result);
     toast.success("Course Enrolled");
     refreshData()
     setLoading_(false)
  }
  
  
  return (
    <div>
      {!courseDetail?

      <Skeleton className="w-full h-[300px] rounded-2xl"/>
      :<div className="relative">
      // To this (Safe Version):
<Image src={courseDetail?.bannerImage?.trimEnd() || "/placeholder.png"}
       alt={courseDetail?.title || "Course Banner"} // Providing a fallback string
       width={1400}
       height={300}
       className="w-full h-[350px] object-cover"/>
      <div className="text-3xl font-bold absolute top-0 pt-20 p-10 h-full  bg-linear-to-r from-black/80 to-white-50/50 md:px-24 lg:px-36">
           <h2 className="text-6xl">{courseDetail?.title}</h2>
           <p className="text-2xl mt-3 text-gray-400">{courseDetail?.desc}</p>
          
          
          {!courseDetail?.userEnrolled? <Button  disabled={loading_}  onClick= {EnrollCourse} className="text-2xl mt-7" size={"lg"} variant={'pixel'}  >{loading_ && <Loader2Icon className="animate-spin"></Loader2Icon>}Enroll Now</Button>
          :<Button variant={"pixel"} size={"lg"}className="text-2xl mt-7">Continue Learning....</Button>}
         </div>
         </div>

}
    </div>
  )
}

export default CourseDetailBanner