import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import React from 'react'
import { useState,useEffect } from 'react'

const CourseStatus = ({courseDetail}) => {

    const [counts, setCounts] = useState({
    totalExce: 0, 
    totalXp: 0
});


useEffect(()=>{
    courseDetail && GetCounts()
},[courseDetail])


    const  GetCounts = ()=>{
        let totalExcercises = 0;
        let totalXp =0
        courseDetail?.chapters?.forEach((chapter)=>{
           totalExcercises = totalExcercises + chapter?.exercise?.length
            chapter?.exercises?.forEach(exc =>{

             totalXp = totalXp+exc?.xp
            })
        })
        setCounts ({
            totalExce :totalExcercises,
            totalXp:totalXp
        })
    }


    const UpdateProgress =(currentValue,totalValue)=>{
        if(currentValue&&totalValue){
           const perc= (currentValue*100)/totalValue;
          return perc
        
        }
        return 0;
     

    }
  return (
    <div className="border-4 rounded-2xl w-full p-4">
        <h2 className="text-3xl ">
           course Progress
        </h2>
        <div className="flex items-center gap-5 mt-4">
            <Image src={"/book.png"} alt='book' width={50} height={50}/>
            <div classname="w-full">
                <h2 className="flex  justify-between text-2xl">Exercises<span className="text-gray-400">{courseDetail?.completedExercises?.length}/{counts?.totalExce}</span></h2>
                <Progress value={UpdateProgress(courseDetail?.completedExercises?.length,counts?.totalExce)} className="mt-2"/>
            </div>
        </div>
           <div className="flex items-center gap-5 mt-4">
            <Image src={"/star.png"} alt='book' width={50} height={50}/>
            <div classname="w-full">
                <h2 className="flex  justify-between text-2xl">
                    <span className="text-gray-400">1{courseDetail?.courseEnrolledInfo?.xpEarned}/{counts?.totalXp}</span></h2>
                <Progress value={UpdateProgress(courseDetail?.courseEnrolledInfo?.xpEarned??0,counts?.totalXp)} className="mt-2"/>
            </div>
        </div>
    </div>
  )
}

export default CourseStatus