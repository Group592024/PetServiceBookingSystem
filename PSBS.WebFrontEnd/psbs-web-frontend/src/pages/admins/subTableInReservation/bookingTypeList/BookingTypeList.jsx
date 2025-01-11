import React, { useRef, useEffect, useState } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import Datatable from "../../../../components/reservationComponent/datatable/DataTable";
import { getData } from "../../../../Utilities/ApiFunctions";

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
    { field: "bookingTypeId", headerName: "ID", width: 300 },
    { field: "bookingTypeName", headerName: "Booking Type Name", width: 250 },
    { field: "isDeleted", headerName: "Status", width: 120 },
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
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookingTypeList;
