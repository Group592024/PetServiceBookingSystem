import "./datatable.css";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";

const Datatable = () => {
  const [medicines, setMedicines] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getToken = () => {
    return sessionStorage.getItem('token');
  };

  const fetchMedicinesAndTreatments = async () => {
    try {
      const medicinesResponse = await axios.get(
        "http://localhost:5050/Medicines/all", {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      const treatmentsResponse = await axios.get(
        "http://localhost:5050/api/Treatment/available", {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      if (medicinesResponse.data.flag) {
        setMedicines(medicinesResponse.data.data);
      } else {
        setError(medicinesResponse.data.message || "No medicines found");
        toast.error(medicinesResponse.data.message || "No medicines found");
      }

      if (treatmentsResponse.data.flag) {
        setTreatments(treatmentsResponse.data.data);
      } else {
        setError(treatmentsResponse.data.message || "No treatments found");
        toast.error(treatmentsResponse.data.message || "No treatments found");
      }
    } catch (err) {
      setError("Error fetching data: " + err.message);
      toast.error("Error fetching data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicinesAndTreatments();
  }, []);

  const getTreatmentName = (medicineTreatmentId) => {
    const treatment = treatments.find(
      (t) => t.treatmentId === medicineTreatmentId
    );
    return treatment ? treatment.treatmentName : "Unknown";
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="cellWithTable">{params.value}</div>
      ),
    },
    {
      field: "medicineName",
      headerName: "Name",
      flex: 3,
      headerAlign: "center",
      renderCell: (params) => (
        <div className="cellWithTable">
          <img
            className="cellImg"
            src={`http://localhost:5003${params.row.medicineImg}`}
            alt="medicine"
          />
          {params.value}
        </div>
      ),
    },
    {
      field: "treatmentId",
      headerName: "Treatment",
      flex: 2,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="cellWithTable">{getTreatmentName(params.value)}</div>
      ),
    },
    {
      field: "isDeleted",
      headerName: "Active",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isDeleted = params.row.isDeleted;
        return (
          <div
            style={{
              color: isDeleted ? "red" : "green",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {isDeleted ? "Inactive" : "Active"}
          </div>
        );
      },
    },
  ];

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      headerAlign: "center",
      flex: 2,
      renderCell: (params) => {
        const medicineId = params.row.medicineId;
        return (
          <div
            className="cellAction"
            class="flex justify-around items-center w-full h-full"
          >
            <IconButton
              aria-label="info"
              onClick={() => navigate(`/medicines/detail/${medicineId}`)}
            >
              <InfoIcon color="info" />
            </IconButton>
            <IconButton
              aria-label="edit"
              onClick={() => navigate(`/medicines/update/${medicineId}`)}
            >
              <EditIcon color="success" />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() => {
                handleDelete(medicineId);
              }}
            >
              <DeleteIcon color="error" />
            </IconButton>
          </div>
        );
      },
    },
  ];
  const handleDelete = (medicineId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `http://localhost:5050/Medicines/${medicineId}` , {
              headers: {
                Authorization: `Bearer ${getToken()}`
              }
            }
          );
          if (response.data.flag) {
            toast.success(
              response.data.message || "Medicine deleted successfully!"
            );
            fetchMedicinesAndTreatments();
          } else {
            toast.error(response.data.message || "Fail to delete medicine");
          }
        } catch (error) {
          toast.error("Error deleting medicine: " + error.message);
        }
      }
    });
  };

  const medicinesRows = medicines.map((medicine,index) => ({
    id : index + 1 ,
    medicineId: medicine.medicineId,
    medicineName: medicine.medicineName,
    medicineImg: medicine.medicineImage,
    treatmentId: medicine.treatmentId,
    isDeleted: medicine.isDeleted,
  }));

  if (loading) {
    return (
      <div class="flex items-center justify-center h-svh">
        <div role="status">
          <svg
            aria-hidden="true"
            class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="Datatable">
      <Box
        sx={{
          height: 400,
          width: "100%",
          "& .MuiDataGrid-root": {
            backgroundColor: "#f9f9f9", // Brighter background for the entire DataGrid
          },
          "& .MuiDataGrid-row": {
            backgroundColor: "#f4f4f4", // Brighter row background
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: "#c8f6e9 !important", // Brighter selected row
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#9f9f9f", // Brighter background for pagination
          },
          "& .MuiPaginationItem-root": {
            backgroundColor: "#b3f2ed", // Brighter pagination buttons
            color: "#3f3f3f",
          },
          "& .MuiPaginationItem-root:hover": {
            backgroundColor: "#ede4e2", // Hover effect on pagination buttons
          },
        }}
      >
        <DataGrid
          rows={medicinesRows}
          columns={columns.concat(actionColumn)}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  );
};

export default Datatable;
