import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import sampleImage from "../../../assets/sampleUploadImage.jpg";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddVariantModal from "../../../components/services/AddVariantModal";

const AddService = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [tmpImage, setTmpImage] = useState(sampleImage);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState({
    serviceTypeId: "",
    serviceName: "",
    serviceDescription: "",
    selectedImage: null,
  });

  const [error, setError] = useState({
    name: false,
    description: false,
  });

  const [serviceType, setServiceType] = useState([]);

  const fetchDataFunction = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFunction();

    // Cleanup function for the image URL
    return () => {
      if (tmpImage !== sampleImage && tmpImage.startsWith("blob:")) {
        URL.revokeObjectURL(tmpImage);
      }
    };
  }, []);

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
        event.target.value = "";
        return;
      } else {
        // Revoke previous blob URL if it exists and is not the sample image
        if (tmpImage !== sampleImage && tmpImage.startsWith("blob:")) {
          URL.revokeObjectURL(tmpImage);
        }

        const tmpUrl = URL.createObjectURL(fileImage);
        setService((prev) => ({
          ...prev,
          selectedImage: fileImage,
        }));
        setTmpImage(tmpUrl);
      }
    }
    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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

    if (service.selectedImage === null) {
      Swal.fire({
        title: "Service Image Required",
        text: "Please upload an image for the service",
        icon: "warning",
        confirmButtonColor: "#1976D2",
      });
      return;
    }

    const formData = new FormData();
    formData.append("serviceTypeId", service.serviceTypeId);
    formData.append("serviceName", service.serviceName);
    formData.append("serviceDescription", service.serviceDescription);
    formData.append("imageFile", service.selectedImage);

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:5050/api/Service", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("serviceId", data.data.serviceId);

        setService({
          serviceTypeId: "",
          serviceName: "",
          serviceDescription: "",
          selectedImage: null,
        });

        Swal.fire({
          title: "Success",
          text: "Service Added Successfully! Now you should add at least one service variant for this service!",
          icon: "success",
          confirmButtonColor: "#1976D2",
        });

        //hien popup add variant
        setOpen(true);
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed To Add Service!",
          icon: "error",
          confirmButtonColor: "#1976D2",
        });
      }
    } catch (error) {
      console.error("Failed fetching api", error);
      Swal.fire({
        title: "Error",
        text: "Failed To Add Service!",
        icon: "error",
        confirmButtonColor: "#1976D2",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    const inputFile = document.getElementById("inputFile");
    if (inputFile) {
      inputFile.click();
    }
  };

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <AddVariantModal
          id={localStorage.getItem("serviceId")}
          open={open}
          handleClose={setOpen}
          disableBackdrop={true}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-customLight">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-customDark text-center">
                Add New Service
              </h1>
              <div className="w-20 h-1 bg-customPrimary mx-auto mt-2 rounded-full"></div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-customPrimary"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
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
                            fullWidth
                            variant="outlined"
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
                            data-testid="description-textarea-service"
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={5}
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

                        <div className="flex space-x-4 pt-4">
                          <button
                            data-testid="save-button-service"
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-customPrimary hover:bg-customLightPrimary hover:text-customPrimary text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                          >
                            {loading ? (
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
                                  fill="                                  none"
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
                                Save
                              </>
                            )}
                          </button>

                          <button
                            data-testid="cancel-button-service"
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
                          Click on the image to upload
                        </p>
                      </div>
                      <div className="relative group w-4/5 aspect-square overflow-hidden rounded-xl shadow-lg border-4 border-white">
                        <img
                          data-testid="image-button-service"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          src={tmpImage}
                          alt="Service preview"
                        />
                        <div
                          onClick={handleImageClick}
                          className="absolute cursor-pointer inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                            <p className="font-medium">Click to upload image</p>
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

export default AddService;
