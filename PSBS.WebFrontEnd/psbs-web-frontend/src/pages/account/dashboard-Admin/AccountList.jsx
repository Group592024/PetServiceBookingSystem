import React, { useEffect, useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import moment from "moment";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import "./AccountList.css";

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPhoneNumber, setAccountPhoneNumber] = useState("");
  const sidebarRef = useRef(null);
  const token = sessionStorage.getItem("token");

  const userRole = localStorage.getItem("role");

  const fetchAccounts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:5050/api/Account/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.data) {
        console.log("Filtered accounts:", filteredAccounts);
        console.log(accounts);
        console.log("RoleId:", userRole);
        console.log(localStorage.getItem("role"));

        setAccounts(data.data);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };


  useEffect(() => {
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
            ? `http://localhost:5050/api/Account/delete/${accountId}`
            : `http://localhost:5050/api/Account/delete/${accountId}`;
          const response = await fetch(apiUrl, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            if (isDeleted) {
              setAccounts((prev) =>
                prev.filter((acc) => acc.accountId !== accountId)
              );
              Swal.fire(
                "Deleted!",
                `${accountName} has been permanently deleted.`,
                "success"
              );
            } else {
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

  const filteredAccounts = accounts
    .filter((account) => {
      if (!userRole) {
        return true;
      }

      if (userRole === "admin") {
        return ["staff", "user"].includes(account.roleId);
      }

      if (userRole === "staff") {
        return account.roleId === "user";
      }

      return false;
     });
    //.filter((account) => {
    //   const query = searchQuery.toLowerCase();
    //   return (
    //     !searchQuery ||
    //     account.accountPhoneNumber.includes(query) ||
    //     account.accountEmail.toLowerCase().includes(query) ||
    //     account.accountName.toLowerCase().includes(query)

    //   );
    // });




  const handleSubmit = async () => {
    if (!accountEmail || !accountPhoneNumber) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill in all required fields.",
      });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(accountEmail)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address (e.g., username@gmail.com)",
      });
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(accountPhoneNumber)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone",
        text: "Please enter a valid phone number",
      });
      return;
    }

    const formData = new FormData();
    formData.append("RegisterTempDTO.AccountEmail", accountEmail);
    formData.append("RegisterTempDTO.AccountPhoneNumber", accountPhoneNumber);

    try {
      const response = await fetch("http://localhost:5050/api/Account/addaccount", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire("Success", "Account added successfully!", "success");
        setOpenDialog(false);
        fetchAccounts();
        setAccountEmail("");
        setAccountPhoneNumber("");
      } else {
        Swal.fire("Error", data.message || "Error adding account", "error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire("Error", "An error occurred while adding the account.", "error");
    }
  };


  const columns = [
    {
      field: "serialNumber",
      headerName: "S.No",
      flex: 0.3,
      sortable: true,
      renderCell: (params) => <span>{params.row.id}</span>,
      sortComparator: (v1, v2) => v1 - v2,
    },
    { field: "accountName", headerName: "Name", flex: 1, minWidth: 80 },
    { field: "accountEmail", headerName: "Email", flex: 1, minWidth: 180 },
    { field: "accountPhoneNumber", headerName: "Phone", width: 120 },
    { field: "roleId", headerName: "Role", width: 100 },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 0.5,
      width: 100,
      renderCell: (params) => moment(params.value).format("DD/MM/YYYY"),
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      flex: 0.5,
      width: 100,
      renderCell: (params) => moment(params.value).format("DD/MM/YYYY"),
    },
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
      sortComparator: (v1, v2) => (v1 === v2 ? 0 : v1 ? 1 : -1),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
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
            aria-label="Delete"
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
      <div className="content h-full">
        <Navbar sidebarRef={sidebarRef} />
        <main className="flex-1">
          <div className="p-4 bg-white shadow-md rounded-md h-full">
            <h2 className="mb-4 text-xl font-bold">Account List</h2>
            <div className="flex justify-end mb-4">
              {/* <form className="relative flex items-center mr-4">
                <input
                  type="search"
                  id="search-dropdown"
                  className="block w-64 p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                  placeholder="Search Accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search accounts"
                  required
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 p-2.5 text-sm font-medium text-white bg-blue-700 rounded-r-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  aria-label="Search"
                >
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M10.5 16.5a6 6 0 100-12 6 6 0 000 12z"
                    />
                  </svg>
                </button>
              </form> */}
              {userRole === "staff" && (
                <button
                  type="button"
                  onClick={() => setOpenDialog(true)}
                  className="ml-4 flex items-center px-5 py-2.5 text-sm font-medium text-blue-700 border border-blue-700 rounded-lg hover:text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500"
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
              )}
            </div>
            <div style={{ height: "calc(100% - 80px)", width: "100%" }}>
              <DataGrid
                rows={filteredAccounts
                  .sort((a, b) => a.accountIsDeleted - b.accountIsDeleted)
                  .map((acc, index) => ({
                    ...acc,
                    id: index + 1,
                    createdAt: acc.createdAt || new Date().toISOString(),
                    updatedAt: acc.updatedAt || new Date().toISOString(),
                  }))}
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="text-center font-semibold text-lg text-gray-800">
          Create New Account
        </DialogTitle>
        <DialogContent className="py-4">
          <Box display="flex" flexDirection="column" gap={3} p={2}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              inputProps={{ "data-cy": "email-input" }}  // Gán thuộc tính data-cy cho input
              InputProps={{
                style: { borderRadius: "8px", background: "#F8F9FA" },
              }}
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              value={accountPhoneNumber}
              onChange={(e) => setAccountPhoneNumber(e.target.value)}
              inputProps={{ "data-cy": "phone-input" }}  // Gán thuộc tính data-cy cho input
              InputProps={{
                style: { borderRadius: "8px", background: "#F8F9FA" },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            color="error"
            sx={{ borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ borderRadius: "8px", boxShadow: 3 }}
          >
            Submit
          </Button>
        </DialogActions>

      </Dialog>
    </div>
  );
};

export default AccountList;
