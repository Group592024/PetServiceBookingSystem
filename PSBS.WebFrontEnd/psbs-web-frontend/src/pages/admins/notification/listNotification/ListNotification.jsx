import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import { getData } from "../../../../Utilities/ApiFunctions";
import { Chip } from "@mui/material";
import CreateNotificationModal from "../addNotiForm/addModal";
import DatatableNotification from "../../../../components/datatable/DatatableNotification";
const ListNotification = () => {
  const sidebarRef = useRef(null);
  const [rows, setRows] = useState([]);
  const basePath = "Notification/";
  const apiPath = "api/Notification";
  useEffect(() => {
    const fetchBookingStatuses = async () => {
      try {
        const data = await getData("api/Notification");
        const processedData = data.data.map((row, index) => ({
          ...row,
       
        }));
        setRows(processedData);
      } catch (error) {
        console.error("Error fetching Notification:", error);
      }
    };
    fetchBookingStatuses();
  }, []);

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
          row.notificationId === params.row.notificationId
        );
        return rowIndex + 1;
      }
    },
    {
      field: "notificationTitle",
      headerName: "Notification Title",
      headerAlign: "center",
      align: "center",
      width: 200,
    },
    {
      field: "notiTypeName",
      headerName: "Notification Type",
      headerAlign: "center",
      align: "center",
      width: 150,
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        // Assuming createdDate is a string or a Date object that can be formatted
        const formattedDate = new Date(params.value).toLocaleString(); // Example format, adjust as per your requirements
        return <span>{formattedDate}</span>;
      },
    },

    {
      field: "isPushed",
      headerName: "Is Pushed",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.value === true) {
          return <Chip label="Pushed" color="primary" />;
        } else {
          return <Chip label="Pending" color="warning" />;
        }
      },
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
  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <DatatableNotification
              rowId={"notificationId"}
              columns={columns}
              rows={rows}
              basePath={basePath}
              setRows={setRows}
              title="Notifications"
              apiPath={apiPath}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ListNotification;
