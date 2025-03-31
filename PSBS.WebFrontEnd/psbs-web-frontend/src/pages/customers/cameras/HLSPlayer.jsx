import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const HLSPlayer = ({ src }) => {
  const videoRef = useRef(null);
  let player = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (player.current) {
        player.current.dispose();
      }

      const token = sessionStorage.getItem("token");

      player.current = videojs(videoRef.current, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{ src, type: 'application/x-mpegURL' }],
        html5: {
          vhs: {
            withCredentials: true,
            overrideNative: true,
            xhr: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          },
        },
      });
    }

    return () => {
      if (player.current) {
        player.current.dispose();
      }
    };
  }, [src]);

  return (
    <div>
      <video ref={videoRef} className="video-js vjs-default-skin w-full h-full" />
    </div>
  );
};

export default HLSPlayer;
