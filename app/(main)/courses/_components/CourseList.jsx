
"use client"
import { useState} from "react"
import { useEffect } from "react"

import React from 'react'
import axios from "axios"
import Image from "next/image"
import { ChartNoAxesColumnIncreasingIcon } from "lucide-react"
import Link from "next/link"

const CourseList = () => {

    const [courseList,setCourseList] = useState([])
    const[loading,setLoading]=useState(false);
    useEffect(()=>{
        GetAllCourses()
    },[])
    const GetAllCourses = async()=>{
        setLoading(true);
        const result = await axios.get("/api/list")
      
       console.log(result);
       setCourseList(result?.data);
       setLoading(false);
    }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-3">{

        courseList?.map((course,index)=>(
            <Link href={'/courses/'+course?.courseId}  key={index} >
            <div className="border-4 rounded-xl hover:bg-zinc-900 cursor-pointer">
              <Image src={(course?.bannerImage).trimEnd()} unoptimized alt={course?.title}
              width={400}
              height={400}
              className="w-full rounded-t-lg h-[200px] object-cover"/>
              <div className="p-4">
               <h2 className="font-bold text-2xl">{course?.title}</h2>
               
               <p className="text-xl text-gray-400 line-clamp-2">{course?.desc}</p>
                
                <h2 className="bg-zinc-800 p-2 rounded-2xl items-center mt-3 px-4 p-1 inline-flex font-bold flex gap-2">
                    <ChartNoAxesColumnIncreasingIcon className="w-4 h-4"/>
                    {course?.level}
                </h2>
                </div>
                </div>
                </Link>
        ))
    }</div>
  )
}

export default CourseList