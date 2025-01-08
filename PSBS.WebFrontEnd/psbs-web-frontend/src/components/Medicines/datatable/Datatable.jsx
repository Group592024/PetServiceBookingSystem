import "./datatable.css";
import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";

const columns = [
  {
    field: "id",
    headerName: "ID",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "medicineName",
    headerName: "Name",
    flex: 3,
    editable: false,
    headerAlign: "center",
    renderCell: (params) => {
      return (
        <div className="cellWithTable">
          <img
            className="cellImg"
            src={params.row.medicineImg}
            alt="medicine"
          ></img>
          {params.row.medicineName}
        </div>
      );
    },
  },
  {
    field: "treatmentId",
    headerName: "Treatment",
    flex: 2,
    headerAlign: "center",
    align: "center",
    editable: false,
  },
  {
    field: "isDeleted",
    headerName: "Active",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      const isDeleted = params.row.isDeleted === "True";
      return (
        <div
          style={{
            color: isDeleted ? "red" : "green",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {isDeleted ? "Stopping" : "Active"}
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
    flex: 2,
    renderCell: (params) => {
      return (
        <div
          className="cellAction"
          class="flex justify-around items-center w-full h-full"
        >
          <Link
            to={`#`}
            className="detailBtn"
            style={{ textDecoration: "none" }}
          >
            <svg
              className="w-6 h-6 text-gray-800 dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </Link>
          <Link to={`#`} className="editBtn" style={{ textDecoration: "none" }}>
            <svg
              className="w-6 h-6 text-gray-800 dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
              />
            </svg>
          </Link>
          <div className="deleteBtn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M7.5 1h9v3H22v2h-2.029l-.5 17H4.529l-.5-17H2V4h5.5V1Zm2 3h5V3h-5v1ZM6.03 6l.441 15h11.058l.441-15H6.03ZM13 8v11h-2V8h2Z"
              />
            </svg>
          </div>
        </div>
      );
    },
  },
];

const rows = [
  {
    id: 1,
    medicineName: "Vaxigen 3",
    treatmentId: "Vaccine",
    medicineImg:
      "https://gamelandvn.com/wp-content/uploads/anh/2021/07/t1-thay-doi-hlv-thumbnail.png",
    isDeleted: "True",
  },
  {
    id: 2,
    medicineName: "FluShield",
    treatmentId: "Vaccine",
    medicineImg:
      "https://gamelandvn.com/wp-content/uploads/anh/2021/07/t1-thay-doi-hlv-thumbnail.png",
    isDeleted: "False",
  },
  {
    id: 3,
    medicineName: "Parazitol",
    treatmentId: "Deworming",
    medicineImg:
      "https://gamelandvn.com/wp-content/uploads/anh/2021/07/t1-thay-doi-hlv-thumbnail.png",
    isDeleted: "False",
  },
];
const Datatable = () => {
  return (
    <div className="Datatable">
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns.concat(actionColumn)}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  );
};

export default Datatable;
