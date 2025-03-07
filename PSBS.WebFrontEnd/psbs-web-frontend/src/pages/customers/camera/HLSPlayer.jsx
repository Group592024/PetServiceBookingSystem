import React, { useRef, useEffect } from "react";
import Hls from "hls.js";

const HLSPlayer = ({ src }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let hls;
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current && videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
    }
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video ref={videoRef} controls style={{ width: "100%", height: "auto" }} />
  );
};

export default HLSPlayer;
