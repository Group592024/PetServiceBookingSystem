import React, { useRef, useEffect, useState } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import Datatable from "../../../../components/reservationComponent/datatable/DataTable";
import { getData } from "../../../../Utilities/ApiFunctions";
import { Chip } from "@mui/material";
const BookingTypeList = () => {
  const sidebarRef = useRef(null);
 const [rows, setRows] = useState([]);

 useEffect(() => {
    const fetchBookingStatuses = async () => {
      try {
        const data = await getData("api/BookingType");
        setRows(data.data);
      } catch (error) {
        console.error("Error fetching booking types:", error);
      }
    };
    fetchBookingStatuses();
  }, []);



  const model = [
    {
      name: "bookingTypeId",
      label: "ID",
      type: "string",
      disabled: true,
    
    },
    { name: "bookingTypeName", label: "Name", type: "string" },
    { name: "isDeleted", label: "Status", type: "bool" },
  ];
  const addModel = [
    { name: "bookingTypeName", label: "Booking Type Name", type: "string" },
    { name: "isDeleted", label: "Status", type: "bool", pass:true },
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
          row.bookingTypeId === params.row.bookingTypeId
        );
        return rowIndex + 1;
      }
    },
    { field: "bookingTypeName", headerName: "Booking Type Name", width: 250 },
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

  const basePath = "api/BookingType";
  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <Datatable
             rowId={"bookingTypeId"}
              columns={columns}
              rows={rows}
              basePath={basePath}
              setRows={setRows}
              modelStructure={model}
              title="Booking Type"
              addModel={addModel}
              hideActions={true}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookingTypeList;
