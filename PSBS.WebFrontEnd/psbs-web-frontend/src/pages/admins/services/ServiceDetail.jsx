import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Swal from "sweetalert2";
import Datatable from "../../../components/services/Datatable";
import UpdateVariantModal from "../../../components/services/UpdateVariantModal";
import VariantDetailModal from "../../../components/services/VariantDetailModal";
import AddVariantModal from "../../../components/services/AddVariantModal";
import formatCurrency from "../../../Utilities/formatCurrency";
import jwtDecode from "jwt-decode";

const ServiceDetail = () => {
  const sidebarRef = useRef(null);
  const [detail, setDetail] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  let isAdmin = false;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const role =
        decodedToken.role ||
        decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if (role && role.toLowerCase() === "admin") {
        isAdmin = true;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  const [dataVariant, setDataVariant] = useState([]);
  const [idVariant, setIdVariant] = useState("");

  const [openUpdate, setOpenUpdate] = React.useState(false);
  const handleOpenUpdate = (id) => {
    setOpenUpdate(true);
    setIdVariant(id);
  };
  const handleCloseUpdate = () => setOpenUpdate(false);

  const [openDetail, setOpenDetail] = React.useState(false);
  const handleOpenDetail = (id) => {
    setOpenDetail(true);
    setIdVariant(id);
  };
  const handleCloseDetail = () => setOpenDetail(false);

  const [openAdd, setOpenAdd] = React.useState(false);
  const handleOpenAdd = () => {
    setOpenAdd(true);
  };
  const handleCloseAdd = () => setOpenAdd(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5050/api/Service/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Service not found" || "Internal Server Error");
      }
      const newData = {
        ...data.data,
        serviceTypeName: data.data.serviceType.typeName,
      };

      setDetail(newData);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error?.message || error,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/service");
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    if (id) {
      fetchDetail();
      fetchDataFunction();
    }
  }, [id, navigate]);

  const imageURL = `http://localhost:5023${detail.serviceImage}`;

  //api variant
  const fetchDataFunction = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        `http://localhost:5050/api/ServiceVariant/service/${id}`,
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
        id: item.serviceVariantId,
        ...item,
      }));

      setDataVariant(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const fetchDelete = async (isLastVariant = false, idVariant) => {
    try {
      const token = sessionStorage.getItem("token");
      const deleteResponse = await fetch(
        `http://localhost:5050/api/ServiceVariant/${idVariant}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (deleteResponse.ok) {
        Swal.fire(
          "Deleted!",
          "The service variant has been deleted.",
          "success"
        );
        if (isLastVariant) {
          setDataVariant([]);
          fetchDetail();
        }
        await fetchDataFunction();
      } else if (deleteResponse.status === 409) {
        Swal.fire(
          "Error!",
          "Can not delete this service variant because it is in at least one booking.",
          "error"
        );
      } else {
        Swal.fire(
          "Error!",
          "Failed to delete the service variant",
          "error"
        );
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        "Failed to delete the service variant",
        "error"
      );
    }
  };

  const handleDelete = (idVariant) => {
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
        if (dataVariant.length === 1 && dataVariant[0].isDeleted === true) {
          Swal.fire({
            title: "Are you sure?",
            text: "If you delete the last service variant, this service will be deleted too.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "OK",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6"

          }).then((result) => {
            if (result.isConfirmed) {
              const fetchDeleteService = async () => {
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
                } catch (error) {
                  console.log(error);
                  Swal.fire("Error!", "Failed to delete the service", "error");
                }
              };
              fetchDelete(true, idVariant);
              fetchDeleteService();
            }
          });

          return;
        }
        fetchDelete(false, idVariant);
      }
    });
  };


  const columns = [
    {
      field: "index",
      headerName: "No.",
      flex: 0.5,
    },
    { field: "serviceContent", headerName: "Service Content", flex: 2 },
    {
      field: "servicePrice",
      headerName: "Service Price",
      flex: 1,
      renderCell: (params) => (
        <span>{formatCurrency(params.row.servicePrice)}</span>
      ),
    },
    {
      field: "isDeleted",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${params.row.isDeleted
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-green-800"
            }`}
        >
          {params.row.isDeleted ? "Inactive" : "Active"}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                Service Detail
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-customPrimary to-customLightPrimary rounded-full"></div>
            </div>
            <button
              onClick={() => navigate("/service")}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-indigo-700 rounded-xl shadow-sm border border-indigo-100 transition-all duration-200 flex items-center group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Services
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl mb-8">
                <div className="md:flex">
                  <div className="md:w-1/2 p-8">
                    <div className="mb-6">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
                        Service Information
                      </span>
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {detail.serviceName}
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-gray-700 font-semibold mb-3 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-indigo-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Service Type
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-xl font-medium text-gray-800">
                            {detail.serviceTypeName}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-gray-700 font-semibold mb-3 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-indigo-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Status
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${detail.isDeleted
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                              }`}
                          >
                            {detail.isDeleted ? "Inactive" : "Active"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-gray-700 font-semibold mb-3 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-indigo-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Description
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[140px]">
                          <p className="text-gray-700 leading-relaxed">
                            {detail.serviceDescription ||
                              "No description available."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-1/2 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-8">
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-lg group">
                      <img
                        className="w-full h-80 object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        src={imageURL}
                        alt={detail.serviceName}
                        onError={(e) => {
                          e.target.src = "/default-image.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-4 w-full text-white">
                          <h3 className="font-bold">{detail.serviceName}</h3>
                          <p className="text-sm opacity-90">
                            {detail.serviceTypeName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div className="flex justify-center mb-8">
                {isAdmin && (
                  <button
                    onClick={handleOpenAdd}
                    className="px-6 py-3 bg-gradient-to-r from-customPrimary to-customLightPrimary hover:from-customLightPrimary hover:to-customPrimary text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add New Variant
                  </button>
                )}
              </div>


              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <Accordion
                  sx={{
                    boxShadow: "none",
                    "&:before": {
                      display: "none",
                    },
                  }}
                  defaultExpanded
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "#4f46e5" }} />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    sx={{
                      backgroundColor: "#f5f7ff",
                      borderBottom: "1px solid #e5edff",
                      "& .MuiAccordionSummary-content": {
                        margin: "12px 0",
                      },
                    }}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-2 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Service Variants
                      </h3>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails sx={{ padding: "24px" }}>
                    {dataVariant.length > 0 ? (
                      <Datatable
                        columns={columns}
                        data={dataVariant}
                        isAdmin={isAdmin}
                        pageSize={5}
                        pageSizeOptions={[5, 10, 15]}
                        onDelete={handleDelete}
                        onEdit={handleOpenUpdate}
                        onView={handleOpenDetail}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 mx-auto text-gray-300 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-gray-500 text-lg">
                          No variants found for this service
                        </p>
                        {isAdmin && (
                          <button
                            onClick={handleOpenAdd}
                            className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                          >
                            Add your first variant
                          </button>
                        )}
                      </div>
                    )}
                  </AccordionDetails>
                </Accordion>
              </div>
            </>
          )}

          {openDetail && (
            <VariantDetailModal
              id={idVariant}
              open={openDetail}
              handleClose={handleCloseDetail}
            />
          )}

          {openUpdate && (
            <UpdateVariantModal
              id={idVariant}
              open={openUpdate}
              handleClose={handleCloseUpdate}
              onSuccess={fetchDataFunction}
            />
          )}

          {openAdd && (
            <AddVariantModal
              id={id}
              open={openAdd}
              handleClose={handleCloseAdd}
              onSuccess={fetchDataFunction}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default ServiceDetail;
