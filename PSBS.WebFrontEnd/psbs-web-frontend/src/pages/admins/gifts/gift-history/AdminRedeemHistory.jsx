import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  CircularProgress,
  Button,
  Modal,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  
} from "@mui/material";
import Swal from "sweetalert2";
import DatatableNoAction from "../../../../components/datatable/DatatableNoAction";
import EditIcon from "@mui/icons-material/Edit";
const AdminRedeemHistory = () => {
  const [allHistory, setAllHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sidebarRef = useRef(null);
  const [redeemStatuses, setRedeemStatuses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRedeemId, setSelectedRedeemId] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedRedeemStatusId, setSelectedRedeemStatusId] = useState(null);
  const basePath = "/vouchers/";
  const apiPath = "api/Voucher";
  const fetchAllHistory = async () => {
    try {
      setIsLoading(true);
  
      const token = sessionStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
  
      const response = await axios.get(
        "http://localhost:5050/redeemhistory/All",
        config
      );
  
      if (response.data.flag) {
        const historyWithDetails = await Promise.all(
          response.data.data.map(async (item) => {
            try {
              const [accountResponse, giftResponse] = await Promise.all([
                axios.get(
                  `http://localhost:5050/api/Account?AccountId=${item.accountId}`,
                  config
                ),
                axios.get(`http://localhost:5050/Gifts/${item.giftId}`, config),
              ]);
  
              return {
                id: item.redeemHistoryId,
                ...item,
                accountName: accountResponse.data.accountName || "N/A",
                giftName: giftResponse.data.data.giftName || "N/A",
                redeemStatusName: item.redeemStatusName || "N/A",
              };
            } catch (error) {
              return {
                id: item.redeemHistoryId,
                ...item,
                accountName: "Unable to load",
                giftName: "Unable to load",
                redeemStatusName: "Unable to load",
              };
            }
          })
        );
        setAllHistory(historyWithDetails);
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to load redemption history",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchRedeemStatuses = async () => {
    const token = sessionStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(
        "http://localhost:5050/redeemhistory/statuses", config
      );
      setRedeemStatuses(response.data.data);
    } catch (error) {
      console.error("Failed to fetch redeem statuses:", error);
    }
  };

  useEffect(() => {
    fetchAllHistory();
    fetchRedeemStatuses();
  }, []);

  const handleOpenModal = (redeem) => {
    console.log("Redeem ID:", redeem);
    setSelectedAccountId(redeem.accountId);
    setSelectedRedeemId(redeem.id);
    setSelectedPoint(redeem.redeemPoint);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleCancelRedeem = (redeemHistoryId, point) => {
    const token = sessionStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1976d2",
      cancelButtonColor: "#d32f2f",
      confirmButtonText: "Yes, cancel it!",
      background: '#ffffff',
      customClass: {
        title: 'swal-title',
        content: 'swal-text'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Show loading state
        Swal.fire({
          title: 'Processing...',
          html: 'Please wait while we cancel your redemption.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        try {
          const responseCancel = await axios.put(
            `http://localhost:5050/api/Account/refundPoint?accountId=${selectedAccountId}`,
            {
              giftId: redeemHistoryId,
              requiredPoints: point,
            }, 
            config
          );
          
          if (responseCancel.data.flag) {
            // Close loading and show success
            Swal.fire({
              title: "Cancelled!",
              text: "Your redemption has been cancelled.",
              icon: "success",
              confirmButtonColor: '#1976d2',
            });
            
            // Refresh the history after cancellation
            const response = await axios.get(
              `http://localhost:5050/redeemhistory/${selectedAccountId}`, 
              config
            );
            
            if (response.data.flag) {
              const formattedData = await Promise.all(
                response.data.data.map(async (item) => {
                  const giftResponse = await axios.get(
                    `http://localhost:5050/Gifts/detail/${item.giftId}`, 
                    config
                  );
                  return {
                    id: item.redeemHistoryId,
                    ...item,
                    gift: giftResponse.data.data,
                  };
                })
              );
              
              setModalOpen(false);
              fetchAllHistory();
            }
          } else {
            // Show error if the flag is false
            Swal.fire({
              title: "Error!",
              text: responseCancel.data.message || "Failed to cancel redemption.",
              icon: "error",
              confirmButtonColor: '#1976d2',
            });
          }
        } catch (error) {
          console.error("Error cancelling redeem:", error);
          // Show error alert
          Swal.fire({
            title: "Error!",
            text: "Failed to cancel redemption.",
            icon: "error",
            confirmButtonColor: '#1976d2',
          });
        }
      }
    });
  };
  
  
  const handleUpdateStatus = async () => {
    const token = sessionStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    console.log("Selected Redeem ID:", selectedRedeemId);
   if(selectedRedeemStatusId === "6a565faf-d31e-4ec7-ad20-433f34e3d7a9"){
    handleCancelRedeem(selectedRedeemId, selectedPoint);
   } else{
    try {
      const response = await axios.put(
        `http://localhost:5050/redeemhistory/${selectedRedeemId}/status/${selectedRedeemStatusId}`,  {}, 
        config
      );
      if (response.data.flag) {
        Swal.fire("Success", response.data.message, "success");
        setModalOpen(false);
        fetchAllHistory();
      } else {
        Swal.fire("Error", response.data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update status", "error");
    }
   }
  };

  const statusMapping = {
    "1509e4e6-e1ec-42a4-9301-05131dd498e4": {
      label: "Redeemed",
      color: "warning", // Yellow
    },
    "33b84495-c2a6-4b3e-98ca-f13d9c150946": {
      label: "Picked up",
      color: "success", // Green
    },
    "6a565faf-d31e-4ec7-ad20-433f34e3d7a9": {
      label: "Cancelled",
      color: "error", // Red
    },
  };
  
  const columns = [
    {
      field: "index",
      headerName: "No.",
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const index = allHistory.findIndex((row) => row.id === params.row.id);
        return <div>{index + 1}</div>;
      },
    },
    {
      field: "accountName",
      headerName: "Customer Name",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "giftName",
      headerName: "Gift Name",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "redeemPoint",
      headerName: "Points Used",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "redeemDate",
      headerName: "Redeem Date",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const date = new Date(params.row.redeemDate + "Z");
        return date.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      field: "redeemStatusId",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const status = statusMapping[params.row.redeemStatusId] || {
          label: "Unknown",
          color: "default",
        };
  
        return <Chip variant="outlined" size="small" color={status.color} label={status.label} />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      
         renderCell: (params) => {
              // Only show cancel button for redeemed items that haven't been picked up or cancelled
              const isRedeemed = params.row.redeemStatusId === "1509e4e6-e1ec-42a4-9301-05131dd498e4";
              
              return isRedeemed ? (
                <IconButton aria-label="edit" onClick={() => handleOpenModal(params.row)}>
                <EditIcon color="success" />
              </IconButton>
              ) : (
                <Typography variant="body2" color="text.secondary">No actions</Typography>
              );
            },
    },
  ];

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <DatatableNoAction
         
              rowId={"redeemHistoryId"}
              columns={columns}
              rows={allHistory}
              basePath={basePath}
              setRows={setAllHistory}
              title="Gift Redemption History"
              apiPath={apiPath}
            />
          </div>
        </main>
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Update Redeem Status
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-select-label">Select Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={selectedRedeemStatusId || ""}
              label="Select Status"
              onChange={(e) => setSelectedRedeemStatusId(e.target.value)}
            >
              {redeemStatuses.map((status) => (
                <MenuItem
                  key={status.reddeemStautsId}
                  value={status.reddeemStautsId}
                >
                  {status.redeemName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={handleCloseModal} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              variant="contained"
              color="primary"
            >
              Update
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default AdminRedeemHistory;
