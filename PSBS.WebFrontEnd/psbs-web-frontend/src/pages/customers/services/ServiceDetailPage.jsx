import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import VariantCard from "../../admins/services/VariantCard";

const ServiceDetailPage = () => {
  const sidebarRef = useRef(null);

  const [detail, setDetail] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 200;
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
        ).then((response) => response.json());

        const newData = {
          ...response.data,
          serviceTypeName: response.data.serviceType.typeName,
        };

        setDetail(newData);
      } catch (error) {
        console.error("Failed fetching data: ", error);
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

      const result = response.data.map((item) => ({
        id: item.serviceVariantId,
        ...item,
      }));
      console.log(result);

      setDataVariant(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarCustomer />
      <div className="max-w-7xl mx-auto p-10">
        <div className="flex gap-14 items-start bg-white shadow-lg p-10 rounded-3xl">
          <div className="w-1/2 flex flex-col justify-center">
            <img
              className="rounded-3xl w-full h-[300px] object-cover shadow-md transition-transform 
             duration-300 hover:scale-105"
              src={imageURL}
              alt={detail.serviceName}
            />

            <div className="flex justify-center">
              <button
                className="mt-5 bg-customDanger px-6 py-3 w-2/3 rounded-full text-white text-xl font-semibold text-center 
                        hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Booking Now
              </button>
            </div>
          </div>

          <div className="w-1/2 space-y-6">
            <p className="text-4xl font-extrabold text-customDark">
              {detail.serviceName}
            </p>
            <p className="text-xl font-semibold text-customPrimary">
              Available service variants:
            </p>

            <div className="flex flex-wrap gap-3">
              {dataVariant.map((item) => (
                <VariantCard key={item.serviceVariantId} data={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 p-8 bg-customDarkGrey rounded-3xl shadow-lg">
          <p className="text-3xl font-bold text-white mb-5">
            Service Description
          </p>

          <div className="p-6 bg-customGrey rounded-3xl text-lg text-gray-800 shadow-md">
            <p>
              {isExpanded || description.length <= MAX_LENGTH
                ? description
                : `${description.slice(0, MAX_LENGTH)}...`}
            </p>

            {description.length > MAX_LENGTH && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-3 text-customPrimary font-semibold hover:underline transition-all duration-300"
              >
                {isExpanded ? "See Less ▲" : "See More ▼"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
