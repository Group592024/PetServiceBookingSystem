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
            ? `http://localhost:5000/api/Account/delete/${accountId}` // Xóa vĩnh viễn
            : `http://localhost:5000/api/Account/delete/${accountId}`; // Chỉ đánh dấu là xóa

          const response = await fetch(apiUrl, {
            method: "DELETE",
          });

          if (response.ok) {
            if (isDeleted) {
              // Xóa vĩnh viễn
              setAccounts((prev) =>
                prev.filter((acc) => acc.accountId !== accountId)
              );
              Swal.fire(
                "Deleted!",
                `${accountName} has been permanently deleted.`,
                "success"
              );
            } else {
              // Đánh dấu xóa
              setAccounts((prev) =>
                prev.map((acc) =>
                  acc.accountId === accountId
                    ? { ...acc, accountIsDeleted: true }
                    : acc
                )
              );
              Swal.fire(
                "Deleted!",
                `${accountName} has been marked as deleted.`,
                "success"
              );
            }
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
    {
      field: "serialNumber",
      headerName: "S.No",
      flex: 0.5,
      headerAlign: "center",
      sortable: true,  // Enable sorting for S.No
      renderCell: (params) => {
        return <span>{params.row.id}</span>;  // Rendering serial number based on the row's id
      },
      // Sort by the row id
      sortComparator: (v1, v2) => {
        return v1 - v2;  // Sorting based on id (serial number)
      },
    },
    { field: "accountName", headerName: "Name", flex: 1, headerAlign: "center" },
    { field: "accountEmail", headerName: "Email", flex: 1, headerAlign: "center" },
    { field: "accountPhoneNumber", headerName: "Phone", flex: 1, headerAlign: "center" },
    { field: "roleId", headerName: "Role", flex: 0.5, headerAlign: "center" },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      headerAlign: "center",
      sortable: true,  // Enable sorting for Status
      renderCell: (params) =>
        params.row.accountIsDeleted ? (
          <span style={{ color: "red", fontWeight: "bold" }}>Deleted</span>
        ) : (
          <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
        ),
      // Sort by the accountIsDeleted status (true or false)
      sortComparator: (v1, v2) => {
        return v1 === v2 ? 0 : v1 ? 1 : -1; // Sorting based on accountIsDeleted (true/false)
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      headerAlign: "center",
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
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
            onClick={() =>
              handleDelete(params.row.accountId, params.row.accountName, params.row.accountIsDeleted)
            }
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
      <div className="content flex-1 h-full">
        <Navbar sidebarRef={sidebarRef} />
        <main className="flex-1">
          {/* DataGrid Section */}
          <div className="p-4 bg-white shadow-md rounded-md h-full">
            <h2 className="mb-4 text-xl font-bold">Account List</h2>
            <div style={{ height: "calc(100% - 80px)", width: "100%" }}>
              <DataGrid
                rows={accounts.map((acc, index) => ({ ...acc, id: index + 1 }))}  // Add id to rows for sorting
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
