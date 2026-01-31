"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import {
  MessageSquare,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  Loader2,
} from "lucide-react";
import { speak } from "@/lib/voice";
import { createFeedback } from "@/lib/actions/general.action";

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params?.interviewId;

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const isProcessingAnswer = useRef(false);
  const currentIndexRef = useRef(0);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interviewData, setInterviewData] = useState(null);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (!interviewId) return;
    loadInterview();
    return () => stopListening();
  }, [interviewId]);

  const loadInterview = async () => {
    try {
      const res = await fetch(`/api/interview/${interviewId}`);
      const data = await res.json();

      if (data.status === "completed") {
        // ⬇️⬇️ CHANGED: Redirect to mock feedback page ⬇️⬇️
        router.push(`/mock/${interviewId}/feedback`);
        return;
      }

      setInterviewData(data);
      setQuestions(data.questions || []);

      const startIndex = data.currentIndex || 0;
      setCurrentIndex(startIndex);
      currentIndexRef.current = startIndex;

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load interview:", error);
      setIsLoading(false);
    }
  };

  const toggleCamera = async () => {
    if (!cameraEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraEnabled(true);
      } catch (err) {
        alert("Camera access denied");
      }
    } else {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraEnabled(false);
    }
  };

  const setupSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + " " + finalTranscript);
        clearTimeout(window.silenceTimer);
        window.silenceTimer = setTimeout(() => {
          if (finalTranscript.trim().length > 5) {
            handleAnswerSubmit(finalTranscript);
          }
        }, 1500);
      }
    };

    recognitionRef.current = recognition;
  };

  const askCurrentQuestion = async (indexToAsk) => {
    if (indexToAsk >= questions.length) {
      await handleInterviewComplete();
      return;
    }

    const question = questions[indexToAsk];
    if (!question?.questionText) return;

    setIsSpeaking(true);
    setTranscript("");

    setConversation((prev) => [
      ...prev,
      {
        role: "interviewer",
        content: question.questionText,
      },
    ]);

    const audioUrl = await speak(question.questionText);

    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      await audioRef.current.play();
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        startListening();
      };
    } else {
      const duration = question.questionText.length * 80;
      setTimeout(() => {
        setIsSpeaking(false);
        startListening();
      }, duration);
    }
  };

  const startListening = () => {
    setupSpeechRecognition();
    setTimeout(() => {
      try {
        recognitionRef.current?.start();
        setMicEnabled(true);
      } catch (error) {
        console.log("Already listening");
      }
    }, 50);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setMicEnabled(false);
    clearTimeout(window.silenceTimer);
  };

  const handleAnswerSubmit = async (finalText) => {
    if (isProcessingAnswer.current) return;
    isProcessingAnswer.current = true;

    stopListening();

    const answerText = transcript.trim() || finalText;
    if (!answerText) {
      isProcessingAnswer.current = false;
      return;
    }

    const actualCurrentIndex = currentIndexRef.current;
    const currentQuestion = questions[actualCurrentIndex];
    if (!currentQuestion) {
      isProcessingAnswer.current = false;
      return;
    }

    setConversation((prev) => [
      ...prev,
      { role: "user", content: answerText },
    ]);
    setTranscript("");

    try {
      await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          questionId: currentQuestion.id,
          answerText,
        }),
      });

      const nextIndex = actualCurrentIndex + 1;
      setCurrentIndex(nextIndex);
      currentIndexRef.current = nextIndex;

      if (nextIndex < questions.length) {
        setTimeout(() => {
          askCurrentQuestion(nextIndex);
          isProcessingAnswer.current = false;
        }, 500);
      } else {
        setIsCompleted(true);
        isProcessingAnswer.current = false;
        await handleInterviewComplete();
      }
    } catch (error) {
      console.error("Save failed:", error);
      isProcessingAnswer.current = false;
    }
  };

  const handleInterviewComplete = async () => {
    setGeneratingFeedback(true);
    try {
      const transcript = conversation.map((msg) => ({
        role: msg.role === "interviewer" ? "Interviewer" : "Candidate",
        content: msg.content,
      }));

      await createFeedback({ interviewId, transcript });
      
      // ⬇️⬇️ CHANGED: Redirect to mock feedback page ⬇️⬇️
      router.push(`/mock/${interviewId}/feedback`);
      
    } catch (error) {
      console.error("Error generating feedback:", error);
      setGeneratingFeedback(false);
    }
  };

  const startInterview = async () => {
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setIsStarted(true);

    await fetch(`/api/interview/${interviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "active",
        currentIndex: 0,
      }),
    });

    setTimeout(() => askCurrentQuestion(0), 100);
  };

  if (!interviewId) return null;

  if (generatingFeedback) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">
          Generating AI Feedback...
        </h2>
        <p className="text-gray-600">Analyzing your interview responses</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 mt-10 mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          AI Interview Session{" "}
          {interviewData?.jobTitle && `- ${interviewData.jobTitle}`}
        </h2>
        <UserButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Transcript Panel */}
        <div className="lg:col-span-1 h-[65vh] relative flex flex-col order-2 lg:order-1">
          <div className="flex-1 bg-white/30 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-gray-600" />
                <h3 className="font-semibold text-gray-700">Transcript</h3>
              </div>
              {isListening && (
                <span className="text-red-500 text-xs font-bold animate-pulse">
                  Recording
                </span>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {conversation.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl text-sm ${
                    msg.role === "interviewer"
                      ? "bg-blue-100 border-blue-200 self-start"
                      : "bg-green-100 border-green-200 self-end"
                  } border shadow-sm max-w-[90%]`}
                >
                  <div className="text-xs font-bold mb-1 text-gray-500">
                    {msg.role === "interviewer" ? "Interviewer" : "You"}
                  </div>
                  {msg.content}
                </motion.div>
              ))}

              {isListening && transcript && (
                <div className="p-4 rounded-2xl bg-gray-100 self-end text-sm text-gray-600 italic">
                  {transcript}...
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={toggleCamera}
                >
                  {cameraEnabled ? (
                    <VideoOff size={16} className="mr-2" />
                  ) : (
                    <Video size={16} className="mr-2" />
                  )}
                  {cameraEnabled ? "Hide Cam" : "Show Cam"}
                </Button>
                <Button
                  variant={micEnabled ? "destructive" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={micEnabled ? stopListening : startListening}
                  disabled={isSpeaking || !isStarted || isCompleted}
                >
                  {micEnabled ? (
                    <MicOff size={16} className="mr-2" />
                  ) : (
                    <Mic size={16} className="mr-2" />
                  )}
                  {micEnabled ? "Stop" : "Speak"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video/AI Panel */}
        <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
          <div className="h-[65vh] bg-slate-900 border border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <div className="w-full h-full flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                {!cameraEnabled ? (
                  <motion.div
                    key="ai-avatar"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div
                      className={`relative z-10 ${
                        isSpeaking ? "animate-bounce" : ""
                      }`}
                    >
                      <Image
                        src="/interviewer.jpeg"
                        alt="AI Interviewer"
                        width={200}
                        height={200}
                        className="rounded-full border-4 border-white/20 shadow-2xl"
                      />
                    </div>
                    <div className="text-center mt-8">
                      <h3 className="text-white font-semibold text-lg">
                        AI Interviewer
                      </h3>
                      <p className="text-white/50 text-sm mt-1">
                        {isSpeaking
                          ? "Speaking..."
                          : isListening
                          ? "Listening..."
                          : isCompleted
                          ? "Completed"
                          : "Ready"}
                      </p>
                      {isStarted && !isCompleted && (
                        <p className="text-green-400 text-xs mt-2">
                          Question {currentIndex + 1} of {questions.length}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="user-camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full relative"
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              onClick={() => setCameraEnabled(!cameraEnabled)}
              className="absolute bottom-6 right-6 w-32 h-24 bg-white/10 backdrop-blur-2xl border border-white/30 rounded-2xl cursor-pointer shadow-2xl flex flex-col items-center justify-center group"
            >
              <div className="scale-75 mt-2">
                {cameraEnabled ? (
                  <Image
                    src="/interviewer.jpeg"
                    width={45}
                    height={45}
                    className="rounded-full"
                    alt="ai"
                  />
                ) : (
                  <Camera className="w-10 h-10 text-white/70" />
                )}
              </div>
              <p className="text-[9px] font-bold text-white/50 mt-2 uppercase">
                {cameraEnabled ? "Show AI" : "Show Camera"}
              </p>
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-4">
            {!isStarted && !isCompleted && (
              <Button
                onClick={startInterview}
                disabled={isLoading || questions.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg"
              >
                {isLoading ? "Loading..." : "Start Interview"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}