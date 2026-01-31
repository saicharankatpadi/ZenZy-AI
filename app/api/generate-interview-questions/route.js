import ImageKit from "imagekit";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL
});

// Helper function to safely parse JSON from Gemini
function safeJSONParse(text) {
    try {
        // Remove markdown code blocks
        let cleaned = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/^`+|`+$/g, '')
            .trim();
        
        // Find JSON array in text ( Gemini sometimes adds extra text)
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            cleaned = jsonMatch[0];
        }
        
        const parsed = JSON.parse(cleaned);
        
        // Validate it's an array of objects with question/answer
        if (!Array.isArray(parsed)) {
            throw new Error('Response is not an array');
        }
        
        return parsed.map((item, index) => ({
            question: item.question || `Question ${index + 1}`,
            answer: item.answer || "No answer provided"
        }));
        
    } catch (error) {
        console.error("JSON Parse Error:", error);
        console.log("Raw text that failed:", text.substring(0, 500));
        return null;
    }
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const jobTitle = formData.get("jobTitle");
        const jobDescription = formData.get("jobDescription");

        let resumeUrl = null;
        let pdfBuffer = null;

        // Mode 1: Resume Upload
        if (file) {
            const bytes = await file.arrayBuffer();
            pdfBuffer = Buffer.from(bytes);

            const uploadResponse = await imagekit.upload({
                file: pdfBuffer,
                fileName: `upload-${Date.now()}.pdf`,
                isPrivateFile: false,
                useUniqueFileName: true
            });
            
            resumeUrl = uploadResponse?.url;

            const prompt = `Act as a technical interviewer. Analyze this resume and generate exactly 5 technical interview questions based on the candidate's experience.

CRITICAL: Return ONLY a valid JSON array in this exact format:
[{"question": "What is...", "answer": "It is..."}, {"question": "How do you...", "answer": "You can..."}]

Rules:
- Return ONLY the JSON array, no other text
- No markdown formatting (no \`\`\`)
- Valid JSON syntax with double quotes
- Exactly 5 questions`;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: pdfBuffer.toString("base64")
                    }
                }
            ]);

            const rawText = await result.response.text();
            console.log("Raw Gemini Response:", rawText.substring(0, 1000));
            
            let questions = safeJSONParse(rawText);
            
            // Fallback if parsing fails
            if (!questions) {
                console.log("Using fallback questions");
                questions = generateFallbackQuestions(jobTitle, jobDescription);
            }

            return NextResponse.json({
                questions: questions,
                resumeUrl: resumeUrl
            });
        } 
        
        // Mode 2: Job Description Only
        else if (jobTitle || jobDescription) {
            const prompt = `Generate exactly 5 technical interview questions for this position:

Job Title: ${jobTitle || "Not specified"}
Job Description: ${jobDescription || "Not specified"}

CRITICAL: Return ONLY a valid JSON array in this exact format:
[{"question": "What is...", "answer": "It is..."}, {"question": "How do you...", "answer": "You can..."}]

Rules:
- Return ONLY the JSON array, no other text
- No markdown formatting (no \`\`\`)
- Valid JSON syntax with double quotes
- Exactly 5 questions`;

            const result = await model.generateContent(prompt);
            const rawText = await result.response.text();
            console.log("Raw Gemini Response:", rawText.substring(0, 1000));
            
            let questions = safeJSONParse(rawText);
            
            // Fallback if parsing fails
            if (!questions) {
                questions = generateFallbackQuestions(jobTitle, jobDescription);
            }

            return NextResponse.json({
                questions: questions,
                resumeUrl: null
            });
        } 
        
        else {
            return NextResponse.json(
                { error: "Please provide either a resume or job details" }, 
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Workflow Error:", error.message);
        return NextResponse.json(
            { error: error.message, detail: "AI processing failed" }, 
            { status: 500 }
        );
    }
}

// Fallback questions if AI fails
function generateFallbackQuestions(jobTitle, jobDescription) {
    const role = jobTitle || "this position";
    return [
        {
            question: `What motivated you to apply for the ${role} position?`,
            answer: "A good answer shows genuine interest in the role and company alignment."
        },
        {
            question: "Describe a challenging project you worked on and how you overcame obstacles.",
            answer: "Look for problem-solving skills, resilience, and technical approach."
        },
        {
            question: `What technologies are you most comfortable with for ${role}?`,
            answer: "Should demonstrate relevant technical skills mentioned in job description."
        },
        {
            question: "How do you stay updated with the latest industry trends and technologies?",
            answer: "Shows commitment to continuous learning and professional development."
        },
        {
            question: "Where do you see yourself in 3-5 years?",
            answer: "Should show ambition while remaining realistic and aligned with career growth."
        }
    ];
}