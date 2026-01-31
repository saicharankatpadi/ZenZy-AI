import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider, // Add this
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link'

const CourseChapters = ({ loading, courseDetail }) => {


  const EnableExercise = (
  chapterIndex,
  exerciseIndex,
  chapterExercisesLength )=> {
  const completed = courseDetail?.completedExcercises;

  // If nothing is completed, enable FIRST exercise ONLY
  if (!completed || completed.length === 0) {
    return chapterIndex === 0 && exerciseIndex === 0;
  }

  // last completed
  const last = completed[completed.length - 1];

  // Convert to global exercise number
  const currentExerciseNumber =
    chapterIndex * chapterExercisesLength + exerciseIndex + 1;

  const lastCompletedNumber =
    (last.chapterId - 1) * chapterExercisesLength + last.exerciseId;

  return currentExerciseNumber === lastCompletedNumber + 2;
};


const isExercisedCompleted = (chapterId,exerciseId)=>{
   const completeChapters = courseDetail?.completedExcercises

  const completedChapter =  completeChapters?.find(item=>(item.chapterId && chapterId ==chapterId && item.exerciseId == exerciseId))

   return completedChapter?true:false
}
  return (
    <TooltipProvider> {/* Wrap the content in TooltipProvider */}
      <div className="mt-5">
        {courseDetail?.chapters?.length == 0 ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-[250px] rounded-2xl" />
            <Skeleton className="w-full h-[250px] rounded-2xl" />
          </div>
        ) : (
          <div className="p-5 border-4 rounded-2xl">
            {courseDetail?.chapters?.map((chapter, index) => (
              /* Use a unique key for the chapter */
              <Accordion type="single" collapsible key={`chapter-${index}`}>
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="p-3 font-bold text-3xl hover:bg-zinc-800">
                    <div className="flex gap-10">
                      <h2 className="h-10 w-12 rounded-full flex items-center justify-center bg-zinc-800">
                        {index + 1}
                      </h2>
                      <h2>{chapter?.name}</h2>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-7 rounded-2xl bg-zinc-900">
                      {chapter?.exercises.map((exc, indexExc) => (
                        /* FIX: Changed key={index} to a unique composite key */
                        <div key={`exc-${index}-${indexExc}`} className="flex items-center mb-7 justify-between ">
                          <div className="flex items-center gap-10 font-bold">
                            <h2 className="text-3xl">
                              Exercise {index * (chapter?.exercises?.length || 0) + indexExc + 1}
                            </h2>
                            <h2 className="text-3xl">{exc?.name}</h2>
                          </div>

                          
                        {EnableExercise(index,indexExc,chapter?.exercises?.length) ? 
                         <Link href={"/courses/"+courseDetail?.courseId+"/"+exc?.slug} ><Button variant={'pixel'}>{exc?.xp}xp</Button></Link>
                         :  
                         isExercisedCompleted(chapter?.chapterId,indexExc+1)?
                                <Button variant={'pixel'} className="bg-green-600">Completed</Button>
                         
                         : <Tooltip>
                           
                           
                            {/* FIX: Typo 'asChid' to 'asChild' */}
                            <TooltipTrigger asChild>
                              <Button variant={"pixelDisabled"}>???</Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-lg">Please Enroll First</p>
                            </TooltipContent>
                          </Tooltip>}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

export default CourseChapters