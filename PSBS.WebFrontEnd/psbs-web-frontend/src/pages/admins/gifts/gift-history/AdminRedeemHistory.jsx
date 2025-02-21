import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../../../../components/sidebar/Sidebar';
import Navbar from '../../../../components/navbar/Navbar';
import { DataGrid } from '@mui/x-data-grid';
import { Box, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';

const AdminRedeemHistory = () => {
  const [allHistory, setAllHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sidebarRef = useRef(null);

  const fetchAllHistory = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5050/redeemhistory/All');
      if (response.data.flag) {
        const historyWithDetails = await Promise.all(
          response.data.data.map(async (item) => {
            try {
              const [accountResponse, giftResponse] = await Promise.all([
                axios.get(`http://localhost:5050/api/Account?AccountId=${item.accountId}`),
                axios.get(`http://localhost:5050/Gifts/${item.giftId}`)
              ]);
              
              return {
                id: item.redeemHistoryId,
                ...item,
                accountName: accountResponse.data.accountName || 'N/A',
                giftName: giftResponse.data.data.giftName || 'N/A'
              };
            } catch (error) {
              return {
                id: item.redeemHistoryId,
                ...item,
                accountName: 'Unable to load',
                giftName: 'Unable to load'
              };
            }
          })
        );
        setAllHistory(historyWithDetails);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to load redemption history',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllHistory();
  }, []);

  const columns = [
    {
      field: 'index',
      headerName: 'No.',
      flex: 0.5,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          No.
        </div>
      ),
      renderCell: (params) => {
        const index = allHistory.findIndex(row => row.id === params.row.id);
        return <div>{index + 1}</div>;
      }
    },
    {
      field: 'accountName',
      headerName: 'Customer Name',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Account Name
        </div>
      )
    },
    {
      field: 'giftName',
      headerName: 'Gift Name',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Gift Name
        </div>
      )
    },
    {
      field: 'redeemPoint',
      headerName: 'Points Used',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Points Used
        </div>
      )
    },
    {
      field: 'redeemDate',
      headerName: 'Redeem Date',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Redeem Date
        </div>
      ),
      renderCell: (params) => {
        const date = new Date(params.row.redeemDate + 'Z');
        return date.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  ];

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className='content'>
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className='header'>
            <div className='left'>
              <h1>Gift Redemption History</h1>
            </div>
          </div>
          <Box sx={{
            height: 400,
            width: "100%",
            "& .MuiDataGrid-root": { backgroundColor: "#f9f9f9" },
            "& .MuiDataGrid-row": { backgroundColor: "#f4f4f4" },
            "& .MuiDataGrid-row.Mui-selected": { backgroundColor: "#c8f6e9 !important" },
            "& .MuiDataGrid-footerContainer": { backgroundColor: "#9f9f9f" },
            "& .MuiPaginationItem-root": {
              backgroundColor: "#b3f2ed",
              color: "#3f3f3f"
            },
            "& .MuiPaginationItem-root:hover": { backgroundColor: "#ede4e2" }
          }}>
            {isLoading ? (
              <div style={{ textAlign: 'center' }}>
                <CircularProgress />
              </div>
            ) : (
              <DataGrid
                columns={columns}
                rows={allHistory}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 }
                  }
                }}
                pageSizeOptions={[5, 10, 20]}
              />
            )}
          </Box>
        </main>
      </div>
    </div>
  );
};

export default AdminRedeemHistory;
