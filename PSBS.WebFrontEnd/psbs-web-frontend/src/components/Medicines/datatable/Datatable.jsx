import "./datatable.css";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2"; 


const Datatable = () => {
  const [medicines, setMedicines] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedicinesAndTreatments = async () => {
      try {
        const medicinesResponse = await axios.get("http://localhost:5003/Medicines/all");
        const treatmentsResponse = await axios.get("http://localhost:5003/api/Treatment/available"); 
        
        if (medicinesResponse.data.flag) {
          toast.success(
            medicinesResponse.data.message || "Medicines data fetched successfully!"
          );
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

    fetchMedicinesAndTreatments();
  }, []);

   const getTreatmentName = (medicineTreatmentId) => {
    const treatment = treatments.find(t => t.treatmentId === medicineTreatmentId);
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
      const medicineId = params.row.id;
      return (
        <div
          className="cellAction"
          class="flex justify-around items-center w-full h-full"
        >
          <Link
            to={`/medicines/detail/${medicineId}`}
            className="detailBtn"
            style={{ textDecoration: "none" }}
          >
            <svg
              className="w-6 h-6 text-gray-800 dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </Link>
          <Link to={`/medicines/update/${medicineId}`} className="editBtn" style={{ textDecoration: "none" }}>
            <svg
              className="w-6 h-6 text-gray-800 dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
              />
            </svg>
          </Link>
          <div className="deleteBtn" onClick={() => handleDelete(medicineId)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M7.5 1h9v3H22v2h-2.029l-.5 17H4.529l-.5-17H2V4h5.5V1Zm2 3h5V3h-5v1ZM6.03 6l.441 15h11.058l.441-15H6.03ZM13 8v11h-2V8h2Z"
              />
            </svg>
          </div>
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
        const response = await axios.delete(`http://localhost:5003/Medicines/${medicineId}`);
        if (response.data.flag) {
          toast.success(response.data.message || "Medicine deleted successfully!");
          setMedicines(medicines.filter((medicine) => medicine.medicineId !== medicineId)); 
          window.location.reload();
        } else {
          toast.error(response.data.message || "Fail to delete medicine");
        }
      } catch (error) {
        toast.error("Error deleting medicine: " + error.message);
      }
    }
  });
};

  const medicinesRows = medicines.map((medicine) => ({
    id: medicine.medicineId, 
    medicineName: medicine.medicineName,
    medicineImg: medicine.medicineImage, 
    treatmentId: medicine.treatmentId,
    isDeleted: medicine.isDeleted, 
  }));
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
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
      <ToastContainer />
    </div>
  );
};

export default Datatable;
