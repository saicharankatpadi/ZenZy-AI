import { Button } from '@/components/ui/button';
import { Book, Clock, LoaderCircle, Settings, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react'
import axios from "axios"
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
const CourseInfo = ({course}) => {
    const courseLayout = course?.courseJson?.course;
    const [loading,setLoading] = useState(false)
    const router = useRouter();
    const GenerateCourseContent= async()=>{
      
         setLoading(true)
        try{
     
        const result = await axios.post("/api/generate-course-content",{
        courseJson:courseLayout,
        courseTitle:course?.name,
        courseId:course?.cid
      }) ;
      console.log(result.data);
      setLoading(false);
      router.replace("/");
      toast("Course generated Successfully")
    }catch(e){
       console.log(e);
       setLoading(false);
       toast.error("Server side error, Try Again")

    }
} 

    return (

    <div className="mt-15 md:flex gap-5 justify-between p-5 rounded-2xl shadow">
        <div className="flex flex-col gap-3">
            <h2 className="font-bold text-3xl">{courseLayout?.name}</h2>
        
          
           <p className="line-clamp-2 text-gray-500">{courseLayout?.description}</p>
           <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="flex gap-5 items-center p-3 rounded-lg shadow">
                <Clock className="text-blue-500"/>
                <section>
                    <h2 className="font-bold">Duration</h2>
                    <h2>2 Hours</h2>
                </section>
            </div>
             <div className="flex gap-5 items-center p-3 rounded-lg shadow">
                <Book className="text-green-500"/>
                <section>
                    <h2 className="font-bold">Chapter</h2>
                    <h2>2 Hours</h2>
                </section>
            </div>
             <div className="flex gap-5 items-center p-3 rounded-lg shadow">
                <TrendingUp className="text-red-500"/>
                <section>
                    <h2 className="font-bold">Duration</h2>
                    <h2>{course?.level}</h2>
                </section>
            </div>
           </div>
         <Button onClick={GenerateCourseContent}className={"max-w-sm"} disabled={loading}>{loading ? <LoaderCircle className="animate-spin"/>:<Settings/>}Generate Content</Button>
       
        </div>
        {/* ✅ Only render the image if course.bannerImageUrl is not empty */}
{course?.bannerImageUrl ? (
  <Image 
    src={course.bannerImageUrl} 
    width={1000} 
    height={400} 
    alt="Course Banner"
    className="w-full h-[240px] mt-5 md:mt-0  aspect-auto rounded-2xl object-cover"
  />
) : (
  <div className="w-full h-[300px] bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
    <span>Loading Banner...</span>
  </div>
)}
       
      
    </div>
  )
}

export default CourseInfo