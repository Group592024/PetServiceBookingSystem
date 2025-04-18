import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import VariantCard from "../../admins/services/VariantCard";
import Swal from "sweetalert2";

const ServiceDetailPage = () => {
  const sidebarRef = useRef(null);

  const [detail, setDetail] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllVariants, setShowAllVariants] = useState(false);
  const MAX_LENGTH = 200;
  const MAX_VARIANTS_DISPLAY = 4;
  const [dataVariant, setDataVariant] = useState([]);
  const [idVariant, setIdVariant] = useState("");

  const [openDetail, setOpenDetail] = React.useState(false);
  const handleOpenDetail = (id) => {
    setOpenDetail(true);
    setIdVariant(id);
  };
  const handleCloseDetail = () => setOpenDetail(false);
  const description = detail?.serviceDescription || "";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5050/api/Service/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Internal Server Error");
        }

        const newData = {
          ...data.data,
          serviceTypeName: data.data.serviceType.typeName,
        };

        setDetail(newData);
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Service not found" || error,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/customer/services");
          }
        });
      }
    };
    if (id) {
      fetchDetail();
      fetchDataFunction();
    }
  }, [id]);

  const imageURL = `http://localhost:5023${detail.serviceImage}`;

  //api variant
  const fetchDataFunction = async () => {
    try {
      console.log("id: ", id);
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        `http://localhost:5050/api/ServiceVariant/service/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();
      if (!fetchData.ok) {
        throw new Error(response?.message || "Internal Server Error");
      }
      const result = response.data.map((item) => ({
        id: item.serviceVariantId,
        ...item,
      }));
      console.log(result);

      setDataVariant(result);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Variant not found" || error,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/customer/services");
        }
      });
    }
  };

  // Display variants based on count
  const displayVariants = showAllVariants
    ? dataVariant
    : dataVariant.slice(0, MAX_VARIANTS_DISPLAY);

  const hasMoreVariants = dataVariant.length > MAX_VARIANTS_DISPLAY;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <NavbarCustomer />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-5 flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                Services
              </span>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {detail.serviceName}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Left side - Image and Booking Button */}
            <div className="md:w-2/5 p-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-customPrimary to-customDanger rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative">
                  <img
                    className="w-full h-[350px] object-cover rounded-xl shadow-md"
                    src={imageURL}
                    alt={detail.serviceName}
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => navigate("/customer/bookings/new")}
                  className="w-full bg-gradient-to-r from-customDanger to-red-600 text-white py-4 px-6 rounded-xl 
                  font-bold text-lg shadow-lg hover:shadow-xl transform transition duration-300 hover:-translate-y-1 
                  flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Book Now
                </button>
              </div>

              {detail.serviceTypeName && (
                <div className="mt-6 flex items-center">
                  <span className="bg-customPrimary/10 text-customPrimary px-3 py-1 rounded-full text-sm font-medium">
                    {detail.serviceTypeName}
                  </span>
                </div>
              )}
            </div>

            {/* Right side - Service Details */}
            <div className="md:w-3/5 p-6 md:p-8 bg-white">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4 leading-tight">
                {detail.serviceName}
              </h1>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-customPrimary mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v11a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm11 14a1 1 0 01-1 1H5a1 1 0 01-1-1V7h12v9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Available Service Variants
                  {dataVariant.length > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-700 text-sm py-1 px-2 rounded-full">
                      {dataVariant.length}
                    </span>
                  )}
                </h2>

                {dataVariant.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-500 italic">
                      No variants available for this service
                    </p>
                  </div>
                ) : dataVariant.length <= 2 ? (
                  // For 1-2 variants, display them in a single column with larger cards
                  <div className="space-y-4">
                    {dataVariant.map((item) => (
                      <div
                        key={item.serviceVariantId}
                        className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm 
                                hover:shadow-md hover:border-customPrimary transition-all duration-300"
                      >
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                          {item.serviceContent}
                        </h3>
                        <p className="text-customDanger font-bold text-2xl">
                          {item.servicePrice.toLocaleString()} VND
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  // For 3+ variants, use a responsive grid
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {displayVariants.map((item) => (
                        <VariantCard key={item.serviceVariantId} data={item} />
                      ))}
                    </div>

                    {/* Show more/less button for many variants */}
                    {hasMoreVariants && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setShowAllVariants(!showAllVariants)}
                          className="inline-flex items-center px-4 py-2 bg-customPrimary/10 text-customPrimary rounded-full
                                    hover:bg-customPrimary/20 transition-colors duration-300 text-sm font-medium"
                        >
                          {showAllVariants ? (
                            <>
                              Show Less
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </>
                          ) : (
                            <>
                              Show All {dataVariant.length} Variants
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-customDarkGrey to-gray-700 py-4 px-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Service Description
            </h2>
          </div>

          <div className="p-6">
            <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
              <p className="text-gray-700 leading-relaxed">
                {isExpanded || description.length <= MAX_LENGTH
                  ? description
                  : `${description.slice(0, MAX_LENGTH)}...`}
              </p>

              {description.length > MAX_LENGTH && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-4 inline-flex items-center text-customPrimary font-semibold hover:text-customDanger transition-colors duration-300"
                >
                  {isExpanded ? (
                    <>
                      See Less
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      See More
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
