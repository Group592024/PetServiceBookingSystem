import React, { useRef, useEffect, useState } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import Datatable from "../../../../components/facilityAndHealth/datatable/RoomTypeDatatable";
import { getData } from "../../../../Utilities/ApiFunctions";
import Swal from 'sweetalert2';

const RoomTypeList = () => {
  const sidebarRef = useRef(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const data = await getData("api/RoomType"); // API endpoint for RoomType data
        setRows(data.data);
      } catch (error) {
        Swal.fire('Service Unavailable', 'Our service is down. Please contact admin for more information.', 'error');
        console.error("Error fetching room types:", error);
      }
    };
    fetchRoomTypes();
  }, []);

  const model = [
    {
      name: "name",
      label: "Room Type Name",
      type: "string",
      customValidation: (value) => {
        if (!value || value.trim() === "") {
          return "Room type name is required";
        }
        return null;
      },
    },
    {
      name: "price",
      label: "Price ",
      type: "decimal",
      customValidation: (value) => {
        if (!/^\d+(\.\d+)?$/.test(value)) {
          return "Price must be a valid number";
        }
        if (parseFloat(value) <= 0) {
          return "Price must be greater than 0";
        }
        return null;
      },

    },
    {
      name: "description",
      label: "Description",
      type: "string",
    },
    {
      name: "isDeleted",
      label: "Status",
      type: "bool",
    },
  ];

  const addModel = [
    {
      name: "name",
      label: "Room Type Name",
      type: "string",
      customValidation: (value) => {
        if (!value || value.trim() === "") {
          return "Room type name is required";
        }
        return null;
      },
    },
    {
      name: "price",
      label: "Price",
      type: "decimal",
      customValidation: (value) => {
        if (!/^\d+(\.\d+)?$/.test(value)) {
          return "Price must be a valid number";
        }
        if (parseFloat(value) <= 0) {
          return "Price must be greater than 0";
        }
        return null;
      },
    },
    {
      name: "description",
      label: "Description",
      type: "string",
    },
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
      field: "name",
      headerName: " Name",
      width: 200,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Name
        </div>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Description
        </div>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 200,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Price
        </div>
      ),
    },
    {
      field: "isDeleted",
      headerName: "Status",
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Status
        </div>
      ),
      renderCell: (params) => (
        <div style={{ textAlign: "center", color: params.value ? "red" : "green" }}>
          {params.value ? "Inactive" : "Active"}
        </div>
      ),
    },
  ];

  const basePath = "api/RoomType";

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <Datatable
              rowId={"roomTypeId"}
              columns={columns}
              rows={rows}
              basePath={basePath}
              setRows={setRows}
              modelStructure={model}
              title="Room Types"
              addModel={addModel}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RoomTypeList;
