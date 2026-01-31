"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const EnrolledCourses = () => {
    const[enrolledCourses,setEnrolledCourses]= useState([])
  return (
    <div className="mt-8">
        <h2 className="text-3xl mb-2 ">Your Enrolled Courses</h2>
        {enrolledCourses?.length == 0?
        <div className="flex flex-col items-center border p-7 rounded-2xl bg-zinc-900 gap-3">
           <Image src={"/books.png"} alt="book"
             width={90}
             height={90}
             />
             <h2 className="text-xl">You Don't have any enrolled Courses</h2>
             <Link href={"/courses"}>
              <Button variant={"pixel"} className="lg" size={"lg"}>
                Browse All Courses
              </Button>
             </Link>
            </div>
            :<div>
                CoursesList
                </div>}
    </div>
  )
}

export default EnrolledCourses