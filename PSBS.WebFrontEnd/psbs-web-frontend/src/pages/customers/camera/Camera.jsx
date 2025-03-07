import React, { useEffect, useState } from "react";
import "video.js/dist/video-js.css";
import { Loader2, AlertCircle } from "lucide-react";
import HLSPlayer from "./HLSPlayer"; // Đảm bảo đường dẫn đúng tới HLSPlayer.jsx

const Camera = () => {
  const [cameraCode, setCameraCode] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCameraStream = () => {
    if (!cameraCode) {
      setError("Vui lòng nhập mã camera");
      return;
    }
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5023/api/Camera/stream/${cameraCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.streamUrl) {
          setStreamUrl(data.streamUrl);
          setError(null);
        } else {
          setError("Không tìm thấy luồng video");
        }
      })
      .catch(() => setError("Lỗi khi lấy dữ liệu camera"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-4">📹 Xem Camera</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={cameraCode}
            onChange={(e) => setCameraCode(e.target.value)}
            placeholder="Nhập mã camera..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchCameraStream}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Xem
          </button>
        </div>
        {loading && (
          <div className="flex justify-center items-center text-gray-500">
            <Loader2 className="animate-spin w-6 h-6 mr-2" /> Đang tải...
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-100 p-3 rounded-md">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}
        {!error && !loading && streamUrl && (
          <div className="relative border rounded-lg overflow-hidden shadow-md">
            <HLSPlayer src={streamUrl} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Camera;
