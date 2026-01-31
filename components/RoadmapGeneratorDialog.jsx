"use client"
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader, Loader2Icon, SparkleIcon } from 'lucide-react'
import { v4 } from 'uuid'
import axios from 'axios'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const RoadmapGeneratorDialog = ({openDialog,setOpenDialog}) => {
   const [userInput,setUserInput]  = useState(); 
    const router = useRouter();
   const [loading,setLoading] = useState(false);
   const GenerateRoadmap = async ()=>{
    const roadmapId = v4();
    setLoading(true);
    try{
 const result = await axios.post("/api/ai-roadmap-agent",{
    roadmapId:roadmapId,
    userInput:userInput
 })
 console.log(result.data)
 router.push("/ai-roadmap-agent/"+roadmapId)
  setLoading(false);
    }catch(e){
      setLoading(false);
      console.log(e);
    }
  }
  return ( 
     <Dialog open={openDialog} onOpenChange={setOpenDialog}>

  <DialogContent>
    <DialogHeader>
      <DialogTitle>Enter Position/Skills to Generate Roadmap </DialogTitle>
      <DialogDescription asChild>
        <div className="mt-2">
            <Input placeholder="e.g Full Stack Developer"
              onChange={(e)=>setUserInput(e?.target.value)}         
            />
        </div>
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
        <Button variant={"outline"}>Cancel</Button>
           <Button onClick={GenerateRoadmap} disabled={loading || !userInput }>
            {loading?<Loader2Icon className="animate-spin"/>:<SparkleIcon/>}Generate</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  )
}

export default RoadmapGeneratorDialog