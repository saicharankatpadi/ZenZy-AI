
"use client"
import React from 'react'
import { useUser } from '@clerk/nextjs';
import { useEffect,useState } from 'react';
import axios from "axios"
import CourseCard from './_components/CourseCard';

const page = () => {
    const {user} = useUser();
    const[courseList,setCourseList] = useState([]);
    useEffect(()=>{
        user&&GetCourseList()
      },[user])
       const GetCourseList = async()=>{
        const result = await axios.get("/api/courses");
        console.log(result.data);
        setCourseList(result.data);
       }
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mt-15 xl:grid-cols-3 gap-5">{

        courseList?.map((course,index)=>(
            <CourseCard course={course} key={index}/>
        ))
    }</div>
  )
}

export default page