import React, { useEffect, useState } from "react";
import "video.js/dist/video-js.css";
import { Loader2, AlertCircle } from "lucide-react";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import HLSPlayer from "./HLSPlayer";

const CameraCus = () => {
  const [cameraCode, setCameraCode] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCameraStream = () => {
    if (!cameraCode) {
      setError("Please enter the camera code");
      return;
    }
    setLoading(true);
    setError(null);

    const token = sessionStorage.getItem("token");

    fetch(`http://localhost:5050/api/Camera/stream/${cameraCode}?_=${new Date().getTime()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          let errorMessage = "Unknown error";
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            errorMessage = await res.text();
          }
          console.error("Backend error:", errorMessage);

          if (errorMessage.toLowerCase().includes("camera not found")) {
            errorMessage = "Camera not found. Please check the camera code.";
          } else if (errorMessage.toLowerCase().includes("camera is deleted")) {
            errorMessage = "Camera is deleted. Please contact the administrator.";
          } else if (errorMessage.toLowerCase().includes("camera is not active")) {
            errorMessage = "Camera is not active. Please try again later.";
          } else if (errorMessage.toLowerCase().includes("camera address not found")) {
            errorMessage = "Camera address not found.";
          }
          throw new Error(errorMessage);
        }
        return res.json();
      })
      .then((data) => {
        if (data.streamUrl) {
          console.log("Stream URL received:", data.streamUrl);
          setStreamUrl(data.streamUrl);
          setError(null);
        } else {
          const errMsg = "Stream not found";
          console.error("Error:", errMsg);
          throw new Error(errMsg);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };


  return (
    <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
      <div className="overflow-y-auto w-full">
        <NavbarCustomer />
        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
          <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-center mb-4">📹 Camera</h2>
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
                {(() => {
                  const timestampParam = streamUrl.includes('?')
                    ? `&t=${new Date().getTime()}`
                    : `?t=${new Date().getTime()}`;
                  return <HLSPlayer src={`${streamUrl}${timestampParam}`} />;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCus;
