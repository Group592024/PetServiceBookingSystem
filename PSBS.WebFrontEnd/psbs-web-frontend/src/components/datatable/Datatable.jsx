import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InfoIcon from "@mui/icons-material/Info";
import "./style.css";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import { deleteData } from "../../Utilities/ApiFunctions";
import { useNavigate } from "react-router-dom";
const Datatable = ({
  columns,
  rows,
  apiPath,
  basePath,
  setRows,
  title,
  rowId,
}) => {
  const navigate = useNavigate();
  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      headerAlign: "center",
      align: "center",
      width: 200,
      renderCell: (params) => {
        const handleDelete = async () => {
          Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
          }).then(async (result) => {
            if (result.isConfirmed) {
              try {
                // Call the deleteData API with the appropriate path
                const response = await deleteData(`${apiPath}/${params.id}`);

                if (response.flag === true) {
                  Swal.fire({
                    title: "Deleted!",
                    text: response.message,
                    icon: "success",
                    confirmButtonText: "OK",
                    timer: 3000,  // Auto close after 3 seconds
                    timerProgressBar: true
                  });
                  if (response.data != null) {
                    setRows((prevRows) =>
                      prevRows.map((row) =>
                        row[rowId] === response.data[rowId]
                          ? { ...row, ...response.data }
                          : row
                      )
                    );
                    console.log("row id torng khi xoa nay", rowId);
                  } else {
                    // Update the rows state to exclude the deleted user
                    setRows((prevRows) =>
                      prevRows.filter((row) => row[rowId] !== params.id)
                    );
                  }
                } else {
                  Swal.fire({
                    title: "Error!",
                    text: response.message,
                    icon: "error",
                    confirmButtonText: "OK"
                  });
                }
              } catch (error) {
                Swal.fire({
                  title: "Error!",
                  text: "An error occurred while deleting.",
                  icon: "error",
                  confirmButtonText: "OK"
                });
              }
            }
          });
        };

        return (
          <div className="cellAction flex space-x-2">
            <IconButton
              aria-label="info"
              onClick={() => handleDetailOpen(params.row)}
            >
              <InfoIcon color="info" />
            </IconButton>
            <IconButton
              aria-label="edit"
              onClick={() => handleEditOpen(params.row)}
            >
              <EditIcon color="success" />
            </IconButton>
            <IconButton aria-label="delete" onClick={handleDelete}>
              <DeleteIcon color="error" />
            </IconButton>
          </div>
        );
      },
    },
  ];

  const handleOpen = () => {
    navigate(`${basePath}new`);
  };
  const handleEditOpen = (row) => {
    navigate(`${basePath}update/${row[rowId]}`, { state: { rowData: row } });
  };
  const handleDetailOpen = (row) => {
    navigate(`${basePath}detail/${row[rowId]}`, { state: { rowData: row } });
  };
  return (
    <div className="datatable">
      <div className="datatableTitle">
        {title} List
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleOpen}
        >
          NEW
        </Button>
      </div>
      <DataGrid
        className="datagrid"
        getRowId={(row) => row[rowId]}
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
