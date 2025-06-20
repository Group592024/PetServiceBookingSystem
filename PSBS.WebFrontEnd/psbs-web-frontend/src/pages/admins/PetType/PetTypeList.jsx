import React, { useEffect, useRef, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { Box, IconButton, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import InfoIcon from "@mui/icons-material/Info";

const PetTypeList = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  const fetchDataFunction = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch("http://localhost:5050/api/PetType", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const response = await fetchData.json();

      console.log("test ne nhe");
      console.log(response);

      const result = response.data.map((item) => ({
        id: item.petType_ID,
        ...item,
      }));

      setData(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        const fetchDelete = async () => {
          try {
            const token = sessionStorage.getItem("token");
            const deleteResponse = await fetch(
              `http://localhost:5050/api/PetType/${id}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log(deleteResponse);

            if (deleteResponse.ok) {
              Swal.fire(
                "Deleted!",
                "The pet type has been deleted.",
                "success"
              );
              fetchDataFunction();
            } else if (deleteResponse.status == 409) {
              Swal.fire(
                "Error!",
                "Can not delete this pet type because it has pet breed",
                "error"
              );
            } else {
              Swal.fire("Error!", "Failed to delete the pet type", "error");
            }
          } catch (error) {
            console.log(error);
            Swal.fire("Error!", "Failed to delete the pet type", "error");
          }
        };

        fetchDelete();
      }
    });
  };

  const newRows = data.map((row, index) => ({
    ...row,
    index: index + 1,
  }));

  const columns = [
    {
      field: "index",
      headerName: "No.",
      flex: 0.5,
      // renderCell: (params) => <span>{params.rowIndex + 1}</span>,
    },
    { field: "petType_Name", headerName: "Pet Type Name", flex: 1 },
    { field: "petType_Description", headerName: "Description", flex: 2 },
    {
      field: "isDelete",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <span>{params.row.isDelete ? "Inactive" : "Active"}</span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <IconButton
            color="primary"
            data-testid="info-icon-button"
            onClick={() => navigate(`/petType/${params.row.id}`)}
          >
            <InfoIcon />
          </IconButton>

          {/* Edit Button */}
          <IconButton
            data-testid="edit-icon-button"
            color="success"
            onClick={() => navigate(`/petType/edit/${params.row.id}`)}
          >
            <EditIcon />
          </IconButton>

          {/* Delete Button */}
          <IconButton
            data-testid="delete-icon-button"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div class="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="header">
            <div className="left">
              <h1>Pet Type List</h1>
            </div>
            <button className="report" onClick={() => navigate("/petType/add")}>
              <i class="bx bxs-plus-circle"></i>
              <span>NEW</span>
            </button>
          </div>
          <Box sx={{ width: "100%", backgroundColor: "white" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <DataGrid
                columns={columns}
                rows={newRows}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 5,
                    },
                  },
                }}
                pageSizeOptions={[5]}
                checkboxSelection
                disableRowSelectionOnClick
              />
            </div>
          </Box>
        </main>
      </div>
    </div>
  );
};

export default PetTypeList;
