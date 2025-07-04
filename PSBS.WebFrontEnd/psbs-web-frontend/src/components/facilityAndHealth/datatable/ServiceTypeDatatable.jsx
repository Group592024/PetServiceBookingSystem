import React, { useState } from "react";
import "./style.css";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import { deleteData, postData, updateData } from "../../../Utilities/ApiFunctions";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditableModal from "../editableModal/ServiceTypeEditableModal";
import InfoIcon from "@mui/icons-material/Info";
const Datatable = ({
  columns,
  rows,
  basePath,
  setRows,
  modelStructure,
  addModel,
  title,
  rowId
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const handleDetailOpen = (data) => {
    setSelectedData(data);
    setDetailModalOpen(true);
  };

  const handleDetailClose = () => {
    setDetailModalOpen(false);
    setSelectedData(null);
  };

  const handleEditOpen = (data) => {
    setSelectedData(data);
    setEditModalOpen(true);
  };
  const handleSubmit = async (data) => {
    console.log("Form Data:", data);
    // API call or other handling logic
    try {
      const response = await postData(`${basePath}`, data);
      if (response.flag) {
        Swal.fire({
          title: 'Success!',
          text: response.message,
          icon: 'success',
          confirmButtonText: 'OK'
        });
        setRows((prevRows) => [...prevRows, response.data]);
      }
      else {
        console.log("ua trong day ne poh hon");
        Swal.fire({
          title: 'Error!',
          text: response.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
    catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to submit data.");
    }

  };
  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedData(null);
  };
  const handleEditSubmit = async (data) => {
    document.getElementsByClassName('swal2-container')[0]?.style.setProperty('z-index', '2000', 'important');

    const result = await Swal.fire({
      title: 'Confirm Changes',
      text: 'This update may affect related data in the system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#9ca3af',
      backdrop: `rgba(0,0,0,0.7)`,
      allowOutsideClick: false,
      position: 'center'
    });

    if (result.isConfirmed) {
      try {
        const response = await updateData(`${basePath}`, data);
        if (response.flag) {
          Swal.fire({
            title: 'Success!',
            text: response.message,
            icon: 'success',
            confirmButtonText: 'OK'
          });

          setRows((prevRows) =>
            prevRows.map((row) =>
              row[rowId] === data[rowId] ? { ...row, ...response.data } : row
            )
          );
          handleEditClose();
        } else {
          Swal.fire({
            title: 'Error!',
            text: response.message,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        console.error("Error submitting data:", error);
        toast.error("Failed to submit data.");
      }
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Action
        </div>
      ),
      renderCell: (params) => {
        const handleDelete = async () => {
          document.getElementsByClassName('swal2-container')[0]?.style.setProperty('z-index', '2000', 'important');

          Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this item? This action may affect related data in the system.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
          }).then(async (result) => {
            if (result.isConfirmed) {
              try {
                const response = await deleteData(`${basePath}/${params.id}`);
                if (response.flag === true) {
                  Swal.fire({
                    title: 'Success!',
                    text: 'Item has been deleted successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                  });

                  if (response.data != null) {
                    setRows((prevRows) =>
                      prevRows.map((row) =>
                        row[rowId] === response.data[rowId] ? { ...row, ...response.data } : row
                      )
                    );
                  } else {
                    setRows((prevRows) =>
                      prevRows.filter((row) => row[rowId] !== params.id)
                    );
                  }
                } else {
                  Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete item.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                  });
                }
              } catch (error) {
                Swal.fire({
                  title: 'Error!',
                  text: 'An error occurred while deleting.',
                  icon: 'error',
                  confirmButtonText: 'OK'
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

  return (
    <div className="datatable">
      <EditableModal
        open={modalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        fields={addModel}
        title={title}
      />
      <EditableModal
        open={editModalOpen}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        fields={modelStructure}
        title={title}
        initialData={selectedData}
      />
      <EditableModal
        open={detailModalOpen}
        onClose={handleDetailClose}
        onSubmit={handleEditSubmit}
        fields={modelStructure}
        title={title}
        initialData={selectedData}
        view={true}
      />
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
      <ToastContainer />
    </div>
  );
};

export default Datatable;
