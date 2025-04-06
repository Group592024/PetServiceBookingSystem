import React, { useState, useEffect, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import "./CameraList.css";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";

const CameraList = () => {
  const [cameras, setCameras] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const getHeaders = () => {
    const token = sessionStorage.getItem("token");
    console.log("Token:", token); 
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };


  const fetchCameras = async () => {
    try {
      const headers = getHeaders();

      const response = await fetch(`http://localhost:5050/api/Camera/all`, {
        method: "GET",
        headers,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch camera data");
      }

      const data = await response.json();
      console.log("Data received:", data);
      setCameras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching cameras:", error);
      Swal.fire("Error", error.message || "Failed to load camera data", "error");
    }
  };


  useEffect(() => {
    fetchCameras();
  }, []);

  const filteredCameras = cameras.filter((camera) => {
    const query = searchQuery.toLowerCase();
    return (
      (camera.cameraCode?.toLowerCase() ?? "").includes(query) ||
      (camera.cameraType?.toLowerCase() ?? "").includes(query) ||
      (camera.cameraStatus?.toLowerCase() ?? "").includes(query) ||
      (camera.cameraAddress?.toLowerCase() ?? "").includes(query)
    );
  });
  console.log("Filtered Cameras:", filteredCameras);


  const handleDelete = (cameraId, cameraCode) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete camera: ${cameraCode}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const headers = getHeaders();
          const response = await fetch(`http://localhost:5050/api/Camera/${cameraId}`, {
            method: "DELETE",
            headers,
          });

          const data = await response.json();
          if (response.ok) {
            if (data.message.toLowerCase().includes("soft-deleted")) {
              setCameras((prev) =>
                prev.map((cam) =>
                  cam.cameraId === cameraId ? { ...cam, isDeleted: true } : cam
                )
              );
              Swal.fire("Deleted!", `${cameraCode} has been soft-deleted.`, "success");
            } else if (data.message.toLowerCase().includes("hard-deleted")) {
              setCameras((prev) => prev.filter((cam) => cam.cameraId !== cameraId));
              Swal.fire("Deleted!", `${cameraCode} has been permanently deleted.`, "success");
            }
          } else {
            Swal.fire("Error", data.message || "Failed to delete camera", "error");
          }
        } catch (error) {
          console.error("Error deleting camera:", error);
          Swal.fire("Error", "An error occurred while deleting the camera", "error");
        }
      }
    });
  };

  const columns = [
    {
      field: "serialNumber",
      headerName: "S.No",
      flex: 0.5,
      renderCell: (params) => <span>{params.row.id ?? ""}</span>,
    },
    { field: "cameraCode", headerName: "Camera Code", flex: 1 },
    { field: "cameraType", headerName: "Type", flex: 1 },
    { field: "cameraStatus", headerName: "Status", flex: 1 },
    { field: "rtspUrl", headerName: "RTSP URL", flex: 2 },
    { field: "cameraAddress", headerName: "Address", flex: 1 },
    {
      field: "isDeleted",
      headerName: "Deleted",
      flex: 0.5,
      renderCell: (params) => (params.value ? "Yes" : "No"),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link to={`/editcamera/${params.row.cameraId}`}>
            <IconButton color="primary">
              <EditIcon />
            </IconButton>
          </Link>
          <Link to={`/detailcamera/${params.row.cameraId}`}>
            <IconButton color="default">
              <VisibilityIcon />
            </IconButton>
          </Link>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.cameraId, params.row.cameraCode)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-dark-grey-100">
      <Sidebar ref={sidebarRef} />
      <div className="content h-full">
        <Navbar sidebarRef={sidebarRef} />
        <main className="flex-1">
          <div className="p-4 bg-white shadow-md rounded-md h-full">
            <h2 className="mb-4 text-xl font-bold">Camera List</h2>
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => navigate("/addcamera")}
                className="ml-4 flex items-center px-5 py-2.5 text-sm font-medium text-blue-700 border border-blue-700 rounded-lg hover:text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New
              </button>
            </div>

            <div style={{ height: "calc(100% - 80px)", width: "100%" }}>
              <DataGrid
                rows={filteredCameras
                  .sort((a, b) => a.isDeleted - b.isDeleted)
                  .map((cam, index) => ({ ...cam, id: index + 1 }))}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 15, 20]}
                disableSelectionOnClick
                pagination
                getRowId={(row) => row.cameraId}
                getRowClassName={(params) => (params.row.isDeleted ? "deleted-row" : "")}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CameraList;
