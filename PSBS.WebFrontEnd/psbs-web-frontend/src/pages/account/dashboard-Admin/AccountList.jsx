import React, { useEffect, useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { Link } from "react-router-dom"; // Import Link từ react-router-dom

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const sidebarRef = useRef(null);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/Account/active");
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

  // Hàm xử lý xóa
  const handleDelete = async (accountId, accountName) => {
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
          const response = await fetch(`http://localhost:5000/api/Account/delete/${accountId}`, {
            method: "DELETE",
          });
  
          if (response.ok) {
            setAccounts((prev) => prev.filter((acc) => acc.accountId !== accountId));
            Swal.fire("Deleted!", `${accountName} has been deleted.`, "success");
          } else {
            const errorData = await response.json();
            Swal.fire("Error!", errorData.message || "Failed to delete the account.", "error");
          }
        } catch (error) {
          console.error("Error deleting account:", error);
          Swal.fire("Error!", "An error occurred while deleting the account.", "error");
        }
      }
    });
  };
  

  // Cấu hình cột DataGrid
  const columns = [
    { field: "accountName", headerName: "Name", flex: 1 },
    { field: "accountEmail", headerName: "Email", flex: 1 },
    { field: "accountPhoneNumber", headerName: "Phone", flex: 1 },
    { field: "roleId", headerName: "Role", flex: 0.5 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "10px" }}>
          {/* Nút chỉnh sửa dẫn tới trang chỉnh sửa */}
          <Link to={`/editprofile/${params.row.accountId}`}>
            <IconButton color="primary">
              <EditIcon />
            </IconButton>
          </Link>

          {/* Nút xem chi tiết dẫn tới trang xem chi tiết */}
          <Link to={`/profile/${params.row.accountId}`}>
            <IconButton color="custom">
              <VisibilityIcon />
            </IconButton>
          </Link>

          {/* Nút xóa */}
          <IconButton
            color="error"
            onClick={() =>
              handleDelete(params.row.accountId, params.row.accountName)
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
      {/* Sidebar */}
      <Sidebar ref={sidebarRef} />

      {/* Main Content */}
      <div className="content flex-1">
        <Navbar sidebarRef={sidebarRef} />

        {/* DataGrid Section */}
        <div className="p-4 bg-white shadow-md rounded-md">
          <h2 className="mb-4 text-xl font-bold">Account List</h2>
          <div style={{ height: 600, width: "80%" }}>
            <DataGrid
              rows={accounts.map((acc) => ({ ...acc, id: acc.accountId }))}
              columns={columns}
              pageSize={10} // Giới hạn số dòng mỗi trang
              rowsPerPageOptions={[10, 15, 20]} // Các tùy chọn chọn số dòng mỗi trang
              disableSelectionOnClick
              pagination
              paginationMode="client" // Điều này bật chế độ phân trang
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountList;
