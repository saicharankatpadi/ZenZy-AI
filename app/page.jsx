"use client"
import HeroSection from "@/components/Hero";
import React from "react";
import {
  Card,  CardContent,

} from "@/components/ui/card"
import { features } from "@/data/features";
import { howItWorks } from "@/data/howItWorks";
import { testimonial } from "@/data/testimonial";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { aiToolsList } from "@/data/aiToolsList";
import { useRouter } from "next/navigation";


import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faqs } from "@/data/faqs";
import { ArrowRight} from "lucide-react";
import {v4 as uuidv4} from "uuid";
import { useState } from "react";
import RoadmapGeneratorDialog from "@/components/RoadmapGeneratorDialog";
import ResumeUploadDialog from "@/components/ResumeUploadDialog";
import CourseDialog from "@/components/CourseDialog";
export default function Home() {
  const id = uuidv4();
  const router = useRouter();
  const [openRoadmapDialog,setOpenRoadmapDialog] = useState(false)
   const [openResumeDialog,setOpenResumeDialog] = useState(false)
     const [openCourseDialog,setOpenCourseDialog] = useState(false);
   
     
     const onClickButton = (tool)=>{
      if(tool.path === "/ai-resume-analyzer"){
      setOpenResumeDialog(true);
      return;
     }
     if(tool.path === "/ai-roadmap-agent"){
      setOpenRoadmapDialog(true);
      return;
     }
     if(tool.path === "/code-sand-box"){
      router.push("/code-sand-box")
      return;
     }
     if(tool.path === "/join"){
        router.push("/join")
        return
     }
      if(tool.path === "/ai-course-generator"){
      setOpenCourseDialog((true))
      return;
     }
  }
 
  return (
    <>
   <div className="grid-background"></div>
   <HeroSection/>
   <section className="w-full py-12 md:py-24 lg:py-32 bg-ground">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
          Powerful Features for Your Carrer Growth
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature,index)=>{
            return (
  
               <Card key={index}
               className="border-2 hover:border-primary transition-colors duration-300">
                
                <CardContent className="pt-6 text-center flex flex-col items-center"> 
                  <div className="flex flex-col items-center justify-center ">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description} </p>
                  </CardContent>
                </Card>
 
            )    
          })}
      </div>
      </div>
   </section>
    <section className="w-full  md:py-24 lg:py-32 bg-ground">
      <div className="container mx-auto px-4 md:px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {aiToolsList.map((tool,index)=>{
            return (
               <div key={index}>

                <div className="p-3 border rounded-lg" >

                  <Image src={tool.icon} width={40} height={40} alt={tool.name}/>
                
                  <h3 className="font-bold text-xl mt-2">
                    {tool.name}
                  </h3>
                  
                  <p className="text-muted-foreground">{tool.description} </p>
                 
                  <Button className="w-full mt-3"
                    onClick={()=>onClickButton(tool)}
                  
                  >{tool.button}</Button>
                  <ResumeUploadDialog openResumeDialog={openResumeDialog}
                   setOpenResumeDialog={setOpenResumeDialog}/>
                  <RoadmapGeneratorDialog openDialog={openRoadmapDialog}
                    setOpenDialog={setOpenRoadmapDialog}/>
                  <CourseDialog openCourseDialog={openCourseDialog}
                  setOpenCourseDialog={setOpenCourseDialog}/>
                   </div>
                </div>
              
 
            )    
          })}
      </div>
      </div>
      </section>

   <section className="w-full py-12 md:py-24  bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

            <div className='flex flex-col items-center justify-center space-y-2'>
            <h3 className="text-4xl font-bold">100+</h3>
            <p className="text-muted-foreground text-center">Interview Questions</p>
           </div>
            <div className='flex flex-col items-center justify-center space-y-2'>
            <h3 className="text-4xl font-bold">95%</h3>
            <p className="text-muted-foreground text-center">Success Rate</p>
           </div>
            <div className='flex flex-col items-center justify-center space-y-2'>
            <h3 className="text-4xl font-bold">24/7</h3>
            <p className="text-muted-foreground text-center">AI Support</p>
           </div>
      </div>
      </div>
   </section>

     <section className="w-full py-12 md:py-24 lg:py-32 bg-ground">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4">
          How It Works
        </h2>
        <p className="text-muted-foreground"> Four simple steps to accelerate your carrer growth</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {howItWorks.map((item,index)=>{
            return (
               <div key={index}
               className="flex flex-col items-center text-center space-y-4">

                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">

                  {item.icon}
                  </div>
                  <h3 className="font-semibold text-xl">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.description} </p>
                </div>
              
 
            )    
          })}
      </div>
      </div>
   </section>
   
  

   <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
         Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4  gap-8 max-w-6xl mx-auto">
          {testimonial.map((testimonial,index)=>{
            return (
  
               <Card key={index}
               className="bg-background">
                
                <CardContent className="pt-6 "> 
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4 ">
                   
                     {/* Increased size to h-20 (80px) and added a subtle ring offset */}
      <div className="relative h-20 w-20 flex-shrink-0 rounded-full ring-4 ring-primary/10 ring-offset-2 overflow-hidden shadow-md">
        <Image
          fill
          src={testimonial.image} 
          alt={testimonial.author}
          className="object-cover transition-transform duration-300 hover:scale-110"
          sizes="80px"
        />
      </div>   
                     <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                     
                     </div>
                    </div>
                    <blockquote>
                      <p className="text-muted-foreground italic relative">
                        <span className="text-3xl text-primary absolute -top-4 -left-2">
                          &quot;
                        </span>
                        {testimonial.quote}
                        <span className="text-3xl text-primary absolute -bottom-4">
                          &quot;
                        </span>
                      </p>
                    </blockquote>
                  </div>
                  </CardContent>
                </Card>
 
            )    
          })}
      </div>
      </div>
   </section>

    <section className="w-full py-12 md:py-24 lg:py-32 bg-ground">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4">
       Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground">Find answers to common questions about platform</p>
        </div>
        <div className="max-w-6xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq,index)=>{
          return(
             <AccordionItem key={index} value={`item-${index}`}>
         <AccordionTrigger>{faq.question}</AccordionTrigger>
       <AccordionContent>
         {faq.answer}
         </AccordionContent>
         </AccordionItem>
          )
    })}

     
     </Accordion>
      </div>
      </div>
   </section>
  
      <section className="w-full">
        <div className="mx-auto py-24 gradient rounded-lg">
          <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl md:text-5xl">
              Ready to Accelerate Your Career?
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
              Join thousands of professionals who are advancing their careers
              with AI-powered guidance.
            </p>
            <Link href="/dashboard" passHref>
              <Button
                size="lg"
                variant="secondary"
                className="h-11 mt-5 animate-bounce"
              >
                Start Your Journey Today <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

   </>

  );
}

