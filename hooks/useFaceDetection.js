import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceDetection = (videoRef, isEnabled) => {
  const [expressions, setExpressions] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);

  // Load models once when enabled
  useEffect(() => {
    if (!isEnabled) return;

    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        
        // Load both required models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        console.log('Face-api models loaded successfully');
        setIsModelLoaded(true);
      } catch (err) {
        console.error('Error loading face-api models:', err);
        setError('Failed to load face detection models');
      }
    };

    loadModels();
  }, [isEnabled]);

  // Start detection when video is ready and models loaded
  useEffect(() => {
    if (!isEnabled || !isModelLoaded || !videoRef.current) return;

    const video = videoRef.current;
    
    // Wait for video to be playing and have dimensions
    const startDetection = () => {
      if (video.paused || video.ended || video.readyState < 2) {
        console.log('Video not ready yet, waiting...');
        return;
      }

      console.log('Starting face detection. Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      
      // Create canvas overlay if it doesn't exist
      if (!canvasRef.current && video.parentElement) {
        const canvas = faceapi.createCanvasFromMedia(video);
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvasRef.current = canvas;
        video.parentElement.appendChild(canvas);
      }

      // Detection loop
      intervalRef.current = setInterval(async () => {
        try {
          if (video.paused || video.ended) return;

          const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
            .withFaceExpressions();

          if (detection) {
            setExpressions(detection.expressions);
            
            // Calculate confidence based on expressions
            const { neutral, happy, surprised, sad, angry, fearful, disgusted } = detection.expressions;
            
            // Weight positive vs negative emotions
            const positive = (neutral * 0.3) + (happy * 0.6) + (surprised * 0.1);
            const negative = (sad * 0.3) + (angry * 0.25) + (fearful * 0.25) + (disgusted * 0.2);
            
            // Normalize to 0-100 range
            let score = ((positive - negative + 1) / 2) * 100;
            score = Math.min(100, Math.max(0, score));
            
            setConfidence(Math.round(score));

            // Draw detections on canvas (optional visualization)
            if (canvasRef.current) {
              const dims = faceapi.matchDimensions(canvasRef.current, video, true);
              faceapi.draw.drawDetections(canvasRef.current, faceapi.resizeResults(detection, dims));
            }
          } else {
            // No face detected
            setConfidence(0);
            setExpressions(null);
          }
        } catch (err) {
          console.error('Detection error:', err);
        }
      }, 500); // Check every 500ms for better performance
    };

    // If video is already playing, start immediately
    if (video.readyState >= 3) {
      startDetection();
    } else {
      // Wait for video to be ready
      video.addEventListener('loadeddata', startDetection);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
      video.removeEventListener('loadeddata', startDetection);
    };
  }, [isEnabled, isModelLoaded, videoRef]);

  return { expressions, confidence, isModelLoaded, error };
};