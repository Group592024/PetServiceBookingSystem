import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import Datatable from "../../../../components/reservationComponent/datatable/DataTable";
import { getData } from "../../../../Utilities/ApiFunctions";
import { Chip } from "@mui/material";
const BookingStatusList = () => {
  const sidebarRef = useRef(null);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchBookingStatuses = async () => {
      try {
        const data = await getData("api/BookingStatus");
        setRows(data.data);
      } catch (error) {
        console.error("Error fetching booking statuses:", error);
      }
    };
    fetchBookingStatuses();
  }, []);

  const model = [
    {
      name: "bookingStatusId",
      label: "ID",
      type: "string",
      disabled: true,
    },
    { name: "bookingStatusName", label: "Booking Status Name", type: "string" },
    { name: "isDeleted", label: "Status", type: "bool" },
  ];
  const addModel = [
    { name: "bookingStatusName", label: "Booking Status Name", type: "string" },
    { name: "isDeleted", label: "Status", type: "bool", pass: true },
  ];

  // Temporary data
  const columns = [
    {
      field: "serialNumber",
      headerName: "No.",
      headerAlign: "center",
      align: "center",
      width: 50,
      renderCell: (params) => {
        // Find the index of the current row in the rows array
        const rowIndex = rows.findIndex(row => 
          row.bookingStatusId === params.row.bookingStatusId
        );
        return rowIndex + 1;
      }
    },
    {
      field: "bookingStatusName",
      headerName: "Booking Status Name",
      width: 250,
    },
    {
      field: "isDeleted",
      headerName: "Status",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.value === false) {
          return <Chip label="Active" color="success" />;
        } else {
          return <Chip label="Inactive" color="error" />;
        }
      },
    },
  ];

  const basePath = "api/BookingStatus";
  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <Datatable
            rowId={"bookingStatusId"}
              columns={columns}
              rows={rows}
              addModel={addModel}
             basePath={basePath}
              setRows={setRows}
              modelStructure={model}
              title="Booking Status"
              hideActions={true}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookingStatusList;
