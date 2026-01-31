

"use client"

import React, { useState } from "react";
import {
  Search,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Cpu,
  Sparkles,
  Send,
} from "lucide-react";

export default function JobDetectorPage() {
  const [jobInput, setJobInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  /* ================= MOCK DATABASE ================= */

  const companies = {
    google: {
      company: {
        name: "Google",
        industry: "Internet & Artificial Intelligence",
        techStack: [
          "React",
          "Go",
          "Kubernetes",
          "TensorFlow",
          "BigQuery",
          "GCP",
        ],
        details:
          "Google builds AI-driven platforms and global search infrastructure.",
        highlights: [
          "Leader in AI research",
          "World-class engineering culture",
          "Strong open-source community",
          "High compensation packages",
        ],
      },

      hiring: {
        onCampus: "August - September",
        offCampus: "Quarterly Hiring",
      },

      // These are treated as resume skills (demo data)
      resume: {
        matches: ["React", "JavaScript", "GCP"],
      },
    },

    amazon: {
      company: {
        name: "Amazon",
        industry: "E-commerce & Cloud Computing",
        techStack: [
          "AWS",
          "Java",
          "React",
          "Docker",
          "Microservices",
          "Lambda",
        ],
        details:
          "Amazon focuses on cloud infrastructure and large-scale commerce.",
        highlights: [
          "Leader in cloud computing",
          "Strong DevOps culture",
          "Customer-first mindset",
          "Rapid career growth",
        ],
      },

      hiring: {
        onCampus: "July - October",
        offCampus: "Monthly Hiring",
      },

      resume: {
        matches: ["Java", "AWS", "React"],
      },
    },

    microsoft: {
      company: {
        name: "Microsoft",
        industry: "Software & Enterprise Cloud",
        techStack: [
          "Azure",
          "C#",
          ".NET",
          "React",
          "TypeScript",
          "Power BI",
        ],
        details:
          "Microsoft builds enterprise software and cloud platforms.",
        highlights: [
          "Strong work-life balance",
          "Enterprise projects",
          "Learning culture",
          "Global clients",
        ],
      },

      hiring: {
        onCampus: "September - November",
        offCampus: "Bi-Monthly Hiring",
      },

      resume: {
        matches: ["C#", ".NET", "TypeScript"],
      },
    },

    infosys: {
      company: {
        name: "Infosys",
        industry: "IT Consulting & Services",
        techStack: [
          "Java",
          "Spring",
          "Angular",
          "React",
          "Azure",
        ],
        details:
          "Infosys delivers enterprise IT and consulting services.",
        highlights: [
          "Global delivery model",
          "Strong training programs",
          "Enterprise clients",
          "Stable career path",
        ],
      },

      hiring: {
        onCampus: "Yearly",
        offCampus: "Frequent Drives",
      },

      resume: {
        matches: ["Java", "React"],
      },
    },
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobInput || !resumeFile) {
      setError("Please provide job info and resume.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    await new Promise((r) => setTimeout(r, 1500));

    const input = jobInput.toLowerCase();

    // Find company
    const key = Object.keys(companies).find((k) =>
      input.includes(k)
    );

    const selected = key
      ? companies[key]
      : companies["infosys"];

    const techStack = selected.company.techStack;

    const resumeSkills = selected.resume.matches.map((s) =>
      s.toLowerCase()
    );

    /* ================= MATCH + GAP LOGIC ================= */

    // Matches = skills present in tech stack
    const matches = techStack.filter((tech) =>
      resumeSkills.some((s) =>
        tech.toLowerCase().includes(s)
      )
    );

    // Gaps = remaining tech stack
    const gaps = techStack.filter(
      (tech) => !matches.includes(tech)
    );

    // Improvements based on gaps
    const improvements = gaps.map(
      (g) => `Improve your skills in ${g}`
    );

    /* ================= FINAL RESULT ================= */

    const result = {
      company: selected.company,
      hiring: selected.hiring,

      resume: {
        matches,
        gaps,
        improvements,
      },
    };

    setAnalysis(result);
    setIsAnalyzing(false);
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen mt-15 bg-slate-950 text-slate-200 p-6">

      <h1 className="text-5xl font-bold text-center mb-10 text-cyan-400">
        Job Detector AI
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
      >

        {/* Job Input */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">

          <label className="flex gap-2 mb-3 text-cyan-400 font-bold">
            <Search /> Job URL / Company
          </label>

          <input
            value={jobInput}
            onChange={(e) => setJobInput(e.target.value)}
            placeholder="Google / Amazon / Microsoft..."
            className="w-full p-3 rounded bg-slate-800 outline-none"
          />
        </div>

        {/* Resume Upload */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">

          <label className="flex gap-2 mb-3 text-indigo-400 font-bold">
            <Upload /> Resume Upload
          </label>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files[0])}
          />

          <p className="mt-2 text-sm text-slate-500">
            {resumeFile?.name}
          </p>
        </div>

        {/* Button */}
        <div className="md:col-span-2 text-center">
          <button
            disabled={isAnalyzing}
            className="px-8 py-3 bg-cyan-600 rounded font-bold hover:bg-cyan-700"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
            <Send className="inline ml-2" size={18} />
          </button>
        </div>

      </form>

      {analysis && (

        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-6xl mx-auto">

          {/* Company */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">

            <h2 className="text-2xl font-bold mb-2 flex gap-2">
              <Building2 /> {analysis.company.name}
            </h2>

            <p className="text-cyan-400 mb-4">
              {analysis.company.industry}
            </p>

            <h3 className="font-bold mb-2 flex gap-2">
              <Cpu /> Tech Stack
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {analysis.company.techStack.map((t) => (
                <span
                  key={t}
                  className="bg-slate-800 px-3 py-1 rounded text-sm"
                >
                  {t}
                </span>
              ))}
            </div>

            <p className="text-slate-400 mb-4">
              {analysis.company.details}
            </p>

            <h3 className="font-bold mb-2 flex gap-2">
              <Sparkles /> Highlights
            </h3>

            {analysis.company.highlights.map((h, i) => (
              <p key={i} className="text-sm text-slate-400">
                • {h}
              </p>
            ))}

          </div>

          {/* Resume */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">

            <h2 className="text-2xl font-bold mb-4">
              Resume Analysis
            </h2>

            <h3 className="font-bold text-green-400 flex gap-2 mb-2">
              <CheckCircle2 /> Matches
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {analysis.resume.matches.map((m) => (
                <span
                  key={m}
                  className="bg-green-900/40 px-3 py-1 rounded text-sm"
                >
                  {m}
                </span>
              ))}
            </div>

            <h3 className="font-bold text-red-400 flex gap-2 mb-2">
              <XCircle /> Gaps
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {analysis.resume.gaps.map((g) => (
                <span
                  key={g}
                  className="bg-red-900/40 px-3 py-1 rounded text-sm"
                >
                  {g}
                </span>
              ))}
            </div>

            <h3 className="font-bold text-indigo-400 mb-2">
              Improvements
            </h3>

            {analysis.resume.improvements.map((i, x) => (
              <p
                key={x}
                className="text-sm text-slate-400 flex gap-2"
              >
                <AlertCircle size={16} /> {i}
              </p>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}