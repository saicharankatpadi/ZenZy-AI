"use client"
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import RoadmapCanvas from '../_components/RoadmapCanvas'
import RoadmapGeneratorDialog from '@/components/RoadmapGeneratorDialog'
import { Loader2 } from 'lucide-react'

const RoadMapGeneratorAgent = () => {
    // 1. Ensure this matches your folder name [roadmapid] exactly
    const { roadmapid } = useParams(); 
    
    const [openRoadmapDialog, setOpenRoadmapDialog] = useState(false)
    const [roadMapDetail, setRoadMapDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const pollingTimer = useRef(null);

    useEffect(() => {
        if (roadmapid) {
            startPolling();
        }
        return () => {
            if (pollingTimer.current) clearInterval(pollingTimer.current);
        };
    }, [roadmapid]);

    const startPolling = () => {
        setLoading(true);
        GetRoadmapDetails(); // Initial call
        
        // Poll every 3 seconds
        pollingTimer.current = setInterval(() => {
            GetRoadmapDetails();
        }, 3000);
    };

    const GetRoadmapDetails = async () => {
        try {
            const result = await axios.get(`/api/history?recordId=${roadmapid}`);
            
            // Log to check nesting: is it result.data.content or result.data.data.content?
            console.log("Zenzy Debug - API Response:", result.data);

            if (result.data) {
                // Handle different possible response shapes
                let data = result.data.content || result.data;

                // Handle stringified JSON from Prisma/Neon
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        console.error("JSON Parse Error:", e);
                    }
                }

                // Only stop loading if we have valid nodes/edges
                if (data && data.initialNodes && data.initialNodes.length > 0) {
                    console.log("Success! Valid Roadmap Found:", data);
                    setRoadMapDetail(data);
                    setLoading(false);
                    
                    if (pollingTimer.current) {
                        clearInterval(pollingTimer.current);
                        pollingTimer.current = null;
                    }
                }
            }
        } catch (error) {
            console.warn("Retrying... Roadmap not ready or DB connection busy.");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 p-5">
            {/* Sidebar Info */}
            <div className="border rounded-xl p-5 shadow-sm bg-white h-fit">
                {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-10">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <p className="text-sm text-gray-500 text-center animate-pulse">
                            Zenzy AI is generating your roadmap...
                        </p>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500">
                        <h2 className="font-bold text-2xl text-slate-800">
                            {roadMapDetail?.roadmapTitle || "New Roadmap"}
                        </h2>
                        <div className="mt-4 space-y-3">
                            <p className="text-slate-600 leading-relaxed">
                                <strong className="text-slate-900">Description:</strong>
                                <br />
                                {roadMapDetail?.description}
                            </p>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <h2 className="font-semibold text-blue-700">
                                    Duration: {roadMapDetail?.duration}
                                </h2>
                            </div>
                        </div>
                    </div>
                )}
                <Button 
                    onClick={() => setOpenRoadmapDialog(true)} 
                    className="mt-6 w-full shadow-md hover:shadow-lg transition-all"
                >
                    + Create Another Roadmap
                </Button>
            </div>

            {/* Main Canvas View */}
            <div className="md:col-span-2 w-full h-[80vh] border rounded-xl bg-slate-50 relative overflow-hidden shadow-inner">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
                         <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                         <p className="text-slate-400 font-medium">Visualizing Nodes...</p>
                    </div>
                ) : (
                    roadMapDetail && (
                        <RoadmapCanvas 
                            key={roadmapid} // Forces re-render when switching IDs
                            initialNodes={roadMapDetail.initialNodes} 
                            initialEdges={roadMapDetail.initialEdges || []} 
                        />
                    )
                )}
            </div>

            <RoadmapGeneratorDialog
                openDialog={openRoadmapDialog}
                setOpenDialog={() => setOpenRoadmapDialog(false)}
            />
        </div>
    )
}

export default RoadMapGeneratorAgent;