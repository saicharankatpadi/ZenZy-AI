"use client"

import { Button } from '@/components/ui/button';
import { Book, LoaderCircle, PlayCircle, Settings } from 'lucide-react';
import Image from 'next/image'
import Link from 'next/link';
import React from 'react'
import { toast } from 'sonner';
import axios from 'axios';
import { useState } from 'react';
const CourseCard = ({course}) => {
    const [loading,setLoading] = useState()
    const courseJson = course?.courseJson?.course;
    const onEnrollCourse=async()=>{
      try{
        setLoading(true);
        const result = await axios.post("/api/enroll-course",{
            courseId:course?.cid
        });
        console.log(result.data);
        if(result.data.resp){
            toast.warning("Already Enrolled!");
            setLoading(false);
            return;
        }
        toast.success('Enrolled');
        setLoading(false);
      }catch(e){
        toast.error("Server side error");
        setLoading(false)
      }
    }
  
    return (
    <div className="shadow rounded-xl">

        <Image src={course?.bannerImageUrl} 
        alt={course?.name}
        width={200}
        height={300}
        className="w-full aspect-video rounded-t-xl object-cover"/>
   <div className="p-3 flex flex-col gap-3" >
    <h2 className="font-bold text-lg">{courseJson?.name}</h2>
    <p className="line-clamp-3 text-gray-400 text-sm">{courseJson?.description}</p>
    <div className="flex justify-between items-center">
        <h2 className="flex text-sm items-center gap-2"><Book className="text-primary h-5 w-5"/>{courseJson?.noOfChapters} Chapters </h2>
        {course?.courseContent?.length ?
       <Button onClick={onEnrollCourse}className={"sm"} disabled={loading}>{loading ?  <LoaderCircle className="animate-spin"/>:<PlayCircle/>}Start Learning</Button>:
       <Link href={"/ai-course-generator/"+course?.cid} ><Button size={"sm"}variant="outline"><Settings/> Generate Course</Button></Link>}
    </div>
   </div>
    </div>
  )
}

export default CourseCard