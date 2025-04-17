import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { TextField } from "@mui/material";

const UpdatePetType = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const sidebarRef = useRef(null);

  const [petType, setPetType] = useState({});
  const [selectedOption, setSelectedOption] = useState(petType.isDelete);
  const [imageDisplay, setImageDisplay] = useState(
    `http://localhost:5010${petType.petType_Image}`
  );
  const [error, setError] = useState({
    name: false,
    description: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return () => {
      if (imageDisplay) {
        URL.revokeObjectURL(imageDisplay);
      }
    };
  }, [imageDisplay]);

  const handleImageChange = (event) => {
    const fileImage = event.target.files[0];

    if (fileImage) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(fileImage.type)) {
        Swal.fire({
          title: "Only accept image files!",
          icon: "error",
          confirmButtonColor: "#6366f1",
        });
        event.target.value = "";
        return;
      } else {
        const tmpUrl = URL.createObjectURL(fileImage);
        setImageDisplay(tmpUrl);
        setPetType((prev) => ({
          ...prev,
          petType_Image: fileImage,
        }));
      }
    }

    event.target.value = "";
  };

  useEffect(() => {
    const fetchDataUpdate = async () => {
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
          throw new Error("Pet type not found" || "Internal Server Error");
        }
        setPetType(data.data);
        setSelectedOption(data.data.isDelete);
        setImageDisplay(`http://localhost:5010${data.data.petType_Image}`);
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: error?.message || error,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#D32F2F",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/petType");
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDataUpdate();
  }, [id]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value === "true");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (petType.petType_Name === "" && petType.petType_Description === "") {
      setError({
        description: true,
        name: true,
      });
      return;
    }

    if (petType.petType_Name === "") {
      setError((prev) => ({
        ...prev,
        name: true,
      }));
      return;
    }

    if (petType.petType_Description === "") {
      setError((prev) => ({
        ...prev,
        description: true,
      }));
      return;
    }

    const formData = new FormData();
    formData.append("petType_Name", petType.petType_Name);
    formData.append("petType_Description", petType.petType_Description);
    formData.append("imageFile", petType.petType_Image);
    formData.append("isDelete", selectedOption);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:5050/api/PetType/${id}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Swal.fire({
          title: "Update Pet Type",
          text: "Pet Type Updated Successfully!",
          icon: "success",
          confirmButtonColor: "#6366f1",
        });
        navigate("/petType");
      } else {
        Swal.fire({
          title: "Update Pet Type",
          text: "Failed to update pet type!",
          icon: "error",
          confirmButtonColor: "#6366f1",
        });
      }
    } catch (error) {
      console.error("Failed fetching api", error);
      Swal.fire({
        title: "Update Pet Type",
        text: "Failed to update pet type!",
        icon: "error",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                Update Pet Type
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
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
                <div className="md:flex">
                  <div className="md:w-1/2 p-8">
                    <div className="mb-6">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
                        Pet Type Details
                      </span>
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Edit Information
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
                          Pet Type Name
                        </h3>
                        <TextField
                          data-testid="petType-name-input"
                          type="text"
                          value={petType.petType_Name || ""}
                          fullWidth
                          variant="outlined"
                          className="rounded-xl"
                          onChange={(e) => {
                            setPetType((prev) => ({
                              ...prev,
                              petType_Name: e.target.value,
                            }));
                            setError((prev) => ({
                              ...prev,
                              name: false,
                            }));
                          }}
                          error={error.name}
                          helperText={
                            error.name ? "Pet Type Name is required." : ""
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                            },
                          }}
                        />
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
                        <TextField
                          data-testid="petType-description-input"
                          type="text"
                          multiline
                          rows="5"
                          fullWidth
                          variant="outlined"
                          value={petType.petType_Description || ""}
                          onChange={(e) => {
                            setPetType((prev) => ({
                              ...prev,
                              petType_Description: e.target.value,
                            }));
                            setError((prev) => ({
                              ...prev,
                              description: false,
                            }));
                          }}
                          error={error.description}
                          helperText={
                            error.description
                              ? "Pet Type Description is required."
                              : ""
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                            },
                          }}
                        />
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
                        <div className="flex space-x-6 mt-2">
                          <label className="inline-flex items-center">
                            <input
                              data-testid="petType-isDelete-false"
                              type="radio"
                              name="petTypeStatus"
                              value="false"
                              checked={selectedOption === false}
                              onChange={handleOptionChange}
                              className="form-radio h-5 w-5 text-indigo-600"
                            />
                            <span className="ml-2 text-gray-700">Active</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              data-testid="petType-isDelete-true"
                              type="radio"
                              name="petTypeStatus"
                              value="true"
                              checked={selectedOption === true}
                              onChange={handleOptionChange}
                              className="form-radio h-5 w-5 text-indigo-600"
                            />
                            <span className="ml-2 text-gray-700">Inactive</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-1/2 bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-8">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Pet Type Image
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Click on the image to change
                      </p>
                    </div>
                    <div
                      className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-lg group cursor-pointer transition-all duration-300 hover:shadow-xl"
                      onClick={() =>
                        document.getElementById("inputFile").click()
                      }
                    >
                      <img
                        className="w-full h-80 object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        src={imageDisplay}
                        alt="Pet Type"
                        onError={(e) => {
                          e.target.src = "/default-image.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-white text-center p-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="font-medium">Click to change image</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        id="inputFile"
                        onChange={(e) => handleImageChange(e)}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-8 py-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100">
                  <div className="flex justify-end items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate("/petType")}
                      className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-customPrimary to-customLightPrimary hover:from-customLightPrimary hover:to-customPrimary text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default UpdatePetType;
