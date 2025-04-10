import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import Swal from "sweetalert2";

const CameraDetail = () => {
    const sidebarRef = useRef(null);
    const token = sessionStorage.getItem("token");
    const navigate = useNavigate();
    const { cameraId } = useParams();
    const [cameraDetail, setCameraDetail] = useState(null);

    useEffect(() => {
        const fetchCameraDetail = async () => {
            try {
                const token = sessionStorage.getItem("token"); 
                if (!token) {
                    throw new Error("Token not found. Please log in again.");
                }
    
                const response = await fetch(`http://localhost:5050/api/Camera/${cameraId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, 
                    },
                });
    
                if (!response.ok) {
                    throw new Error("Unable to fetch camera data.");
                }
    
                const data = await response.json();
                setCameraDetail(data.data || data);
            } catch (error) {
                console.error("Error fetching camera detail:", error);
                Swal.fire("Error", "Unable to fetch camera data. Please try again later.", "error");
            }
        };
    
        fetchCameraDetail();
    }, [cameraId]);
    

    const handleBack = () => {
        navigate(-1);
    };

    if (!cameraDetail) {
        return <div>Loading...</div>;
    }

    const { cameraType, cameraCode, cameraStatus, rtspUrl, cameraAddress, isDeleted } = cameraDetail;

    return (
        <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
            <Sidebar ref={sidebarRef} />
            <div className="content overflow-y-auto">
                <Navbar sidebarRef={sidebarRef} />
                <div className="p-6 bg-white shadow-md rounded-md max-w-full">
                    <h2 className="mb-4 text-xl font-bold text-left">Camera Detail</h2>
                    <div className="flex flex-wrap">
                        <div className="w-full sm:w-1/2 bg-white shadow-md rounded-md p-6">
                            <div className="mb-3">
                                <label className="block text-sm font-bold mb-1">Camera Type</label>
                                <input
                                    type="text"
                                    value={cameraType}
                                    disabled
                                    className="w-full p-3 border rounded-md"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-bold mb-1">Camera Name</label>
                                <input
                                    type="text"
                                    value={cameraCode}
                                    disabled
                                    className="w-full p-3 border rounded-md"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-bold mb-1">Camera Status</label>
                                <input
                                    type="text"
                                    value={cameraStatus}
                                    disabled
                                    className="w-full p-3 border rounded-md"
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2 bg-white shadow-md rounded-md p-6">
                            <div className="mb-3">
                                <label className="block text-sm font-bold mb-1">RTSP URL</label>
                                <input
                                    type="text"
                                    value={rtspUrl}
                                    disabled
                                    className="w-full p-3 border rounded-md"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-bold mb-1">Camera Address</label>
                                <input
                                    type="text"
                                    value={cameraAddress}
                                    disabled
                                    className="w-full p-3 border rounded-md"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-bold mb-1">Status</label>
                                <input
                                    type="text"
                                    value={isDeleted ? "Deleted" : "Not Deleted"}
                                    disabled
                                    className="w-full p-3 border rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="mt-4 bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
                        >
                            Back
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CameraDetail;
