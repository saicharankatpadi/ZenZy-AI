import { History } from 'lucide-react';
import { Video } from 'lucide-react';
import React from 'react'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from './ui/button';
import { ChevronDown, FileText, GraduationCap, LayoutDashboardIcon, PenBox, StarsIcon ,BotMessageSquare} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from 'next/image';
import { checkUser } from '@/lib/checkUser';

import {v4 as uuidv4} from "uuid"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
 } from "@/components/ui/navigation-menu"
const CoursesList = [
  {
    id: 1,
    name: "React Beginner",
    desc: "Learn the fundamentals of React, including components, props, state, and building your first UI.",
    bannerImage:
      'https://ik.imagekit.io/tubeguruji/Codebox/588a4195922117.6616b8b374ecc8.gif',
    level: "Beginner",
  },
  {
    id: 2,
    name: "HTML Beginner",
    desc: "Understand the basics of web structure using HTML tags, elements, and semantic layouts.",
    bannerImage:
      'https://ik.imagekit.io/tubeguruji/Codebox/original-ba977c3b8642765b4df9d15f90784d.gif?updatedAt=1763460224974',
    level: "Beginner",
  },
  {
    id: 3,
    name: "CSS Beginner",
    desc: "Master styling essentials like selectors, colors, layout, flexbox, and responsive design.",
    bannerImage:
      'https://ik.imagekit.io/tubeguruji/Codebox/fd4a0b8b151c4e4321b8576187d03c9.gif?updatedAt=1763460225765',
    level: "Beginner",
  },
  {
    id: 4,
    name: "Python Beginner",
    desc: "Start coding with Python by learning variables, conditions, loops, functions, and basic projects.",
    bannerImage:
      'https://ik.imagekit.io/tubeguruji/Codebox/tumblr_3ebfe054c877d03c507aa8c40149908b_515b1f92_1280.webp?updatedAt=1763460230994',
    level: "Beginner",
  },
];


const Header = async () => {
    await checkUser();
    
    const id = uuidv4()
     
  return (
    <header className="fixed top-0 w-full bg-background/80 border-b backdrop-blur-md z-50 supports-backdrop-filter:bg-background/60">
        <nav className="container mx-auto flex items-center justify-between px-4">
            <Link href="/">
              <Image src="/Zenzy.jpeg" alt="Sens AI Logo" width={150} height={50}
                className="object-contain py-1 h-12 w-auto"/>
              
            </Link>

            <NavigationMenu>
  <NavigationMenuList className="gap-6">
    <NavigationMenuItem>
      <NavigationMenuTrigger>Courses</NavigationMenuTrigger>
      <NavigationMenuContent>
          <ul className="grid md:grid-cols-2 gap-2 sm:w-[400px]
          md:w-[500px] lg:w-[600px]">
            {CoursesList.map((course,index)=>(
                <div key={index}className="p-2 hover:bg-accent rounded-xl cursor-pointer">
                  <h2 className="font-medium">
                  {course.name}
                  </h2>
                  <p className="text-s text-gray-500">{course.desc}</p>
                </div>
            ))}
            </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink>
          <Link href={"/projects"}>Projects</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
     
    <div className="flex items-center space-x-2 md:space-x-4">
        <SignedIn>
          <Link href="/hird">
            <Button variant="destructive" className="rounded-full">
              <PenBox size={20} className="mr-2" />
               Job Detector
            </Button>
          </Link>
            <Link href={"/dashboard"} >
              <Button className="outline">
                 <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                 <span className="hidden md:block">Industry Insights</span>
              </Button>
            </Link>
       
    
    <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button >
        <StarsIcon className="h-4 w-4" />
        <span className="hidden md:block">Growth Tools</span>
        <ChevronDown className=" h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
   
  
    <DropdownMenuItem>
        <Link href={"/resume"} className="flex items-center gap-2" >
          <FileText className=" h-4 w-4" />
          <span >Build Resume</span>
        </Link>
    </DropdownMenuItem>
    <DropdownMenuItem>
        <Link href={"/ai-cover-letter"} className="flex items-center gap-2" >
          <PenBox className=" h-4 w-4" />
          <span >Cover Letter</span>
        </Link>
    </DropdownMenuItem>
    <DropdownMenuItem>
        <Link href={"/interview"} className="flex items-center gap-2" >
          <GraduationCap className=" h-4 w-4" />
          <span >Interview Prep</span>
        </Link>
    </DropdownMenuItem>
     <DropdownMenuItem>
         <Link href={`/ai-tools/ai-chat/${id}`} className="flex items-center gap-2">
          <BotMessageSquare className="h-4 w-4" />
          <span >AI Q/A Chat</span>
        </Link>
    </DropdownMenuItem>
      <DropdownMenuItem>
        <Link href={"/ai-mock-interview"} className="flex items-center gap-2" >
          <Video className=" h-4 w-4" />
          <span >Mock Interview</span>
        </Link>
    </DropdownMenuItem><DropdownMenuItem>
        <Link href={"/video-progress"} className="flex items-center gap-2" >
          <History className=" h-4 w-4" />
          <span >History</span>
        </Link>
    </DropdownMenuItem>

  </DropdownMenuContent>
   </DropdownMenu>
    </SignedIn>

       <SignedOut>
              <SignInButton>
                 <Button className="outline">Sign In</Button>
              </SignInButton>
        </SignedOut>
            <SignedIn>
              <UserButton 
              appearance={{
                elements:{
                    avatarBox :"w-10 h-10",
                    UserButtonPopoverCard:"shadow-xl",
                    userPreviewMainIdentifier:"font-semibold",
                },
              }}
              afterSignOutUrl="/"/>
            </SignedIn>
   </div>
   </nav>
   

    </header>
  )
}

export default Header
