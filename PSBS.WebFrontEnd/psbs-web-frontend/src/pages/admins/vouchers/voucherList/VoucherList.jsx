import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import Datatable from "../../../../components/datatable/Datatable";
import { getData } from "../../../../Utilities/ApiFunctions";

const VoucherList = () => {
  const sidebarRef = useRef(null);
  const [rows, setRows] = useState([]);
 
   useEffect(() => {
     const fetchBookingStatuses = async () => {
       try {
         const data = await getData("api/Voucher");
         setRows(data.data);
       } catch (error) {
         console.error("Error fetching voucher:", error);
       }
     };
     fetchBookingStatuses();
   }, []);
 

  // Temporary data
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "voucherName",
      headerName: "Voucher Name",
      width: 250,
    },
    {
      field: "voucherCode",
      headerName: "Voucher Code",
      width: 200,
    },
    {
      field: "voucherQuantity",
      headerName: "Voucher Quantity",
      width: 200,
    },
   
    { field: "isGift", headerName: "Voucher Type", width: 120 },
    { field: "isDeleted", headerName: "Status", width: 120 }
  ];
 
  const basePath = "/vouchers/";
  const apiPath = "api/Voucher";
  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <Datatable
              rowId={"voucherId"}
              columns={columns}
              rows={rows}
              basePath={basePath}
              setRows={setRows}            
              title="Voucher"
              apiPath={apiPath}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VoucherList;
