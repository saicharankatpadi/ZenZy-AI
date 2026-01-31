"use client"

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs"
import React from "react"
import EmptyState from "./EmptyState";
import {useState} from "react"
import Image from "next/image";
const  Dashboard = ()=>{
    const {user} = useUser();
    const [interviewList,setInterviewList]= useState([])
    return(
        <div className="mt-15">
        <div className="py-20 px-10 md:px-28 lg:px-44 xl:px-56">
           
                <div>
                <h2 className="text-lg text-gray-500">My Dashboard</h2>
            <h2 className="text-3xl font-bold">Welcome ,{user?.fullName}</h2>
        </div>
         <div className="flex flex-row blue-gradient-dark rounded-3xl px-16 py-6 items-center justify-between max-sm:px-4">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2 className="text-3xl font-semibold">Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-light-100">
            Practice real interview questions & get instant feedback
          </p>

        
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </div>
        {interviewList.length==0 &&
          <EmptyState/>
        }
        </div>
    </div>
    )
}
export default Dashboard