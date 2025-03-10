import React, { useEffect, useState } from "react";
import axios from "axios";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";
import { DataGrid } from "@mui/x-data-grid";
import { Box, CircularProgress, Button } from "@mui/material";
import Swal from "sweetalert2";

const CustomerRedeemHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const accountId = sessionStorage.getItem("accountId");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/redeemhistory/${accountId}`
        );
        if (response.data.flag) {
          const formattedData = await Promise.all(
            response.data.data.map(async (item) => {
              const giftResponse = await axios.get(
                `http://localhost:5050/Gifts/detail/${item.giftId}`
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
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const responseCancel = await axios.put(
            `http://localhost:5050/api/Account/refundPoint?accountId=${accountId}`,
            {
              giftId: redeemHistoryId,
              requiredPoints: point,
            }
          );
          if (responseCancel.data.flag) {
            Swal.fire(
              "Cancelled!",
              "Your redemption has been cancelled.",
              "success"
            );
          }
          // Refresh the history after cancellation
          const response = await axios.get(
            `http://localhost:5050/redeemhistory/${accountId}`
          );
          if (response.data.flag) {
            const formattedData = await Promise.all(
              response.data.data.map(async (item) => {
                const giftResponse = await axios.get(
                  `http://localhost:5050/Gifts/detail/${item.giftId}`
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
          Swal.fire("Error!", "Failed to cancel redemption.", "error");
        }
      }
    });
  };

  const columns = [
    {
      field: "index",
      headerName: "No.",
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <div style={{ fontWeight: "bold", textAlign: "center" }}>No.</div>
      ),
      renderCell: (params) => {
        const index = history.findIndex((row) => row.id === params.row.id);
        return <div>{index + 1}</div>;
      },
    },
    {
      field: "giftName",
      headerName: "Gift Name",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <div style={{ fontWeight: "bold", textAlign: "center" }}>Gift Name</div>
      ),
      renderCell: (params) => params.row.gift?.giftName || "N/A",
    },
    {
      field: "giftCode",
      headerName: "Gift Code",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <div style={{ fontWeight: "bold", textAlign: "center" }}>Gift Code</div>
      ),
      renderCell: (params) => params.row.gift?.giftCode || "N/A",
    },
    {
      field: "redeemPoint",
      headerName: "Gift Point",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <div style={{ fontWeight: "bold", textAlign: "center" }}>
          Gift Point
        </div>
      ),
    },
    {
      field: "redeemDate",
      headerName: "Redeem Date",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <div style={{ fontWeight: "bold", textAlign: "center" }}>
          Redeem Date
        </div>
      ),
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
      field: "redeemStatusName",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <div style={{ fontWeight: "bold", textAlign: "center" }}>Status</div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <div style={{ fontWeight: "bold", textAlign: "center" }}>Actions</div>
      ),
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() =>
            handleCancelRedeem(
              params.row.redeemHistoryId,
              params.row.redeemPoint
            )
          }
        >
          Cancel
        </Button>
      ),
    },
  ];

  return (
    <div>
      <NavbarCustomer />
      <div className="p-6">
        <div className="header">
          <div className="left">
            <h2 className="text-2xl font-bold mb-4">Your Redemption History</h2>
          </div>
        </div>
        <Box
          sx={{
            height: 400,
            width: "100%",
            "& .MuiDataGrid-root": { backgroundColor: "#f9f9f9" },
            "& .MuiDataGrid-row": { backgroundColor: "#f4f4f4" },
            "& .MuiDataGrid-row.Mui-selected": {
              backgroundColor: "#c8f6e9 !important",
            },
            "& .MuiDataGrid-footerContainer": { backgroundColor: "#9f9f9f" },
            "& .MuiPaginationItem-root": {
              backgroundColor: "#b3f2ed",
              color: "#3f3f3f",
            },
            "& .MuiPaginationItem-root:hover": { backgroundColor: "#ede4e2" },
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center" }}>
              <CircularProgress />
            </div>
          ) : (
            <DataGrid
              columns={columns}
              rows={history}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10, 20]}
            />
          )}
        </Box>
      </div>
    </div>
  );
};

export default CustomerRedeemHistory;
