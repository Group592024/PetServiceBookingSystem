import React, { useRef, useEffect, useState } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import Datatable from "../../../../components/facilityAndHealth/datatable/ServiceTypeDatatable";
import { getData } from "../../../../Utilities/ApiFunctions";
import Swal from 'sweetalert2';

const ServiceTypeList = () => {
  const sidebarRef = useRef(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const data = await getData("api/ServiceType");
        setRows(data.data);
      } catch (error) {
        Swal.fire('Service Unavailable', 'Our service is down. Please contact admin for more information.', 'error');
        console.error("Error fetching service types:", error);
      }
    };
    fetchServiceTypes();
  }, []);

  const model = [
    {
      name: "typeName",
      label: "Service Type Name",
      type: "string",
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
    {
      name: "createAt",
      label: "Created At",
      type: "string",
      disabled: true,

    },
    {
      name: "updateAt",
      label: "Updated At",
      type: "string",
      disabled: true,
    },
  ];

  const addModel = [
    {
      name: "typeName",
      label: "Service Type Name",
      type: "string",
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
      pass: true,
    },
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
      field: "typeName",
      headerName: "Service Type Name",
      width: 250,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Service Type Name
        </div>
      ),
    },
    {
      field: "createAt",
      headerName: "Created At",
      width: 180,
      headerAlign: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Created At
        </div>
      ),
      renderCell: (params) => {
        const date = new Date(params.value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return (
          <div style={{ textAlign: 'center' }}>
            {`${day}/${month}/${year}`}
          </div>
        );
      }
    },
    {
      field: "updateAt",
      headerName: "Updated At",
      width: 180,
      headerAlign: 'center',
      renderHeader: () => (
        <div style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Updated At
        </div>
      ),
      renderCell: (params) => {
        const date = new Date(params.value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return (
          <div style={{ textAlign: 'center' }}>
            {`${day}/${month}/${year}`}
          </div>
        );
      }
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
        <div style={{ textAlign: 'center', fontWeight: 'bold', color: params.value ? 'red' : 'green' }}>
          {params.value ? 'Inactive' : 'Active'}
        </div>
      ),
    },
  ];

  const basePath = "api/ServiceType";

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <Datatable
              rowId={"serviceTypeId"}
              columns={columns}
              rows={rows}
              basePath={basePath}
              setRows={setRows}
              modelStructure={model}
              title="Service Types"
              addModel={addModel}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServiceTypeList;
