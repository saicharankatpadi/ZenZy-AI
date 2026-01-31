"use client"

import {useParams} from "next/navigation"
import CourseDetailBanner from "./_components/CourseDetailBanner";
import axios from "axios"
import { useEffect,useState } from "react";
import CourseChapters from "./_components/CourseChapters";
import CourseStatus from "./_components/CourseStatus";
import CommunityHelpSection from "./_components/CommunityHelpSection";

const CourseDetail = ()=>{
    const {courseId} = useParams();
    const [courseDetail,setCourseDetail] = useState([])
    const[loading,setLoading] = useState(false)
      useEffect(()=>{
         courseId &&  GetCourseDetail()
    },[courseId])
    const GetCourseDetail = async() =>{
        setLoading(true);
        const result = await axios.get("/api/list?courseid="+courseId);
        console.log(result.data);
        setCourseDetail(result?.data)
        setLoading(false)
    }

    return(
        <div>

        <CourseDetailBanner loading={loading} 
        courseDetail={courseDetail} refreshData={()=>GetCourseDetail()}/>

        <div className="grid grid-cols-3 md:px-24 lg:px-36 gap-7">
            <div className="col-span-2" >
                <CourseChapters loading={loading}
        courseDetail={courseDetail}/>
            </div>
            <div>
                <CourseStatus courseDetail={courseDetail}/>
                <CommunityHelpSection/>
            </div>
        </div>
        </div>
    )
}

export default CourseDetail