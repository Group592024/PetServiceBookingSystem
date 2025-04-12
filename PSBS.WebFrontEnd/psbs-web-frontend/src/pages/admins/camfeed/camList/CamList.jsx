import React, { useRef, useState, useEffect } from "react";
import Sidebar from '../../../../components/sidebar/Sidebar'
import Navbar from '../../../../components/navbar/Navbar'
import { getData } from "../../../../Utilities/ApiFunctions";
import { Chip } from "@mui/material";
import DatatableCamera from '../../../../components/datatable/DatatableCamera'

const CamList = () => {
  const sidebarRef = useRef(null);
  const [rows, setRows] = useState([]);
  const basePath = "Camera/";
  const apiPath = "api/Camera";

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const data = await getData("api/Camera");
        const processedData = data.data.map((row, index) => ({
          ...row,
        }));
        setRows(processedData);
      } catch (error) {
        console.error("Error fetching Cameras:", error);
      }
    };
    fetchCameras();
  }, []);

  const columns = [
    {
      field: "serialNumber",
      headerName: "No.",
      headerAlign: "center",
      align: "center",
      width: 50,
      renderCell: (params) => {
        const rowIndex = rows.findIndex(row => 
          row.cameraId === params.row.cameraId
        );
        return rowIndex + 1;
      }
    },
    {
      field: "cameraCode",
      headerName: "Camera Code",
      headerAlign: "center",
      align: "center",
      width: 150,
    },
    {
      field: "cameraType",
      headerName: "Camera Type",
      headerAlign: "center",
      align: "center",
      width: 150,
    },
    {
      field: "cameraAddress",
      headerName: "Address",
      headerAlign: "center",
      align: "center",
      width: 200,
    },
    {
      field: "cameraStatus",
      headerName: "Status",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const statusMap = {
          'InUse': { label: 'In Use', color: 'primary' },
          'Free': { label: 'Free', color: 'info' },
          'Discard': { label: 'Discarded', color: 'default' },
          'UnderRepair': { label: 'Under Repair', color: 'warning' }
        };
        
        const status = statusMap[params.value] || { label: params.value, color: 'secondary' };
        return <Chip label={status.label} color={status.color} />;
      },
    },
    {
      field: "isDeleted",
      headerName: "Active",
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

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <DatatableCamera
              rowId={"cameraId"}
              columns={columns}
              rows={rows}
              basePath={basePath}
              setRows={setRows}
              title="Camera"
              apiPath={apiPath}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default CamList