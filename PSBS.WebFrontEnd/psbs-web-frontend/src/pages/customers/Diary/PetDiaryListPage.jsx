import React, { useEffect, useRef, useState } from "react";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import SampleImage from "../../../assets/sampleUploadImage.jpg";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PetDiaryCardList from "../../../components/Diary/PetDiaryCardList";
import AddDiaryModal from "../../../components/Diary/AddDiaryModal";
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { formatDateString } from "../../../Utilities/formatDate";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useParams } from "react-router-dom";
import jwtDecode from "jwt-decode";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";

const PetDiaryListPage = () => {
  const sidebarRef = useRef(null);
  const { petId } = useParams();
  const petInfo = JSON.parse(localStorage.getItem("petInfo"));
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [petDiary, setPetDiary] = useState({ data: [], meta: null });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);

  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchPetDiary = async (petId, selectedCategory, pageIndex) => {
    try {
      console.log("category ne troi: " + selectedCategory);
      console.log("pageindex ne troi: " + pageIndex);
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5050/api/PetDiary/diaries/${petId}?category=${selectedCategory}&pageIndex=${pageIndex}&pageSize=4`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) return;
      }

      const data = await response.json();

      if (data.flag) {
        console.log(data?.data);
        setPetDiary(data?.data);
      }

      if (!data.flag) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `${data.message}`,
        });
      }
    } catch {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Service Unavailable",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(
        decoded?.role ||
        decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ]
      );
    }
  }, []);

  useEffect(() => {
    fetchPetDiary(petId, selectedCategory, pageIndex);
  }, [petId, selectedCategory, pageIndex]);

  // Pagination handler
  const handleClickNext = () => {
    if (pageIndex >= petDiary?.meta?.totalPages) return;
    setPageIndex((prev) => prev + 1);
  };

  const handleClickPrevious = () => {
    if (pageIndex <= 1) return;
    setPageIndex((prev) => prev - 1);
  };

  // Add Pet Modal Processing
  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    fetchPetDiary(petId, selectedCategory, 1);
    setSelectedCategory("All");
  };

  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        `http://localhost:5050/api/PetDiary/categories/${petId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const listCategories = response.data.data;
      console.log(listCategories);
      setCategories(listCategories);

      //return listCategories;
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [selectedCategory, petDiary]);

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {userRole === "user" ? (
        <NavbarCustomer />
      ) : (<div><Sidebar ref={sidebarRef} />
        <div className="content"><Navbar sidebarRef={sidebarRef} /></div></div>)}

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar */}
          <div className="w-full md:w-1/3 space-y-6">
            {/* Pet profile card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-customPrimary/10 to-customPrimary/20 p-6">
                <div className="relative mx-auto w-48 h-48 mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-customPrimary to-customDanger rounded-full blur-md opacity-20"></div>
                  <img
                    src={
                      petInfo
                        ? `http://localhost:5010${petInfo.petImage}`
                        : SampleImage
                    }
                    alt={petInfo?.petName || "Pet"}
                    className="relative rounded-full w-full h-full object-cover border-4 border-white shadow-md"
                  />
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-800">
                  {petInfo?.petName || "My Pet"}
                </h2>
                <p className="text-center text-gray-600 mt-1">
                  {petInfo && formatDateString(petInfo.petDoB)}
                </p>
              </div>

              {userRole === "user" && (
                <div className="p-4 flex justify-center">
                  <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-customDark text-white py-3 px-6 rounded-xl
                           hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    <AddCircleOutlineIcon />
                    <span className="font-medium">Create New Post</span>
                  </button>
                </div>
              )}
            </div>

            {/* Categories card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-customDarkGrey to-gray-700 py-3 px-5">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Filter by Topic
                </h3>
              </div>

              <div className="p-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-customPrimary scrollbar-track-gray-100">
                <div className="space-y-2">
                  <div
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between
                      ${selectedCategory === "All"
                        ? "bg-customPrimary text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    onClick={() => setSelectedCategory("All")}
                  >
                    <span className="font-medium">View all posts</span>
                    {selectedCategory === "All" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  {categories.map((category) => (
                    <div
                      key={category}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between
                        ${selectedCategory === category
                          ? "bg-customPrimary text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <span className="font-medium">{category}</span>
                      {selectedCategory === category && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="w-full md:w-2/3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <CircularProgress
                  size={60}
                  thickness={4}
                  className="text-customPrimary"
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-customPrimary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                    {selectedCategory === "All"
                      ? "All Diary Entries"
                      : `${selectedCategory} Entries`}
                  </h2>
                </div>

                {petDiary?.data?.length > 0 ? (
                  <>
                    <div className="space-y-6">
                      <PetDiaryCardList
                        data={petDiary?.data}
                        role={userRole}
                        getCategories={fetchCategories}
                      />
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex justify-center">
                      <div className="inline-flex rounded-md shadow-sm">
                        <button
                          onClick={handleClickPrevious}
                          disabled={pageIndex <= 1}
                          className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-l-lg
                            ${pageIndex <= 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                        >
                          <ArrowBackIosIcon
                            fontSize="small"
                            className="h-4 w-4 mr-1"
                          />
                          Previous
                        </button>

                        <div className="flex items-center justify-center px-4 py-2 text-sm font-medium bg-customPrimary text-white border border-customPrimary">
                          {pageIndex} of {petDiary?.meta?.totalPages || 1}
                        </div>

                        <button
                          onClick={handleClickNext}
                          disabled={pageIndex >= petDiary?.meta?.totalPages}
                          className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-r-lg
                            ${pageIndex >= petDiary?.meta?.totalPages
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                        >
                          Next
                          <ArrowForwardIosIcon
                            fontSize="small"
                            className="h-4 w-4 ml-1"
                          />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-300 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No diary entries found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {selectedCategory === "All"
                        ? "Start creating your pet's diary by adding your first entry!"
                        : `No entries found in the "${selectedCategory}" category.`}
                    </p>
                    <button
                      onClick={() => setAddModalOpen(true)}
                      className="flex items-center justify-center gap-2 bg-customPrimary text-white py-3 px-6 rounded-xl
                               hover:bg-customPrimary/90 transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      <AddCircleOutlineIcon />
                      <span className="font-medium">Create First Entry</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {addModalOpen && (
        <AddDiaryModal
          categories={categories || []}
          open={addModalOpen}
          onClose={handleCloseAddModal}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default PetDiaryListPage;
