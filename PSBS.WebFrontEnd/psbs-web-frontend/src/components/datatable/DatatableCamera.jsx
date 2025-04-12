import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InfoIcon from "@mui/icons-material/Info";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import "./style.css";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import { deleteData, postData, updateData } from "../../Utilities/ApiFunctions";
import { useState } from "react";
import CameraDetailModal from "../../pages/admins/camfeed/camDetail/CamDetail";
import UpdateCameraModal from "../../pages/admins/camfeed/camEdit/CamEdit";
import CreateCameraModal from "../../pages/admins/camfeed/camAdd/CamAdd";
import CameraModal from "../../pages/admins/camfeed/videoFeed/VideoFeed";
import VisibilityIcon from '@mui/icons-material/Visibility';
const DatatableCamera = ({
  columns,
  rows,
  apiPath,
  setRows,
  title,
  rowId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setEditIsModalOpen] = useState(false);
  const [isPushModalOpen, setPushModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const handleCreateNotification = async (values) => {
    console.log("Notification to update:", values);
 
    try {
      const response = await postData(`${apiPath}`, values);
      if (response.flag) {
        Swal.fire({
          title: "Success!",
          text: response.message,
          icon: "success",
          confirmButtonText: "OK",
        });
        setRows((prevRows) => [response.data, ...prevRows]);
        return true;
      } else {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to submit data.");
      throw error;
    }
  };

  const handleUpdateNotification = async (values) => {
    console.log("Notification to update:", values);
  
    try {
      const response = await updateData(`${apiPath}/`+values.cameraId, values);
      if (response.flag) {
        Swal.fire({
          title: "Success!",
          text: response.message,
          icon: "success",
          confirmButtonText: "OK",
        });
        setRows((prevRows) =>
          prevRows.map((row) =>
            row[rowId] === values[rowId] ? { ...row, ...response.data } : row
          )
        );
        return response; 
      } else {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "error",
          confirmButtonText: "OK",
        });
        return response; 
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to submit data.");
      throw error;
    }
  };
  const handlePushNotification = async (values) => {
    console.log("push to update:", values);
    try {
      const response = await postData(`${apiPath}/push`, values);
      if (response.flag) {
        Swal.fire({
          title: "Success!",
          text: response.message,
          icon: "success",
          confirmButtonText: "OK",
        });
        setRows((prevRows) =>
          prevRows.map((row) =>
            row[rowId] === values[rowId] ? { ...row, ...response.data } : row
          )
        );
      } else {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
      return true;
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to submit data.");
      throw error;
    }
  };
  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      headerAlign: "center",
      align: "center",
      width: 250,
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
                  toast.success("Deleted successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
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
                  toast.error("Failed to delete the camera.");
                }
              } catch (error) {
                toast.error("An error occurred while deleting.");
              }
            }
          });
        };
        return (
          <div className="cellAction flex space-x-2">
            <IconButton
              aria-label="info"
              onClick={() => handleDetailOpen(params.row)}
              title="Detail"
            >
              <InfoIcon color="info" />
            </IconButton>
            <IconButton
               disabled = {params.row.cameraStatus === "InUse" ? true : false}
              aria-label="edit"
              onClick={() => handleEditOpen(params.row)}
              title="Edit"
            >
              <EditIcon color={params.row.cameraStatus === "InUse" ? "default" : "success"} />
            </IconButton>
            <IconButton
               disabled = {params.row.cameraStatus === "InUse" ? true : false}
              aria-label="delete"
              onClick={handleDelete}
              title="Delete"
            >
              <DeleteIcon  color={params.row.cameraStatus === "InUse" ? "default" : "error"} />
            </IconButton>
        
              <IconButton
           
                aria-label="push"
                onClick={() => handlePush(params.row.cameraId)}
                title="Video"
              >
                <VisibilityIcon color="warning" />
              </IconButton>
          
          </div>
        );
      },
    },
  ];

  const handleOpen = () => {
    setIsModalOpen(true);
  };
  const handleEditOpen = (row) => {
    setSelectedData(row);
    setEditIsModalOpen(true);
  };
  const handlePush = (row) => {
    setSelectedData(row);
    console.log("row", row);
    console.log("daya", selectedData);
    setPushModalOpen(true);
  };
  const handleDetailOpen = (row) => {
    setSelectedData(row);
    setIsDetailModalOpen(true);
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
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 15, 20]}
      />
      <ToastContainer />
      <CreateCameraModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateNotification}
      />
      <UpdateCameraModal
        open={isEditModalOpen}
        onClose={() => setEditIsModalOpen(false)}
        onUpdate={handleUpdateNotification}
        initialCamera={selectedData}
      />
      <CameraDetailModal
       open={isDetailModalOpen}
       onClose={() => setIsDetailModalOpen(false)}
       camera={selectedData} 
      />
     <CameraModal cameraId={selectedData} onClose={() => setPushModalOpen(false)} open={isPushModalOpen} />
    </div>
  );
};

export default DatatableCamera;
