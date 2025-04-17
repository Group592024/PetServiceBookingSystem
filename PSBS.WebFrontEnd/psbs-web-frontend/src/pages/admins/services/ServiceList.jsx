import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Datatable from "../../../components/services/Datatable";
import { formatDateString } from "../../../Utilities/formatDate";

const ServiceList = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  const fetchDataFunction = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/Service?showAll=true",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        id: item.serviceId,
        ...item,
      }));

      setData(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        const fetchDelete = async () => {
          try {
            const token = sessionStorage.getItem("token");
            const deleteResponse = await fetch(
              `http://localhost:5050/api/Service/${id}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log(deleteResponse);

            if (deleteResponse.ok) {
              Swal.fire("Deleted!", "The service has been deleted.", "success");
              fetchDataFunction();
            } else if (deleteResponse.status == 409) {
              Swal.fire(
                "Error!",
                "Can not delete this service because it has service variant",
                "error"
              );
            } else {
              Swal.fire("Error!", "Failed to delete the service", "error");
            }
          } catch (error) {
            console.log(error);
            Swal.fire("Error!", "Failed to delete the service", "error");
          }
        };

        fetchDelete();
      }
    });
  };

  const newRows = data.map((row, index) => ({
    index: index + 1,
    serviceTypeName: row.serviceType.typeName,
    ...row,
  }));

  const columns = [
    {
      field: "index",
      headerName: "No.",
      flex: 0.5,
      // renderCell: (params) => <span>{params.rowIndex + 1}</span>,
    },
    { field: "serviceName", headerName: "Service Name", flex: 2 },
    { field: "serviceTypeName", headerName: "Service Type", flex: 1 },
    {
      field: "createAt",
      headerName: "Create Time",
      flex: 1.5,
      renderCell: (params) => (
        <span>{formatDateString(params.row.createAt)}</span>
      ),
    },
    {
      field: "isDeleted",
      headerName: "Status",
      flex: 0.5,
      renderCell: (params) => (
        <span>{params.row.isDeleted ? "Inactive" : "Active"}</span>
      ),
    },
  ];

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div class="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="header">
            <div className="left">
              <h1>Service List</h1>
            </div>
            <button className="report" onClick={() => navigate("/service/add")}>
              <i class="bx bxs-plus-circle"></i>
              <span>NEW</span>
            </button>
          </div>
          <Datatable
            columns={columns}
            data={newRows}
            pageSize={5}
            pageSizeOptions={[5, 10, 15]}
            onDelete={handleDelete}
            onView={(id) => navigate(`/service/${id}`)}
            onEdit={(id) => navigate(`/service/edit/${id}`)}
          />
        </main>
      </div>
    </div>
  );
};

export default ServiceList;
