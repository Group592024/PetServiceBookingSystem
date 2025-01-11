import React, { useRef, useEffect, useState } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import Datatable from "../../../../components/reservationComponent/datatable/DataTable";
import { getData } from "../../../../Utilities/ApiFunctions";

const PaymentTypeList = () => {
  const sidebarRef = useRef(null);
 const [rows, setRows] = useState([]);

 useEffect(() => {
    const fetchBookingStatuses = async () => {
      try {
        const data = await getData("api/PaymentType");
        setRows(data.data);
      } catch (error) {
        console.error("Error fetching booking types:", error);
      }
    };
    fetchBookingStatuses();
  }, []);



  const model = [
    {
      name: "paymentTypeId",
      label: "ID",
      type: "string",
      disabled: true,
    
    },
    { name: "paymentTypeName", label: "Name", type: "string" },
    { name: "isDeleted", label: "Status", type: "bool" },
  ];
  const addModel = [
    { name: "paymentTypeName", label: "Payment Type Name", type: "string" },
    { name: "isDeleted", label: "Status", type: "bool", pass:true },
  ];

  // Temporary data
  const columns = [
    { field: "paymentTypeId", headerName: "ID", width: 300 },
    { field: "paymentTypeName", headerName: "Payment Type Name", width: 250 },
    { field: "isDeleted", headerName: "Status", width: 120 },
  ];

  const basePath = "api/PaymentType";
  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <Datatable
             rowId={"paymentTypeId"}
              columns={columns}
              rows={rows}
              basePath={basePath}
              setRows={setRows}
              modelStructure={model}
              title="Payment Type"
              addModel={addModel}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentTypeList;
