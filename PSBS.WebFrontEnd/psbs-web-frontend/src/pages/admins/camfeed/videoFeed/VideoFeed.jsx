import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import axios from 'axios';
import { postData } from '../../../../Utilities/ApiFunctions';
import {
  Modal,
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  CircularProgress,
  LinearProgress
} from "@mui/material";
import { Close, Videocam, Error } from "@mui/icons-material";

const CameraModal = ({ cameraId, onClose, open = true }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const retryTimeoutRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    
    const startStream = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setLoadingProgress(0);
        
        // Start the stream
        const res = await postData(`api/stream/start/${cameraId}`);
        if(res.flag){
          const streamUrl = `${res.data}?_=${new Date().getTime()}`;
          // Function to attempt loading the stream
          const loadStream = async (retryCount = 0, maxRetries = 30) => {  // Increased to 30 retries
            if (retryCount > maxRetries) {
              setError("Failed to load stream after multiple attempts. The stream may be unavailable.");
              setIsLoading(false);
              return;
            }
            
            // Update loading progress
            setLoadingProgress(Math.floor((retryCount / maxRetries) * 100));
            
            try {
              // Test if the stream file exists
              const testResponse = await fetch(streamUrl, { method: 'HEAD' });
              
              if (testResponse.ok) {
                // Stream file exists, load it
                if (Hls.isSupported() && videoRef.current) {
                  if (hlsRef.current) {
                    hlsRef.current.destroy();
                  }
                  
                  const hls = new Hls({
                    liveSyncDurationCount: 2,
                    enableWorker: true,
                    lowLatencyMode: true,
                  });
                  
                  hls.loadSource(streamUrl);
                  hls.attachMedia(videoRef.current);
                  
                  hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    // Set source — but don't play yet
                    setIsLoading(false);
                  
                    const video = videoRef.current;
                  
                    const tryPlay = async () => {
                      try {
                        await video.play();
                      } catch (err) {
                        console.warn("Autoplay prevented or interrupted:", err);
                      }
                    };
                  
                    // Wait until it's safe to play
                    const onCanPlay = () => {
                      tryPlay();
                      video.removeEventListener("canplay", onCanPlay);
                    };
                  
                    video.addEventListener("canplay", onCanPlay);
                  });
                  
                  
                  hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error("HLS.js error", data);
                    if (data.fatal) {
                      setError("Stream error occurred. The stream may be temporarily unavailable.");
                      // Don't auto-close, just show the error
                    }
                  });
                  
                  hlsRef.current = hls;
                } else if (videoRef.current) {
                  // Fallback for Safari
                  videoRef.current.src = streamUrl;
                  await videoRef.current.play();
                  setIsLoading(false);
                }
              } else {
                // Stream file doesn't exist yet, retry after delay
                console.log(`Stream not ready yet. Retrying... (${retryCount + 1}/${maxRetries})`);
                retryTimeoutRef.current = setTimeout(() => {
                  loadStream(retryCount + 1, maxRetries);
                }, 2000); // Increased to 2 seconds between retries
              }
            } catch (err) {
              console.error("Error loading stream:", err);
              // Retry after delay
              retryTimeoutRef.current = setTimeout(() => {
                loadStream(retryCount + 1, maxRetries);
              }, 2000); // Increased to 2 seconds between retries
            }
          };
          
          // Start trying to load the stream
          loadStream();
        } else {
          setError(res.message);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error starting stream:", err);
        setError("Failed to start stream.");
        setIsLoading(false);
      }
    };

    startStream();

    return () => {
      // Clear any pending retry timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      // Clean up HLS
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      // Stop the stream on the server
      axios.post(`http://localhost:5050/api/stream/stop/${cameraId}`).catch(console.error);
    };
  }, [cameraId, onClose, open]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: "85%", md: "800px" },
          maxHeight: "90vh",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          outline: "none",
          overflow: "auto"
        }}
      >
        <Paper elevation={0} sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2
            }}
          >
            <Typography variant="h5" component="h2" fontWeight="bold">
              <Videocam sx={{ verticalAlign: 'middle', mr: 1 }} />
              Live Camera Feed
            </Typography>
            <Button
              onClick={onClose}
              size="small"
              sx={{ minWidth: 0 }}
            >
              <Close />
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Video Player */}
          <Box sx={{ position: "relative", mb: 3, borderRadius: 2, overflow: "hidden", bgcolor: "black" }}>
            <video
              ref={videoRef}
              style={{ width: "100%", display: "block", borderRadius: "8px", aspectRatio: "16/9" }}
              autoPlay
              controls
              playsInline
              muted
            />
            
            {isLoading && (
              <Box 
                sx={{ 
                  position: "absolute", 
                  inset: 0, 
                  display: "flex", 
                  flexDirection: "column",
                  alignItems: "center", 
                  justifyContent: "center", 
                  bgcolor: "rgba(0,0,0,0.7)",
                  borderRadius: 2,
                  p: 3
                }}
              >
                <CircularProgress size={60} color="primary" sx={{ mb: 2 }} />
                <Typography variant="h6" color="white" gutterBottom>
                  Starting stream...
                </Typography>
                <Typography variant="body2" color="gray.300" sx={{ mb: 2 }}>
                  This may take up to a minute
                </Typography>
                
                <Box sx={{ width: "100%", maxWidth: "400px", mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={loadingProgress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="caption" color="gray.400">
                  Initializing camera feed ({loadingProgress}%)
                </Typography>
              </Box>
            )}
          </Box>
          
          {error && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: "error.light", 
                color: "error.contrastText",
                borderRadius: 2,
                display: "flex",
                alignItems: "center"
              }}
            >
              <Error sx={{ mr: 1 }} />
              <Typography variant="body2">{error}</Typography>
            </Paper>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          {/* Footer */}
        
        </Paper>
      </Box>
    </Modal>
  );
};

export default CameraModal;
