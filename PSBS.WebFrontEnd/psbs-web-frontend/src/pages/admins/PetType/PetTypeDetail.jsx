import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const PetTypeDetail = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [detail, setDetail] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5050/api/PetType/${id}`,
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
          throw new Error(data?.message || "Internal Server Error");
        }
        setDetail(data?.data || data);
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: error?.message || error,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/petType");
          }
        });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                Pet Type Detail
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-customPrimary to-customLightPrimary rounded-full"></div>
            </div>
            <button
              onClick={() => navigate("/petType")}
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
              Back to List
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
          ) : (
            <div className="mx-8 bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
              <div className="md:flex ">
                <div className="md:w-1/2 p-8">
                  <div className="mb-8">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
                      Pet Type
                    </span>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                      {detail?.petType_Name || "Unnamed Type"}
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
                        Name
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xl font-medium text-gray-800">
                          {detail?.petType_Name || "N/A"}
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
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Description
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[140px]">
                        <p className="text-gray-700 leading-relaxed">
                          {detail?.petType_Description ||
                            "No description available for this pet type."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-1/2 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                  <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-lg group">
                    <img
                      className="w-full h-80 object-cover object-center transition-transform duration-500 group-hover:scale-110"
                      src={
                        detail?.petType_Image
                          ? `http://localhost:5050/pet-service${detail?.petType_Image}`
                          : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fstock.adobe.com%2Fpt%2Fsearch%3Fk%3Dimage%2Bplaceholder&psig=AOvVaw3K3cKoUrrPwH8WrK0pAsXQ&ust=1744943972118000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIiVw4qF3owDFQAAAAAdAAAAABAQ"
                      }
                      alt={detail?.petType_Name}
                      // onError={(e) => {
                      //   e.target.src =
                      //     "https://www.google.com/url?sa=i&url=https%3A%2F%2Fstock.adobe.com%2Fpt%2Fsearch%3Fk%3Dimage%2Bplaceholder&psig=AOvVaw3K3cKoUrrPwH8WrK0pAsXQ&ust=1744943972118000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIiVw4qF3owDFQAAAAAdAAAAABAQ";
                      // }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 w-full text-white">
                        <h3 className="font-bold">{detail?.petType_Name}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100">
                <div className="flex justify-end items-center">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => navigate(`/petType/edit/${id}`)}
                      className="px-5 py-2.5 bg-gradient-to-r from-customPrimary to-customLightPrimary hover:from-customLightPrimary hover:to-customPrimary text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Edit Pet Type
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PetTypeDetail;
