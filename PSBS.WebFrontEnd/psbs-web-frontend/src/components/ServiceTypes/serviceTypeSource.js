import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";


const BASE_URL = 'http://localhost:5023/api/ServiceType';

const Datatable = ({ serviceTypes, onDetail, onEdit, onDelete }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(
      serviceTypes.map((item, index) => ({
        id: index + 1,
        serviceTypeId: item.serviceTypeId,
        typeName: item.typeName,
        description: item.description,
        createAt: new Date(item.createAt).toLocaleDateString('vi-VN'), 
        updateAt: new Date(item.updateAt).toLocaleDateString('vi-VN'),
        isDeleted: item.isDeleted,
      }))
    );
  }, [serviceTypes]);

  const columns = [
    { field: "id", headerName: "ID", flex: 1, headerAlign: "center", align: "center", width: 100 },
    { field: "typeName", headerName: "Service Type Name", flex: 1, headerAlign: "center", align: "center", width: 300 },
    { field: "description", headerName: "Description", flex: 1, headerAlign: "center", align: "center", width: 300 },
    { field: "createAt", headerName: "Created At", flex: 1, headerAlign: "center", align: "center", width: 100 },
    { field: "updateAt", headerName: "Updated At", flex: 1, headerAlign: "center", align: "center", width: 100 },
    {
      field: "isDeleted",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isDeleted = params.row.isDeleted;
        return (
          <div
            style={{
              color: isDeleted ? "red" : "green",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {isDeleted ? "Inactive" : "Active"}
          </div>
        );
      },
    },
  ];

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      headerAlign: "center",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction flex justify-around items-center w-full h-full">
            {/* Detail Button */}
            <button
              className="detailBtn"
              onClick={() => onDetail(params.row.serviceTypeId)}
            >
              <svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </button>

            {/* Edit Button */}
            <button
              className="editBtn"
              onClick={() => onEdit(params.row.serviceTypeId)}
            >
              <svg className="w-6 h-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              className="deleteBtn"
              onClick={() => onDelete(params.row.serviceTypeId)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="text-red-500">
                <path fill="currentColor" d="M7.5 1h9v3H22v2h-2.029l-.5 17H4.529l-.5-17H2V4h5.5 V1h-3v2h-5v-2h3V1Zm2 3h5V3h-5v1ZM6.03 6l.441 15h11.058l.441-15H6.03ZM13 8v11h-2V8h2Z" />
              </svg>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="Datatable">
      <Box
        sx={{
          height: 400,
          width: "100%",
          "& .MuiDataGrid-root": {
            backgroundColor: "#f9f9f9",
          },
          "& .MuiDataGrid-row": {
            backgroundColor: "#f4f4f4",
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: "#c8f6e9 !important",
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#9f9f9f",
          },
          "& .MuiPaginationItem-root": {
            backgroundColor: "#b3f2ed",
            color: "#3f3f3f",
          },
          "& .MuiPaginationItem-root:hover": {
            backgroundColor: "#ede4e2",
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns.concat(actionColumn)}
          pageSize={5}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  );
};

export default Datatable;
