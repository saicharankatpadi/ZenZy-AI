
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import axios from "axios";

const PROMPT = `Generate Learning Course depends on following details. Make sure to add Course Name, Description, Course Banner Image Prompt (Create a modern, flat-style 2D digital illustration representing user Topic. Include UI/UX elements such as mockup screens, text blocks, icons, buttons, and creative workspace tools. Add symbolic elements related to user Course, like sticky notes, design components, and visual aids. Use a vibrant color palette (blues, purples, oranges) with a clean, professional look. The illustration should feel creative, tech-savvy, and educational, ideal for visualizing concepts in user Course) for Course Banner in 3d format Chapter Name, Topic under each chapters, Duration for each chapters etc, in JSON format only

Schema:
{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "includeVideo": "boolean",
    "noOfChapters": "number",
    "bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": ["string"]
      }
    ]
  }
}

User Input:`;

export async function POST(req) {
  try {
    const { courseId, ...formData } = await req.json();

    // 1. Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // 2. Generate AI Content
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const resultAI = await model.generateContent(PROMPT + JSON.stringify(formData));
    const responseAI = await resultAI.response;
    
    let JSONResp;
    try {
      JSONResp = JSON.parse(responseAI.text());
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    console.log("AI Response:", JSONResp);

    // 3. Extract data safely
    const courseData = JSONResp.course || JSONResp;
    const ImagePrompt = courseData?.bannerImagePrompt || courseData?.bannerPrompt;

    if (!ImagePrompt) {
      console.warn("No banner prompt found in AI response");
    }

    // 4. Generate Image
    let bannerImageUrl = "";
    try {
      bannerImageUrl = await GenerateImage(ImagePrompt);
    } catch (imgError) {
      console.error("Image generation failed:", imgError);
      bannerImageUrl = "/default-course-banner.jpg"; // Fallback
    }

    // 5. Prepare data for database - MATCH YOUR SCHEMA EXACTLY
    const dataToSave = {
      cid: courseId,
      name: courseData?.name || formData?.name || "Untitled Course",
      description: courseData?.description || formData?.description || "",
      category: courseData?.category || formData?.category || "General",
      level: courseData?.level || formData?.level || "Beginner",
      includeVideo: courseData?.includeVideo || false,
      noOfChapters: courseData?.noOfChapters || courseData?.chapters?.length || 0,
      courseJson: JSONResp, // Store full JSON
      bannerImageUrl: bannerImageUrl,
      userEmail: userEmail,
      categoryId: formData?.category
    };

    console.log("Saving to DB:", dataToSave);

    // 6. Save to Database
    const savedCourse = await db.course.create({
      data: dataToSave,
    });

    console.log("Saved successfully:", savedCourse);

    return NextResponse.json({ 
      success: true,
      courseId: courseId, 
      dbId: savedCourse.id 
    });

  } catch (error) {
    console.error("Error in API route:", error);
    
    // Return detailed error for debugging
    return NextResponse.json({ 
      error: error.message,
      meta: error.meta,
      code: error.code 
    }, { status: 500 });
  }
}

const GenerateImage = async (imagePrompt) => {
  if (!imagePrompt) return "/default-banner.jpg";
  
  const BASE_URL = 'https://aigurulab.tech';
  try {
    const result = await axios.post(BASE_URL + '/api/generate-image', {
      width: 1024,
      height: 1024,
      input: imagePrompt,
      aspectRatio: "16:9"
    }, {
      headers: {
        'x-api-key': process.env.AIGURULAB_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    return result.data.image || "/default-banner.jpg";
  } catch (err) {
    console.error("Image Gen Error:", err.response?.data || err.message);
    return "/default-banner.jpg";
  }
};

