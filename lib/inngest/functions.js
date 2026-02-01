import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAgent, gemini } from "@inngest/agent-kit";
import ImageKit from "imagekit";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import axios from "axios"


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Run every Sunday at midnight
  async ({ event, step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          return await model.generateContent(p);
        },
        prompt
      );

      const text = res.response.candidates[0].content.parts[0].text || "";
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

      const insights = JSON.parse(cleanedText);

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  }
);
export const AiCareerChatAgent = createAgent({
  name:"AiCareerChatAgent",
  description:"An AI agent that provides career advice based on industry data.",
  system:`You are a helpful, professional AI Career Coach Agent. Your role is to guide users with questions related to careers, including job search advice, interview preparation, resume improvement, skill development, career transitions, and industry trends. Always respond with clarity, encouragement, and actionable advice tailored to the user's needs. If the user asks something unrelated to careers (e.g., topics like health, relationships, coding help, or general trivia), gently inform them that you are a career coach and suggest relevant career-focused questions instead.`,

  model:gemini({
    model:"gemini-2.5-flash",
    apiKey:process.env.GEMINI_API_KEY

  })
})
export const AiCareerAgent = inngest.createFunction(
  {id:"AiCareerAgent"},
  {event:"AiCareerAgent"},
  async({event,step})=>{
    const {userInput} = await event?.data;
    const result = await AiCareerChatAgent.run(userInput);
    return result;
  }
)
 
export const AiResumeAnalyzerAgent = createAgent({
  name:"AiResumeAnalyzerAgent",
  description:"",
  system:`You are an advanced AI Resume Analyzer Agent. Your task is to evaluate a candidate's resume and return a detailed analysis in the following structured JSON schema format. The schema must match the layout and structure of a visual UI that includes overall score, section scores, summary feedback, improvement tips, strengths, and weaknesses.

🚀 INPUT: I will provide a plain text resume. 🎯 GOAL: Output a JSON report as per the schema below. The report should reflect:

overall_score (0-100) overall_feedback (short message e.g., "Excellent!", "Needs improvement") summary_comment (1-2 sentence evaluation summary)

Section scores for: Contact info Experience Education Skills

Each section should include: score (as percentage) Optional comment about that section Tips for Improvement (3-5 tips) What's Good (1-3 strengths) Needs Improvement (1-3 weaknesses)

🧠 Output JSON Schema:

JSON

{
  "overall_score": 85,
  "overall_feedback": "Excellent!",
  "summary_comment": "Your resume is strong, but there are areas to refine.",
  "sections": {
    "contact_info": {
      "score": 95,
      "comment": "Perfectly structured and complete."
    },
    "experience": {
      "score": 88,
      "comment": "Strong bullet points and impact."
    },
    "education": {
      "score": 70,
      "comment": "Consider adding relevant coursework."
    },
    "skills": {
      "score": 60,
      "comment": "Expand on specific skill proficiencies."
    }
  },
  "tips_for_improvement": [
    "Add more numbers and metrics to your experience section to show impact.",
    "Integrate more industry-specific keywords relevant to your target roles.",
    "Start bullet points with strong action verbs to make your achievements stand out."
  ],
  "whats_good": [
    "Clean and professional formatting.",
    "Clear and concise contact information.",
    "Relevant work experience."
  ],
  "needs_improvement": [
    "Skills section lacks detail.",
    "Some experience bullet points could be stronger.",
    "Missing a professional summary/objective."
  ]
} `,
  model:gemini({
    model:"gemini-2.5-flash",
    apiKey:process.env.GEMINI_API_KEY
  })
})


var imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY ,
    urlEndpoint : process.env.IMAGEKIT_ENDPOINT_URL
});
export const AiResumeAgent = inngest.createFunction(
  { id: "AiResumeAgent", retries: 1 },
  { event: "AiResumeAgent" },
  async ({ event, step }) => {
    const { recordId, base64ResumeFile, pdfText, userEmail, aiAgentType } = event.data;

    // STEP 1: Fast ImageKit Upload + DB Record Creation
    const uploadFileUrl = await step.run("upload-to-imagekit", async () => {
      const imageKitFile = await imagekit.upload({
        file: base64ResumeFile,
        fileName: `${recordId}.pdf`,
        folder: "/resumes"
      });
      
      // Use your actual Prisma model name (likely 'history')
      // and match the column name 'recordId' from your DB
      await db.history.upsert({
        where: { recordId: recordId },
        update: { metaData: imageKitFile.url },
        create: {
          recordId: recordId,
          metaData: imageKitFile.url,
          aiAgentType,
          userEmail,
          content: {} // Initialize with empty object to avoid NOT NULL constraints
        }
      });
      return imageKitFile.url;
    });

    // STEP 2: AI Analysis (takes ~1.9m)
    const aiResponse = await step.run("ai-analysis", async () => {
      const report = await AiResumeAnalyzerAgent.run(pdfText);
      return typeof report === 'string' ? report : (report.output?.[0]?.content || report.output);
    });

    // STEP 3: Update DB with actual Score/Report
    await step.run("save-final-report", async () => {
      const cleanJson = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());
      
      return await db.history.update({
        where: { recordId: recordId },
        data: { content: cleanJson }
      });
    });

    return { success: true };
  }
);

export const AIRoadmapGeneratorAgent =  createAgent({
  name:"AIRoadmapGeneratorAgent",
  description:"Generate Details Tree Like Flow Roadmap",
  system:`Generate a React flow tree-structured learning roadmap for user input position/ skills the following format: vertical tree structure with meaningful x/y positions to form a flow • Structure should be similar to roadmap.sh layout • Steps should be ordered from fundamentals to advanced • Include branching for different specializations (if applicable) • Each node must have a title, short description, and learning resource link • Use unique IDs for all nodes and edges • make it more specious node position, • Response n JSON format { roadmapTitle:", description:<3-5 Lines>, duration:", initialNodes : [ { id: '1', type: 'turbo', position: { x: 0, y: 0 }, data: { title: 'Step Title', description: 'Short two-line explanation of what the step covers.', link: 'Helpful link for learning this step', }, }, ], initialEdges : [ { id: 'e1-2', source: '1', target: '2', }, ] }
 `,
  model:gemini({
    model:"gemini-2.5-flash",
    apiKey:process.env.GEMINI_API_KEY,
  })
})
export const AIRoadmapAgent = inngest.createFunction(
  {id:"AiRoadMapAgent"},
  {event:"AiRoadMapAgent"},
  async({event,step})=>{
    const{roadmapId,userInput,userEmail} = await event.data;
    const roadmapResult = await AIRoadmapGeneratorAgent.run("UserInput:"+userInput);
    const rawContent = roadmapResult.output[0].content;
     const rawContentJson = rawContent.replace('```json',"").replace("```","")
     const parseJson = JSON.parse(rawContentJson)
     
     // save to db
     const saveToDb = await step.run("saveToDb",async()=>{
      const result = await db.historyTable.create({
        data:{ recordId : roadmapId,
        content:parseJson,
        aiAgentType:"/ai-roadmap-agent",
        userEmail:userEmail,
        metaData:userInput,
        }
      })
      console.log(result);
     return parseJson;
     });
  
  }
)






export const analyzeGhostJob = inngest.createFunction(
  { id: "analyze-ghost-job", retries: 2 },
  { event: "job.analyze" },
  async ({ event, step }) => {
    const { analysisId, jobUrl, jobText, userId, userSkills } = event.data;

    // STEP 1: Scrape Job Posting (LinkedIn/Indeed)
    const jobData = await step.run("scrape-job-data", async () => {
      if (!jobUrl) {
        return { 
          description: jobText, 
          title: "Manual Entry", 
          company: "Unknown",
          postedDate: "Unknown",
          location: "",
          salary: "",
          companyDomain: ""
        };
      }

      const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });

      try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1080, height: 1024 });
        
        await page.goto(jobUrl, { waitUntil: "networkidle2", timeout: 30000 });
        
        let data = {
          title: "",
          company: "",
          description: "",
          location: "",
          postedDate: "",
          salary: "",
          companyDomain: ""
        };

        // LinkedIn Selector Logic
        if (jobUrl.includes("linkedin.com")) {
          data = await page.evaluate(() => {
            const title = document.querySelector("h1.top-card-layout__title")?.innerText || 
                         document.querySelector("h1")?.innerText || "";
            const company = document.querySelector("a[href*='/company/']")?.innerText || 
                           document.querySelector(".topcard__org-name-link")?.innerText || "";
            const desc = document.querySelector(".description__text")?.innerText || 
                        document.querySelector(".show-more-less-html__markup")?.innerText || "";
            const location = document.querySelector(".topcard__flavor--bullet")?.innerText || "";
            const posted = document.querySelector(".posted-time-ago__text")?.innerText || "Unknown";
            const salary = document.querySelector(".salary")?.innerText || "";
            
            return { title, company, description: desc, location, postedDate: posted, salary };
          });
        }
        
        // Indeed Selector Logic
        else if (jobUrl.includes("indeed.com")) {
          data = await page.evaluate(() => {
            const title = document.querySelector("h1")?.innerText || "";
            const company = document.querySelector("[data-testid='company-name']")?.innerText || "";
            const desc = document.querySelector("#jobDescriptionText")?.innerText || "";
            const location = document.querySelector("[data-testid='job-location']")?.innerText || "";
            return { title, company, description: desc, location, postedDate: "Unknown", salary: "" };
          });
        }

        // Clean company name to guess domain for Clearbit
        const clean = data.company.toLowerCase().replace(/[^a-z0-9]/g, "");
        data.companyDomain = clean ? `${clean}.com` : "";
        
        return data;
      } finally {
        await browser.close();
      }
    });

    // STEP 2: Enrich Company Data (Clearbit via HubSpot + NewsAPI + GitHub)
    const companyData = await step.run("enrich-company-intel", async () => {
      const domain = jobData.companyDomain;
      const companyName = jobData.company;
      
      const results = {
        size: "Unknown",
        industry: "Unknown",
        funding: "Unknown",
        founded: "",
        logo: "",
        linkedin: "",
        recentNews: [],
        financialHealth: {},
        githubData: null
      };

      // 2A: Clearbit Enrichment via HubSpot token
      try {
        const res = await fetch(`https://company.clearbit.com/v2/companies/find?domain=${domain}`, {
          headers: { 
            'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          results.size = data.metrics?.employeesRange || "Unknown";
          results.industry = data.category?.industry || "Unknown";
          results.founded = data.foundedYear || "";
          results.logo = data.logo || "";
          results.linkedin = data.linkedin?.handle ? `https://linkedin.com${data.linkedin.handle}` : "";
          results.financialHealth = {
            revenueEstimate: data.metrics?.estimatedAnnualRevenue,
            alexaRank: data.metrics?.alexaGlobalRank
          };
        }
      } catch (e) {
        console.error("Enrichment error:", e.message);
      }

      // 2B: GitHub API Check (Uses User-Agent as required by GitHub)
      try {
        const res = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(companyName)}+type:org`, {
            headers: { 'User-Agent': 'GhostJobAnalyzer-App' }
        });
        const data = await res.json();
        
        if (data.items && data.items.length > 0) {
          const org = data.items[0];
          const reposRes = await fetch(org.repos_url, {
             headers: { 'User-Agent': 'GhostJobAnalyzer-App' }
          });
          const repos = await reposRes.json();
          
          results.githubData = {
            isTechCompany: true,
            publicRepos: Array.isArray(repos) ? repos.length : 0,
            techStack: Array.isArray(repos) ? [...new Set(repos.map(r => r.language).filter(Boolean))] : []
          };
          if (results.industry === "Unknown") results.industry = "Technology";
        }
      } catch (e) {
        results.githubData = { isTechCompany: false };
      }

      // 2C: News Sentiment Check
      try {
        const res = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(companyName)}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${process.env.NEWSAPI_KEY}`
        );
        
        if (res.ok) {
          const news = await res.json();
          results.recentNews = news.articles.map(a => ({
            title: a.title,
            date: a.publishedAt,
            url: a.url,
            source: a.source.name,
            sentiment: analyzeSentiment(a.title)
          }));
        }
      } catch (e) {
        console.error("NewsAPI error:", e.message);
      }

      return results;
    });

    // STEP 3: Ghost Job Detection Logic
    const ghostAnalysis = await step.run("detect-ghost-patterns", async () => {
      const redFlags = [];
      let score = 0;

      // Rule: Stale posting
      if (jobData.postedDate) {
        const daysMatch = jobData.postedDate.match(/(\d+)/);
        const days = daysMatch ? parseInt(daysMatch[1]) : 0;
        if (days > 30 || jobData.postedDate.includes("month")) {
          score += 25;
          redFlags.push({
            type: "STALE_POSTING",
            severity: "high",
            description: `Job has been open for ${jobData.postedDate}.`
          });
        }
      }

      // Rule: Low effort description
      if (!jobData.description || jobData.description.length < 400) {
        score += 20;
        redFlags.push({
          type: "VAGUE_DESCRIPTION",
          severity: "high",
          description: "Very short job description; often indicates resume harvesting."
        });
      }

      // Rule: Negative news/layoffs
      const negativeNews = companyData.recentNews?.filter(n => n.sentiment === "negative");
      if (negativeNews?.length > 0) {
        score += 25;
        redFlags.push({
          type: "INSTABILITY",
          severity: "high",
          description: `Recent negative news: ${negativeNews[0].title}`
        });
      }

      let riskLevel = "LOW";
      if (score >= 60) riskLevel = "GHOST";
      else if (score >= 35) riskLevel = "MEDIUM";

      return { score, redFlags, riskLevel };
    });

    // STEP 4: AI Analysis (Gemini)
    const aiAnalysis = await step.run("ai-eligibility-check", async () => {
      const prompt = `
        Analyze this job for a candidate with skills: ${userSkills?.join(", ") || "software development"}.
        JOB: ${jobData.title} at ${jobData.company}
        DESCRIPTION: ${jobData.description?.substring(0, 2000)}
        Return JSON ONLY:
        {
          "eligibilityScore": 0-100,
          "missingSkills": [],
          "matchingSkills": [],
          "pros": [],
          "cons": [],
          "recommendation": "apply|skip"
        }
      `;

      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await res.json();
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json|```/g, "").trim();
        return JSON.parse(text);
      } catch (e) {
        console.error("Gemini API error:", e.message);
        return { eligibilityScore: 0, missingSkills: [], matchingSkills: [], pros: ["AI Error"], cons: [], recommendation: "skip" };
      }
    });

    // STEP 5: Final Database Save
    await step.run("save-to-db", async () => {
      return await db.jobAnalysis.update({
        where: { id: analysisId },
        data: {
          // Job Data
          jobTitle: jobData.title,
          companyName: jobData.company,
          jobDescription: jobData.description,
          location: jobData.location,
          salary: jobData.salary,
          
          // Ghost Analysis
          ghostJobScore: ghostAnalysis.score,
          riskLevel: ghostAnalysis.riskLevel,
          redFlags: ghostAnalysis.redFlags,
          
          // AI Analysis
          userMatchScore: aiAnalysis.eligibilityScore,
          missingSkills: aiAnalysis.missingSkills || [],
          matchingSkills: aiAnalysis.matchingSkills || [],
          pros: aiAnalysis.pros || [],
          cons: aiAnalysis.cons || [],
          recommendation: aiAnalysis.recommendation,
          
          // Company Intel
          companyLogo: companyData.logo,
          companySize: companyData.size,
          companyIndustry: companyData.industry,
          companyFounded: companyData.founded,
          recentNews: companyData.recentNews,
          githubData: companyData.githubData,
          financialHealth: companyData.financialHealth,
          
          status: "completed"
        }
      });
    });

    return { success: true, riskLevel: ghostAnalysis.riskLevel };
  }
);

// Helper function
function analyzeSentiment(text) {
  const negative = ["layoff", "cut", "loss", "bankrupt", "lawsuit", "downsize", "firing", "closure", "shutdown"];
  const lower = text.toLowerCase();
  return negative.some(word => lower.includes(word)) ? "negative" : "neutral"; 
}