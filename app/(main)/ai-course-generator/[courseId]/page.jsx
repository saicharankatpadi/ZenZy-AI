"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from "next/navigation"
import axios from "axios"
import CourseInfo from '../_components/CourseInfo'
import ChapterTopicList from '../_components/ChapterTopicList'

const CoursePage = () => {
  const { courseId } = useParams();
  
  console.log("1. Course ID from URL:", courseId); // Check if ID exists
  
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null); // Initialize as null instead of undefined

  useEffect(() => {
    if (courseId) {
      console.log("2. useEffect triggered with courseId:", courseId);
      GetCourseInfo();
    } else {
      console.log("2. ERROR: No courseId found in URL params");
    }
  }, [courseId]); // Add courseId as dependency

  const GetCourseInfo = async () => {
    try {
      setLoading(true);
      console.log("3. Fetching course with ID:", courseId);
      
      const result = await axios.get(`/api/courses?courseId=${courseId}`);
      
      console.log("4. Full API Response:", result);
      console.log("5. Response Data:", result.data);
      console.log("6. Does data exist?", result.data ? "YES" : "NO");
      console.log("7. Type of data:", typeof result.data);
      
      // Check if data is array or object
      if (Array.isArray(result.data)) {
        console.log("8. Data is ARRAY with length:", result.data.length);
        if (result.data.length > 0) {
          setCourse(result.data[0]);
          console.log("9. Set course to first item:", result.data[0]);
        } else {
          console.log("9. ERROR: Empty array returned");
          setCourse(null);
        }
      } else if (result.data && typeof result.data === 'object') {
        console.log("8. Data is OBJECT");
        if (result.data.error) {
          console.log("9. ERROR from API:", result.data.error);
        } else {
          setCourse(result.data);
          console.log("9. Set course to:", result.data);
        }
      } else {
        console.log("8. ERROR: Unexpected data type");
      }
      
    } catch (error) {
      console.error("API ERROR:", error.message);
      console.error("Error details:", error.response?.data); // See if API returned error
    } finally {
      setLoading(false);
      console.log("10. Loading finished");
    }
  }

  // Debug render
  console.log("RENDER - Loading:", loading);
  console.log("RENDER - Course state:", course);

  if (loading) {
    return <div className="p-10">Loading course data...</div>;
  }

  if (!course && !loading) {
    return <div className="p-10 text-red-500">No course data found. Check console for errors.</div>;
  }

  return (
    <div>
      <div className="bg-green-100 p-4 mb-4">
        <p>Data loaded successfully! Check console for logs.</p>
        <p>Course Name: {course?.name || "N/A"}</p>
      </div>
      
      <CourseInfo course={course} />
      <ChapterTopicList course={course} />
    </div>
  )
}

export default CoursePage;