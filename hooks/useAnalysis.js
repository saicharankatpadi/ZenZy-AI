import { useState, useEffect } from 'react';

export function useAnalysis(recordId) {
  const [status, setStatus] = useState("processing");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!recordId) return;

    let interval;
    let attempts = 0;
    const maxAttempts = 60; // 3 minutes (3s * 60)

    const checkStatus = async () => {
      try {
        attempts++;
        // Using the same endpoint as JobAnalyzer component
        const res = await fetch(`/api/job-analyze?id=${recordId}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const result = await res.json();

        setStatus(result.status);
        
        if (result.data) {
          setData(result.data);
        }

        if (result.status === "completed" || result.status === "error") {
          clearInterval(interval);
          if (result.status === "error") setError("Analysis failed");
        }

        // Stop after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setError("Timeout waiting for analysis");
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError("Failed to fetch analysis status");
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 3000); // Poll every 3s
    
    return () => clearInterval(interval);
  }, [recordId]);

  return { status, data, error };
}