"use client"

import { useUser } from '@clerk/nextjs'
import React from 'react'
import Image from 'next/image'

const WelcomeBanner = () => {
    const {user} = useUser()
  return (
    <div className="flex gap-3 items-center">
        <Image src={"/machine.webp"} alt="robot"
        width={120} height={120}/>
        <h2 className="text-2xl p-4 font-bold border bg-zinc-800 rounded-2xl rounded-bl-none">Welcome Back ,<span className="text-yellow-500">{user?.fullName}</span></h2>
       
    </div>
  )
}

export default WelcomeBanner