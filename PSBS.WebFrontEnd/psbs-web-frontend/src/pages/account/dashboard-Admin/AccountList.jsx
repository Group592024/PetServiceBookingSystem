import React, { useEffect, useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { Link } from "react-router-dom"; 
import "./AccountList.css"; 

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/Account/all");
        const data = await response.json();
        if (data && data.data) {
          setAccounts(data.data);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  const handleDelete = async (accountId, accountName, isDeleted) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete account: ${accountName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = isDeleted
            ? `http://localhost:5000/api/Account/delete/permanent/${accountId}` 
            : `http://localhost:5000/api/Account/delete/${accountId}`; 
          const response = await fetch(apiUrl, {
            method: "DELETE",
          });
  
          if (response.ok) {
            setAccounts((prev) =>
              prev.filter((acc) => acc.accountId !== accountId)
            );
            Swal.fire(
              "Deleted!",
              `${accountName} has been deleted successfully.`,
              "success"
            );
          } else {
            const errorData = await response.json();
            Swal.fire(
              "Error!",
              errorData.message || "Failed to delete the account.",
              "error"
            );
          }
        } catch (error) {
          console.error("Error deleting account:", error);
          Swal.fire("Error!", "An error occurred while deleting the account.", "error");
        }
      }
    });
  };
    const columns = [
    { field: "accountName", headerName: "Name", flex: 1 },
    { field: "accountEmail", headerName: "Email", flex: 1 },
    { field: "accountPhoneNumber", headerName: "Phone", flex: 1 },
    { field: "roleId", headerName: "Role", flex: 0.5 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      renderCell: (params) =>
        params.row.accountIsDeleted ? (
          <span style={{ color: "red", fontWeight: "bold" }}>Deleted</span>
        ) : (
          <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/editprofile/${params.row.accountId}`}>
            <IconButton color="primary">
              <EditIcon />
            </IconButton>
          </Link>
          <Link to={`/profile/${params.row.accountId}`}>
            <IconButton color="custom">
              <VisibilityIcon />
            </IconButton>
          </Link>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.accountId, params.row.accountName)}
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

      {/* Main Content */}
      <div className="content ">
        <Navbar sidebarRef={sidebarRef} />
<main>
   {/* DataGrid Section */}
   <div className="p-4 bg-white shadow-md rounded-md">
          <h2 className="mb-4 text-xl font-bold">Account List</h2>
          <div style={{ height: 600, width: "80%" }}>
            <DataGrid
              rows={accounts.map((acc) => ({ ...acc, id: acc.accountId }))}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 15, 20]}
              disableSelectionOnClick
              pagination
              paginationMode="client"
              getRowClassName={(params) =>
                params.row.accountIsDeleted ? "row-deleted" : ""
              }
            />
          </div>
        </div>
</main>
       
      </div>
    </div>
  );
};

export default AccountList;
