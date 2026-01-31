import Image from 'next/image'
import React from 'react'
import CourseList from './_components/CourseList'

const page = () => {
  return (
    <div className="mt-15">
        <div className="relative">
            <Image src={"/course-banner.gif"} alt="course-banner"
            width={1200}
            height={300}
            className="w-full h-[300px] object-cover"/>
          <div className="absolute top-0 h-full pt-24 lg:px-36 md:px-24 bg-linear-to-r from-black/80 to-white-50/50">
            <h2 className="font-bold text-6xl">Explore All Courses</h2>
             <p className="text-3xl">Explore all courses and enrolled to skill up</p>
          
          </div>
        </div>
        <div className="mt-8 px-10 md:px-24 lg:px-36">
            <h2 className="text-4xl">All Courses</h2>
            <CourseList/>
        </div>
    </div>
  )
}

export default page