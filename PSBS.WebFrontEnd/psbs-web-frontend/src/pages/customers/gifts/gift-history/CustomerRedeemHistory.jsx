import React, { useEffect, useState } from "react";
import axios from "axios";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";
import { DataGrid } from "@mui/x-data-grid";
import { 
  Box, 
  CircularProgress, 
  Button, 
  Chip, 
  Typography, 
  Paper, 
  Container,
  Card,
  CardContent,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
} from "@mui/material";
import Swal from "sweetalert2";
import HistoryIcon from '@mui/icons-material/History';
import CancelIcon from '@mui/icons-material/Cancel';

const CustomerRedeemHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const accountId = sessionStorage.getItem("accountId");
  const token = sessionStorage.getItem("token");
  const theme = useTheme();
  
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/redeemhistory/${accountId}`, config
        );
        if (response.data.flag) {
          const formattedData = await Promise.all(
            response.data.data.map(async (item) => {
              const giftResponse = await axios.get(
                `http://localhost:5050/Gifts/detail/${item.giftId}`, config
              );
              return {
                id: item.redeemHistoryId,
                ...item,
                gift: giftResponse.data.data,
              };
            })
          );
          setHistory(formattedData);
        }
      } catch (error) {
        console.log("Error fetching history:", error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to load redemption history!',
          confirmButtonColor: '#1976d2',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [accountId]);

  const handleCancelRedeem = (redeemHistoryId, point) => {
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
        try {
          const responseCancel = await axios.put(
            `http://localhost:5050/api/Account/refundPoint?accountId=${accountId}`,
            {
              giftId: redeemHistoryId,
              requiredPoints: point,
            }, config
          );
          if (responseCancel.data.flag) {
            Swal.fire({
              title: "Cancelled!",
              text: "Your redemption has been cancelled.",
              icon: "success",
              confirmButtonColor: '#1976d2',
            });
          }
          // Refresh the history after cancellation
          const response = await axios.get(
            `http://localhost:5050/redeemhistory/${accountId}`, config
          );
          if (response.data.flag) {
            const formattedData = await Promise.all(
              response.data.data.map(async (item) => {
                const giftResponse = await axios.get(
                  `http://localhost:5050/Gifts/detail/${item.giftId}`, config
                );
                return {
                  id: item.redeemHistoryId,
                  ...item,
                  gift: giftResponse.data.data,
                };
              })
            );
            setHistory(formattedData);
          }
        } catch (error) {
          console.error("Error cancelling redeem:", error);
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
      renderHeader: () => (
        <Typography variant="subtitle2" fontWeight="bold">No.</Typography>
      ),
      renderCell: (params) => {
        const index = history.findIndex((row) => row.id === params.row.id);
        return <Typography variant="body2">{index + 1}</Typography>;
      },
    },
    {
      field: "giftName",
      headerName: "Gift Name",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <Typography variant="subtitle2" fontWeight="bold">Gift Name</Typography>
      ),
      renderCell: (params) => (
        <Typography variant="body2">{params.row.gift?.giftName || "N/A"}</Typography>
      ),
    },
    {
      field: "giftCode",
      headerName: "Gift Code",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <Typography variant="subtitle2" fontWeight="bold">Gift Code</Typography>
      ),
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>
          {params.row.gift?.giftCode || "N/A"}
        </Typography>
      ),
    },
    {
      field: "redeemPoint",
      headerName: "Gift Point",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <Typography variant="subtitle2" fontWeight="bold">Gift Point</Typography>
      ),
      renderCell: (params) => (
        <Chip 
          label={params.row.redeemPoint} 
          size="small" 
          sx={{ 
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.dark,
            fontWeight: 'bold'
          }}
        />
      ),
    },
    {
      field: "redeemDate",
      headerName: "Redeem Date",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <Typography variant="subtitle2" fontWeight="bold">Redeem Date</Typography>
      ),
      renderCell: (params) => {
        const date = new Date(params.row.redeemDate + "Z");
        return (
          <Typography variant="body2">
            {date.toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        );
      },
    },
    {
      field: "redeemStatusId",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center", 
      renderHeader: () => (
        <Typography variant="subtitle2" fontWeight="bold">Status</Typography>
      ),
      renderCell: (params) => {
        const status = statusMapping[params.row.redeemStatusId] || {
          label: "Unknown",
          color: "default",
        };
  
        return (
          <Chip 
            size="small" 
            color={status.color} 
            label={status.label}
            sx={{ 
              fontWeight: 'medium',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }} 
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <Typography variant="subtitle2" fontWeight="bold" >Actions</Typography>
      ),
      renderCell: (params) => {
        // Only show cancel button for redeemed items that haven't been picked up or cancelled
        const isRedeemed = params.row.redeemStatusId === "1509e4e6-e1ec-42a4-9301-05131dd498e4";
        
        return isRedeemed ? (
          <Tooltip title="Cancel redemption">
            <IconButton
              color="error"
              size="small"
              onClick={() =>
                handleCancelRedeem(
                  params.row.redeemHistoryId,
                  params.row.redeemPoint
                )
              }
              sx={{ 
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                }
              }}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.secondary">No actions</Typography>
        );
      },
    },
  ];

  return (
    <div style={{ backgroundColor: '#f5f8fb', minHeight: '100vh' }}>
      <NavbarCustomer />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card 
          elevation={3} 
          sx={{ 
            borderRadius: '16px', 
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.1)
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <HistoryIcon 
                sx={{ 
                  fontSize: 32, 
                  color: theme.palette.primary.main, 
                  mr: 2 
                }} 
              />
              <Typography 
                variant="h5" 
                component="h1" 
                fontWeight="bold"
                color="primary.dark"
              >
                Your Redemption History
              </Typography>
            </Box>
            
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: '12px', 
                overflow: 'hidden',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1)
              }}
            >
              <Box sx={{ height: 500, width: "100%" }}>
                {loading ? (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: '100%' 
                    }}
                  >
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <DataGrid
                    columns={columns}
                    rows={history}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                      },
                      sorting: {
                        sortModel: [{ field: 'redeemDate', sort: 'desc' }],
                      },
                    }}
                    pageSizeOptions={[5, 10, 20]}
                    disableRowSelectionOnClick
                    sx={{
                      border: 'none',
                      '& .MuiDataGrid-columnHeaders': {
                       backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        color: theme.palette.primary.dark,
                      },
                      '& .MuiDataGrid-cell': {
                        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                      '& .MuiDataGrid-cellContent': {
                        width: '100%',
                        textAlign: 'center',
                      },
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                      '& .MuiDataGrid-row.Mui-selected': {
                        backgroundColor: `${alpha(theme.palette.primary.main, 0.1)} !important`,
                      },
                      '& .MuiDataGrid-footerContainer': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                      '& .MuiTablePagination-root': {
                        color: theme.palette.primary.dark,
                      },
                      '& .MuiButtonBase-root.MuiIconButton-root': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                )}
              </Box>
            </Paper>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default CustomerRedeemHistory;
