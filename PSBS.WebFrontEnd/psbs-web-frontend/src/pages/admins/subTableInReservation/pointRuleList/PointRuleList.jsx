import React, { useRef, useEffect, useState } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import Datatable from "../../../../components/reservationComponent/datatable/DataTable";
import { getData } from "../../../../Utilities/ApiFunctions";

const PointRuleList = () => {
  const sidebarRef = useRef(null);
const [rows, setRows] = useState([]);

 useEffect(() => {
    const fetchBookingStatuses = async () => {
      try {
        const data = await getData("api/PointRule");
        setRows(data.data);
      } catch (error) {
        console.error("Error fetching booking types:", error);
      }
    };
    fetchBookingStatuses();
  }, []);

  // const exampleFields = [
  //   {
  //     name: "age",
  //     label: "Age",
  //     type: "integer",
  //     customValidation: (value) => {
  //       if (!/^-?\d+$/.test(value)) {
  //         return "Age must be a valid integer";
  //       }
  //       if (parseInt(value) < 0) {
  //         return "Age must not be negative";
  //       }
  //       return null;
  //     },
  //   },
  // ];
  const model = [
    {
      name: "pointRuleId",
      label: "ID",
      type: "string",
      disabled: true,
    },
    {
      name: "pointRuleRatio",
      label: "Point Rule Ratio",
      type: "integer",
      customValidation: (value) => {
        if (!/^-?\d+$/.test(value)) {
          return "This must be a valid integer";
        }
        if (parseInt(value) < 0) {
          return "This must not be negative";
        }
        return null;
      },
    },
    { name: "isDeleted", label: "Status", type: "bool" },
  ];
  const addModel = [
   
    {
      name: "pointRuleRatio",
      label: "Point Rule Ratio",
      type: "integer",
      customValidation: (value) => {
        if (!/^-?\d+$/.test(value)) {
          return "This must be a valid integer";
        }
        if (parseInt(value) < 0) {
          return "This must not be negative";
        }
        return null;
      },
    },
    { name: "isDeleted", label: "Status", type: "bool", pass: true },
  ];

  // Temporary data
  const columns = [
    { field: "pointRuleId", headerName: "ID", width: 300 },
    { field: "pointRuleRatio", headerName: "Point Rule Ratio", width: 250 },
    { field: "isDeleted", headerName: "Status", width: 120 },
  ];

 
  const basePath = "api/PointRule"; // Define the base path for routing (adjust based on your needs)

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <Datatable
               rowId={"pointRuleId"}
              columns={columns}
              rows={rows}
              basePath={basePath}            
              setRows={setRows}
              modelStructure={model}
              title="Point Rule"
              addModel={addModel}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PointRuleList;
