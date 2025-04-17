import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

const UpdateService = () => {
  //set state
  const navigate = useNavigate();
  const { id } = useParams();
  const sidebarRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [service, setService] = useState({
    serviceTypeId: "",
    serviceName: "",
    serviceDescription: "",
    serviceImage: null,
  });
  const [selectedOption, setSelectedOption] = useState(service.isDeleted);
  const [imageDisplay, setImageDisplay] = useState(
    `http://localhost:5023${service.serviceImage}`
  );
  const [error, setError] = useState({
    name: false,
    description: false,
  });
  const [serviceType, setServiceType] = useState([]);

  useEffect(() => {
    return () => {
      if (imageDisplay) {
        URL.revokeObjectURL(imageDisplay);
      }
    };
  }, [imageDisplay]);

  //api serviceTypes
  const fetchDataFunction = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/Service/serviceTypes",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const result = response.data.map((item, index) => ({
        id: index,
        ...item,
      }));

      if (result.length > 0 && !service.serviceTypeId) {
        setService((prev) => ({
          ...prev,
          serviceTypeId: result[0].serviceTypeId,
        }));

        setServiceType(result);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load service types!",
        icon: "error",
        confirmButtonColor: "#1976D2",
      });
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, []);

  //upload hinh
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
          title: "Invalid File Type",
          text: "Please upload only image files (JPEG, PNG, GIF, WEBP)",
          icon: "error",
          confirmButtonColor: "#1976D2",
        });
      } else {
        // Revoke previous blob URL if it exists
        if (imageDisplay && imageDisplay.startsWith("blob:")) {
          URL.revokeObjectURL(imageDisplay);
        }

        const tmpUrl = URL.createObjectURL(fileImage);
        setImageDisplay(tmpUrl);
        setService((prev) => ({
          ...prev,
          serviceImage: fileImage,
        }));
      }
    }

    // Reset the input value to allow selecting the same file again
    event.target.value = "";
  };

  //api fill data
  useEffect(() => {
    const fetchDataUpdate = async () => {
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
        setService(data.data);
        setSelectedOption(data.data.isDeleted);
        setImageDisplay(`http://localhost:5023${data.data.serviceImage}`);
      } catch (error) {
        console.error("Failed fetching api", error);
        Swal.fire({
          title: "Error",
          text: error?.message || error,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#D32F2F",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/service");
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

  //api update
  const handleSubmit = async (event) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append("serviceTypeId", service.serviceTypeId);
    formData.append("serviceName", service.serviceName);
    formData.append("serviceDescription", service.serviceDescription);
    formData.append("imageFile", service.serviceImage);
    formData.append("isDeleted", selectedOption);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:5050/api/Service/${id}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Swal.fire({
          title: "Success",
          text: "Service Updated Successfully!",
          icon: "success",
          confirmButtonColor: "#1976D2",
        });
        navigate("/service");
      } else {
        console.error("Failed update");
        Swal.fire({
          title: "Error",
          text: "Failed to update service!",
          icon: "error",
          confirmButtonColor: "#1976D2",
        });
      }
    } catch (error) {
      console.error("Failed fetching api", error);
      Swal.fire({
        title: "Error",
        text: "Failed to update service!",
        icon: "error",
        confirmButtonColor: "#1976D2",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    if (service.serviceName === "" && service.serviceDescription === "") {
      setError({
        description: true,
        name: true,
      });
      return;
    }

    if (service.serviceName === "") {
      setError((prev) => ({
        ...prev,
        name: true,
      }));
      return;
    }

    if (service.serviceDescription === "") {
      setError((prev) => ({
        ...prev,
        description: true,
      }));
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update this item? This action may change the booking information associated with this service.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Continue to Update",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#1976D2",
      cancelButtonColor: "#D32F2F",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await handleSubmit(e);
      }
    });
  };

  //UI
  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-customLight">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-customDark text-center">
                Update Service
              </h1>
              <div className="w-20 h-1 bg-customPrimary mx-auto mt-2 rounded-full"></div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-customPrimary"></div>
              </div>
            ) : (
              <form onSubmit={handleUpdate}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/2 p-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-customDark font-semibold mb-3 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-customPrimary"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Service Name
                          </h3>
                          <TextField
                            data-testid="name-input-service"
                            fullWidth
                            variant="outlined"
                            value={service.serviceName || ""}
                            placeholder="Enter service name"
                            onChange={(e) => {
                              setService((prev) => ({
                                ...prev,
                                serviceName: e.target.value,
                              }));
                              setError((prev) => ({
                                ...prev,
                                name: false,
                              }));
                            }}
                            error={error.name}
                            helperText={
                              error.name ? "Service Name is required." : ""
                            }
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                              },
                            }}
                          />
                        </div>

                        <div>
                          <h3 className="text-customDark font-semibold mb-3 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-customPrimary"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Service Type
                          </h3>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel id="service-type-label">
                              Service Type
                            </InputLabel>
                            <Select
                              labelId="service-type-label"
                              id="service-type-select"
                              value={service.serviceTypeId || ""}
                              onChange={(e) => {
                                setService((prev) => ({
                                  ...prev,
                                  serviceTypeId: e.target.value,
                                }));
                              }}
                              label="Service Type"
                              sx={{
                                borderRadius: "12px",
                              }}
                            >
                              {serviceType.map((item) => (
                                <MenuItem
                                  key={item.serviceTypeId}
                                  value={item.serviceTypeId}
                                >
                                  {item.typeName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>

                        <div>
                          <h3 className="text-customDark font-semibold mb-3 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-customPrimary"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Service Description
                          </h3>
                          <TextField
                            data-testid="description-input-service"
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={5}
                            value={service.serviceDescription || ""}
                            placeholder="Enter service description"
                            onChange={(e) => {
                              setService((prev) => ({
                                ...prev,
                                serviceDescription: e.target.value,
                              }));
                              setError((prev) => ({
                                ...prev,
                                description: false,
                              }));
                            }}
                            error={error.description}
                            helperText={
                              error.description
                                ? "Service Description is required."
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
                          <h3 className="text-customDark font-semibold mb-3 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-customPrimary"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1
                                                                0 100-2h-2V7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Service Status
                          </h3>
                          <div className="bg-white p-4 rounded-xl border border-customLightPrimary shadow-sm space-y-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="status-active"
                                name="serviceStatus"
                                value="false"
                                checked={selectedOption === false}
                                onChange={handleOptionChange}
                                className="w-4 h-4 text-customPrimary focus:ring-customLightPrimary"
                              />
                              <label
                                htmlFor="status-active"
                                className="text-customDark"
                              >
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-customLightSuccess text-customSuccess">
                                  Active
                                </span>
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="status-inactive"
                                name="serviceStatus"
                                value="true"
                                checked={selectedOption === true}
                                onChange={handleOptionChange}
                                className="w-4 h-4 text-customPrimary focus:ring-customLightPrimary"
                              />
                              <label
                                htmlFor="status-inactive"
                                className="text-customDark"
                              >
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-customLightDanger text-customDanger">
                                  Inactive
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-4 pt-4">
                          <button
                            data-testid="update-button-service"
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-customPrimary hover:bg-customLightPrimary hover:text-customPrimary text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                          >
                            {submitting ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-5 h-5 mr-1.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  ></path>
                                </svg>
                                Save Changes
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate("/service")}
                            className="flex-1 bg-white border border-customDarkGrey text-customDark py-3 px-6 rounded-lg shadow-sm hover:bg-customGrey transition-all duration-200 font-medium flex justify-center items-center"
                          >
                            <svg
                              className="w-5 h-5 mr-1.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              ></path>
                            </svg>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-1/2 bg-customLightPrimary p-8 flex flex-col justify-center items-center">
                      <div className="text-center mb-4">
                        <h3 className="text-customDark font-semibold mb-2 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-customPrimary"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Service Image
                        </h3>
                        <p className="text-sm text-customDarkGrey">
                          Click on the image to change it
                        </p>
                      </div>
                      <div className="relative group w-4/5 aspect-square overflow-hidden rounded-xl shadow-lg border-4 border-white">
                        <img
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          src={imageDisplay}
                          alt={service.serviceName || "Service image"}
                        />
                        <div
                          onClick={() =>
                            document.getElementById("inputFile").click()
                          }
                          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <div className="text-white text-center p-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10 mx-auto mb-2"
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
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        id="inputFile"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UpdateService;
