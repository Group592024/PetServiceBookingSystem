import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Box, Modal, TextField } from "@mui/material";

const UpdateVariantModal = ({ id, open, handleClose, onSuccess }) => {
  const navigate = useNavigate();
  const [variant, setVariant] = useState({});
  const [selectedOption, setSelectedOption] = useState(variant.isDeleted);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({
    content: false,
    price: false,
  });

  useEffect(() => {
    const fetchDataUpdate = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5050/api/ServiceVariant/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        setVariant(data.data);
        setSelectedOption(data.data.isDeleted);
      } catch (error) {
        console.error("Failed fetching api", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load the service variant data!",
          icon: "error",
          confirmButtonColor: "#1976D2",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open && id) {
      fetchDataUpdate();
    }
  }, [open, id]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value === "true");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (variant.serviceContent === "" && variant.servicePrice === "") {
      setError({
        content: true,
        price: true,
      });
      return;
    }

    if (variant.serviceContent === "") {
      setError((prev) => ({
        ...prev,
        content: true,
      }));
      return;
    }

    if (variant.servicePrice === "") {
      setError((prev) => ({
        ...prev,
        price: true,
      }));
      return;
    }

    const formData = new FormData();
    formData.append("serviceContent", variant.serviceContent);
    formData.append("servicePrice", variant.servicePrice);
    formData.append("isDeleted", selectedOption);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5050/api/ServiceVariant/${id}`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Success",
          text: "Service Variant Updated Successfully!",
          icon: "success",
          confirmButtonColor: "#1976D2",
        });

        if (typeof onSuccess === "function") {
          onSuccess();
        } else {
          window.location.reload();
        }

        handleClose();
      } else {
        console.error("Failed update");
        Swal.fire({
          title: "Error",
          text: "Failed to update service variant!",
          icon: "error",
          confirmButtonColor: "#1976D2",
        });
      }
    } catch (error) {
      console.error("Failed fetching api", error);
      Swal.fire({
        title: "Error",
        text: "Failed to update service variant!",
        icon: "error",
        confirmButtonColor: "#1976D2",
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      data-testid="edit-modal-variant"
      aria-labelledby="update-service-variant-modal"
      aria-describedby="modal-for-updating-service-variant"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "60%", lg: "50%" },
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "background.paper",
          borderRadius: "16px",
          boxShadow: 24,
          p: 0,
        }}
        className="outline-none"
      >
        <div className="bg-customPrimary text-white py-4 px-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Update Service Variant</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-customLightPrimary transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 bg-customLight">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-customPrimary"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-customDark font-semibold mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-customPrimary"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Service Content
                </h3>
                <TextField
                  data-testid="variant-content-input"
                  fullWidth
                  variant="outlined"
                  value={variant.serviceContent || ""}
                  onChange={(e) => {
                    setVariant((prev) => ({
                      ...prev,
                      serviceContent: e.target.value,
                    }));
                    setError((prev) => ({
                      ...prev,
                      content: false,
                    }));
                  }}
                  error={error.content}
                  helperText={
                    error.content ? "Service content is required." : ""
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "white",
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
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Service Price
                </h3>
                <TextField
                  data-testid="variant-price-input"
                  fullWidth
                  variant="outlined"
                  type="number"
                  step="0.01"
                  value={variant.servicePrice || ""}
                  onChange={(e) => {
                    setVariant((prev) => ({
                      ...prev,
                      servicePrice: e.target.value,
                    }));
                    setError((prev) => ({
                      ...prev,
                      price: false,
                    }));
                  }}
                  error={error.price}
                  helperText={error.price ? "Service price is required." : ""}
                  InputProps={{
                    startAdornment: (
                      <span className="text-customDarkGrey mr-1"></span>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "white",
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
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Status
                </h3>
                <div className="bg-white p-4 rounded-xl border border-customLightPrimary shadow-sm space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="status-active"
                      name="variantStatus"
                      value="false"
                      checked={selectedOption === false}
                      onChange={handleOptionChange}
                      className="w-4 h-4 text-customPrimary focus:ring-customLightPrimary"
                    />
                    <label htmlFor="status-active" className="text-customDark">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-customLightSuccess text-customSuccess">
                        Active
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="status-inactive"
                      name="variantStatus"
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
            </form>
          )}
        </div>

        <div className="bg-customGrey px-6 py-4 rounded-b-2xl border-t border-customLightPrimary flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-white border border-customDarkGrey text-customDark rounded-lg shadow-sm hover:bg-customGrey transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            data-testid="submit-button-variant"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-customPrimary hover:bg-customLightPrimary hover:text-customPrimary text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Box>
    </Modal>
  );
};

export default UpdateVariantModal;
