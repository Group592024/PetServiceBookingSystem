import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";

const CreateCamera = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const [cameraDetails, setCameraDetails] = useState({
    cameraType: "",
    cameraCode: "",
    cameraStatus: "",
    rtspUrl: "",
    cameraAddress: "",
    isDeleted: false,
  });

  // Hàm tạo GUID cho cameraId
  const generateGuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Hàm lấy headers với token từ sessionStorage
  const getHeaders = () => {
    const token = sessionStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCameraDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreate = async () => {
    // Kiểm tra các trường bắt buộc
    if (
      !cameraDetails.cameraType ||
      !cameraDetails.cameraCode ||
      !cameraDetails.cameraStatus ||
      !cameraDetails.rtspUrl ||
      !cameraDetails.cameraAddress
    ) {
      Swal.fire("Error", "Please fill in all required fields", "error");
      return;
    }

    // Tạo mới object camera với cameraId được tạo từ generateGuid
    const newCamera = {
      cameraId: generateGuid(),
      ...cameraDetails,
    };

    try {
      const headers = getHeaders();

      const response = await fetch(`http://localhost:5050/api/Camera/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(newCamera),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire("Error", errorData.message || "Failed to create camera", "error");
      } else {
        Swal.fire("Success", "Camera created successfully!", "success").then(() => {
          navigate("/cameralist");
        });
      }
    } catch (error) {
      console.error("Error creating camera:", error);
      Swal.fire("Error", "An error occurred while creating the camera", "error");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-screen bg-dark-grey-100">
      <Sidebar ref={sidebarRef} />
      <div className="content h-full">
        <Navbar sidebarRef={sidebarRef} />
        <main className="p-4 bg-white shadow-md rounded-md h-full">
          <h2 className="mb-4 text-xl font-bold">Create Camera</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Camera Type</label>
            <input
              type="text"
              name="cameraType"
              value={cameraDetails.cameraType}
              onChange={handleChange}
              placeholder="Enter Camera Type"
              className="w-full p-3 border rounded-md"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Camera Code</label>
            <input
              type="text"
              name="cameraCode"
              value={cameraDetails.cameraCode}
              onChange={handleChange}
              placeholder="Enter Camera Code"
              className="w-full p-3 border rounded-md"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Camera Status</label>
            <input
              type="text"
              name="cameraStatus"
              value={cameraDetails.cameraStatus}
              onChange={handleChange}
              placeholder="Enter Camera Status"
              className="w-full p-3 border rounded-md"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">RTSP URL</label>
            <input
              type="text"
              name="rtspUrl"
              value={cameraDetails.rtspUrl}
              onChange={handleChange}
              placeholder="Enter RTSP URL"
              className="w-full p-3 border rounded-md"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Camera Address</label>
            <input
              type="text"
              name="cameraAddress"
              value={cameraDetails.cameraAddress}
              onChange={handleChange}
              placeholder="Enter Camera Address"
              className="w-full p-3 border rounded-md"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleCreate}
              className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-700"
            >
              Create
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateCamera;
