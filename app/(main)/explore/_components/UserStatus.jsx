"use client"
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import React from "react"


const UserStatus = ()=>{
    const {user} = useUser()
    return(
       <div className="p-4 border-4 rounded-2xl">
        <div className="flex gap-3 items-center">
        <Image src={"/alex_walk.gif"}  unoptimized alt="walking_user"

        width={70}
        height={70}/>
        <h2 className="font-game text-2xl">{user?.primaryEmailAddress?.emailAddress}</h2>
        </div>
        <div className="grid grid-cols-2 gap-5">
            <div className="flex gap-3 items-center">
              <Image  src={"/star.png"} alt="star"  width={35} height={35}/>
              <div>
                <h2 className="text-3xl">20</h2>
                <h2 className="text-gray-400 text-xl">Total Rewards</h2>
               </div>
            </div>
            <div className="flex gap-3 items-center">
              <Image  src={"/badge.png"} alt="star"  width={35} height={35}/>
              <div>
                <h2 className="text-3xl">3</h2>
                <h2 className="text-gray-400 text-xl">Badge</h2>
               </div>
            </div>
            <div className="flex gap-3 items-center">
              <Image  src={"/fire.png"} alt="star"  width={35} height={35}/>
              <div>
                <h2 className="text-3xl">20</h2>
                <h2 className="text-gray-400 text-xl">Daily Streak</h2>
               </div>
            </div>
        </div>
    </div>
    )
}

export default UserStatus;