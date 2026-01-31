"use client"



import React from 'react'



import Image from "next/image"

import { Button } from '@/components/ui/button'

import { ArrowRight, Send } from 'lucide-react'

import { Input } from '@/components/ui/input'

import Link from 'next/link'

import { useParams } from 'next/navigation'

const page = () => {

  const {interviewId} = useParams()



  return (

    <div className="flex flex-col items-center justify-center mt-24">

       <div className="w-full rounded-3xl max-w-3xl">

        <Image src={"/mock.jpeg"}

        alt="interview"

        width={800}

        height={300}

        className="w-full h-[300px] rounded-2xl object-contain bg-black/10"

        />

        <div className="p-6 flex flex-col items-center space-y-5">

     

        <h2 className="font-bold text-3xl text-center">Ready to Start Interview ?</h2>

        <p className="text-gray-500 text-center">

            The interview will last 30 minutes .Are you ready to begin</p>

        <Link href={"/start-interview/"+interviewId+"/begin"}>

       

         <Button>Start Interview<ArrowRight/></Button>

         </Link>



         <hr/>

         <div className="p-6 bg-gray-50 rounded-2xl">

         <h2 className="font-semibold text-2xl mt-2">Want to sent interview link to someone?</h2>

         <div className="flex w-full gap-5 max-w-xl ">

            <Input placeholder="Enter email address" className="w-full"/>

            <Button><Send/></Button>

         </div>

         </div>

       </div>

       </div>

    </div>

  )

}
export default page;