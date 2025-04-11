import React, { useEffect, useState } from "react";
import "video.js/dist/video-js.css";
import { Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import HLSPlayer from "./HLSPlayer";

const CameraCus = ({ initialCameraCode = "" }) => {
  const [cameraCode, setCameraCode] = useState(initialCameraCode);
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => sessionStorage.getItem("token");

  // Tự động fetch khi có initialCameraCode
  useEffect(() => {
    if (initialCameraCode) {
      fetchCameraStream(initialCameraCode);
    }
  }, [initialCameraCode]);

  const fetchCameraStream = (codeParam) => {
    const code = codeParam || cameraCode;
    if (!code) {
      setError("Vui lòng nhập mã camera");
      return;
    }
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5050/api/Camera/stream/${code}?_=${Date.now()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          let msg = "Lỗi không xác định";
          try {
            const err = await res.json();
            msg = err.message || msg;
          } catch {
            msg = await res.text();
          }
          const low = msg.toLowerCase();
          if (low.includes("camera not found")) msg = "Camera not found.";
          if (low.includes("camera is deleted")) msg = "Camera is deleted.";
          if (low.includes("camera is not active")) msg = "Camera is not active.";
          if (low.includes("camera address not found")) msg = "Camera address not found.";
          throw new Error(msg);
        }
        return res.json();
      })
      .then((data) => {
        if (data.streamUrl) {
          setStreamUrl(data.streamUrl);
        } else {
          throw new Error("Không có luồng phát");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-4 bg-gray-100 min-h-[400px]">
      <h3 className="text-xl font-semibold mb-4 text-center">Watching Camera</h3>
      {loading && (
        <div className="flex items-center justify-center text-gray-500">
          <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-100 p-3 rounded-md">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}
      {!error && !loading && streamUrl && (
        <div className="border rounded-lg overflow-hidden shadow-md">
          {(() => {
            const ts = streamUrl.includes("?") ? `&t=${Date.now()}` : `?t=${Date.now()}`;
            return <HLSPlayer src={`${streamUrl}${ts}`} />;
          })()}
        </div>
      )}
    </div>
  );
};

export default CameraCus;
