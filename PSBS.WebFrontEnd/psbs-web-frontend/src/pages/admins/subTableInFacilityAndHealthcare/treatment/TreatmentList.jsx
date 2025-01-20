import React, { useRef, useEffect, useState } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import Datatable from "../../../../components/facilityAndHealth/datatable/DataTable";
import { getData } from "../../../../Utilities/ApiFunctions";

const TreatmentList = () => {
  const sidebarRef = useRef(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const data = await getData("api/Treatment");
        setRows(data.data);
      } catch (error) {
        console.error("Error fetching treatments:", error);
      }
    };
    fetchTreatments();
  }, []);

  const model = [
    { name: "treatmentName", label: "Name", type: "string" },
    { name: "isDeleted", label: "Status", type: "bool" },
  ];
  const addModel = [
    { name: "treatmentName", label: "Treatment Name", type: "string" },
    { name: "isDeleted", label: "Status", type: "bool", pass: true },
  ];

  const columns = [
    {
      field: "index",
      headerName: "No.",
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          No.
        </div>
      ),
      renderCell: (params) => (
        <div style={{ textAlign: 'center' }}>
          {rows.indexOf(params.row) + 1}
        </div>
      ),
    },
    {
      field: "treatmentName",
      headerName: "Treatment Name",
      width: 450,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Treatment Name
        </div>
      ),
    },
    {
      field: "isDeleted",
      headerName: "Status",
      width: 300,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Status
        </div>
      ),
      renderCell: (params) => (
        <div style={{ textAlign: 'center', fontWeight: 'bold', color: params.value ? 'red' : 'green' }}>
          {params.value ? 'Stopping' : 'Active'}
        </div>
      ),
    },
  ];

  const basePath = "api/Treatment";

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <Datatable
              rowId={"treatmentId"}
              columns={columns}
              rows={rows}
              basePath={basePath}
              setRows={setRows}
              modelStructure={model}
              title="Treatment"
              addModel={addModel}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TreatmentList;
