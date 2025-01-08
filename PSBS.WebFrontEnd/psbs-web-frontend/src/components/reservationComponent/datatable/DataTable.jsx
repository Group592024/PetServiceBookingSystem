import React from "react";
import "./datatableUser.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { deleteRequest } from "../../Utilities/ApiCalls";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
const Datatable = ({ columns, rows, basePath, deletePath,setRows  }) => {
  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        const handleDelete = async () => {
          Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
          }).then(async (result) => {
            if (result.isConfirmed) {
              // Call the delete API using the deletePath and params.id
              await deleteRequest(`${deletePath}/${params.id}`, (response) => {
                if (response.flag === true) {
                  toast.success("Deleted successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                  
                  // Update the rows state to exclude the deleted user
                  setRows((prevRows) => prevRows.filter((row) => row.id !== params.id));
                } else {
                  toast.error("Failed to delete user.");
                }
              });
            }
          });
        };
  
        return (
          <div className="cellAction flex space-x-2">
          <Link to={`${basePath}/${params.id}`} style={{ textDecoration: "none" }}>
            <div className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 transition duration-300">
              View
            </div>
          </Link>
          <div
            className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition duration-300 cursor-pointer"
            onClick={handleDelete}
          >
            Delete
          </div>
        </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Add New User
        <Link to={`${basePath}/new`} style={{ textDecoration: "none" }} className="link">
          Add new user
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={rows}
        columns={columns.concat(actionColumn)}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
      
      />
    </div>
  );
};

export default Datatable;