import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";

const EditCamera = () => {
  const navigate = useNavigate();
  const { cameraId } = useParams();
  const token = sessionStorage.getItem("token");
  const sidebarRef = useRef(null);
  const [cameraDetails, setCameraDetails] = useState({
    cameraId: "",
    cameraType: "",
    cameraCode: "",
    cameraStatus: "",
    rtspUrl: "",
    cameraAddress: "",
    isDeleted: false,
  });

  // Lấy dữ liệu camera từ API
  useEffect(() => {
    const fetchCamera = async () => {
      try {
        const token = sessionStorage.getItem("token"); // Lấy token từ localStorage
        const response = await fetch(`http://localhost:5050/api/Camera/${cameraId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Thêm token vào header
          },
        });
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu camera");
        }
        const data = await response.json();
        const camera = data.data || data;
        setCameraDetails(camera);
      } catch (error) {
        console.error("Error fetching camera:", error);
        Swal.fire("Error", "Không thể tải dữ liệu camera", "error");
      }
    };
    fetchCamera();
  }, [cameraId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCameraDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !cameraDetails.cameraType ||
      !cameraDetails.cameraCode ||
      !cameraDetails.cameraStatus ||
      !cameraDetails.rtspUrl ||
      !cameraDetails.cameraAddress
    ) {
      Swal.fire("Error", "Vui lòng điền đầy đủ các trường bắt buộc", "error");
      return false;
    }
    return true;
  };

  const handleEdit = async () => {
    if (!validateForm()) return;
    const updatedCamera = {
      ...cameraDetails,
    };
    try {
      const token = sessionStorage.getItem("token"); // Lấy token từ localStorage
  
      const response = await fetch(`http://localhost:5050/api/Camera/${cameraId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
        body: JSON.stringify(updatedCamera),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire("Error", errorData.message || "Cập nhật dữ liệu thất bại", "error");
        return;
      }
  
      Swal.fire("Success", "Camera cập nhật thành công!", "success").then(() => {
        navigate(-1);
      });
    } catch (error) {
      console.error("Error updating camera:", error);
      Swal.fire("Error", "Cập nhật dữ liệu thất bại. Vui lòng thử lại sau.", "error");
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
          <h2 className="mb-4 text-xl font-bold">Edit Camera</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Camera Type</label>
            <input
              type="text"
              name="cameraType"
              value={cameraDetails.cameraType}
              onChange={handleChange}
              placeholder="Nhập Camera Type"
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
              placeholder="Nhập Camera Code"
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
              placeholder="Nhập Camera Status"
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
              placeholder="Nhập RTSP URL"
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
              placeholder="Nhập Camera Address"
              className="w-full p-3 border rounded-md"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleEdit}
              className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-700"
            >
              Save
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

export default EditCamera;
