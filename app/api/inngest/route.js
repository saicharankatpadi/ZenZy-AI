import {serve} from "inngest/next"
import {inngest} from "@/lib/inngest/client"
import { AIRoadmapAgent, generateIndustryInsights } from "@/lib/inngest/functions"
import { AiCareerAgent} from "@/lib/inngest/functions"
import { AiResumeAgent } from "@/lib/inngest/functions"

import { analyzeGhostJob } from "@/lib/inngest/functions"
export const {GET,POST,PUT} = serve({
    client : inngest,
    functions:[
       generateIndustryInsights,
          AiCareerAgent,
          AIRoadmapAgent,
          AiResumeAgent,
       
          analyzeGhostJob
    ]
})