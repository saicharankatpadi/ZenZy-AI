






import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { NextResponse } from 'next/server';

const PROMPT = "Generate detailed content for this chapter in JSON format. Schema: { content: string, quiz: Array } Context: ";

export async function POST(req) {
  try {
    const { courseJson, courseTitle, courseId } = await req.json();

    // 1. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Process Chapters
    const promises = courseJson?.chapters?.map(async (chapter) => {
      // AI Generation
      const promptText = PROMPT + JSON.stringify(chapter);
      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();
      
      // Clean JSON string
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const chapterContent = JSON.parse(cleanJson);

      // YouTube Lookup
      const youtubeData = await GetYoutubeVideo(chapter?.chapterName);

      return {
       
        youtubeVideo:youtubetubeData,
        courseData: chapterContent
      };
    });

    const CourseContent = await Promise.all(promises);


    // Save to DB using Prisma
const dbResp = await db.course.update({
  where: {
    cid: courseId, // Using 'cid' as your unique course identifier
  },
  data: {
    courseContent: CourseContent, // The array of generated chapters/videos
  },
});
    return NextResponse.json({
      
      courseName:courseTitle,
      CourseContent: CourseContent
    });

  } catch (error) {
    console.error("Content Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

const GetYoutubeVideo = async (topic) => {
  try {
    const params = {
      part: "snippet",
      q: topic,
      type: "video",
      maxResults: 1, // Fix: Should be maxResults, not maxResult
      key: process.env.YOUTUBE_API_KEY,
    };
    
    const resp = await axios.get(YOUTUBE_BASE_URL, { params });
    
    return resp.data.items.map(item => ({
      videoId: item.id?.videoId, // Fix: Corrected typo from videoPd
      title: item?.snippet?.title,
      thumbnail: item?.snippet?.thumbnails?.high?.url
    }));
  } catch (err) {
    console.error("YouTube API Error:", err);
    return [];
  }
};



