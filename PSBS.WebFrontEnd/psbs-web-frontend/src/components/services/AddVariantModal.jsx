import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Box, Modal, TextField } from "@mui/material";

const AddVariantModal = ({
  id,
  open,
  handleClose,
  disableBackdrop = false,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState({
    serviceContent: "",
    servicePrice: "",
  });

  const [error, setError] = useState({
    content: false,
    price: "",
  });

  const handleBackdropClick = (event) => {
    event.stopPropagation();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (variant.serviceContent === "" && variant.servicePrice === "") {
      setError({
        content: true,
        price: "Service price is required",
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
        price: "Service price is required",
      }));
      return;
    } else if (
      isNaN(parseInt(variant.servicePrice, 10)) ||
      parseInt(variant.servicePrice, 10) <= 0
    ) {
      setError((prev) => ({
        ...prev,
        price: "Service price must be a positive number",
      }));
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("serviceContent", variant.serviceContent);
    formData.append("servicePrice", variant.servicePrice);
    formData.append("serviceId", id);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:5050/api/ServiceVariant`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log(data);
      if (data.flag) {
        Swal.fire({
          title: "Success",
          text: "Service Variant Added Successfully!",
          icon: "success",
          confirmButtonColor: "#1976D2",
        });

        if (typeof onSuccess === "function") {
          onSuccess();
          handleClose(false);
        } else {
          navigate(`/service/${id}`);
          localStorage.removeItem("serviceId");
          window.location.reload();
        }
      } else {
        console.error("Failed create");
        Swal.fire({
          title: "Error",
          text: data.message || "Failed to add service variant!",
          icon: "error",
          confirmButtonColor: "#1976D2",
        });
      }
    } catch (error) {
      console.error("Failed fetching api", error);
      Swal.fire({
        title: "Error",
        text: "Failed to add service variant!",
        icon: "error",
        confirmButtonColor: "#1976D2",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      data-testid="add-variant-modal"
      open={open}
      onClose={handleClose}
      slotProps={{
        backdrop: disableBackdrop ? { onClick: handleBackdropClick } : {},
      }}
      aria-labelledby="add-service-variant-modal"
      aria-describedby="modal-for-adding-service-variant"
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
            <h2 className="text-2xl font-bold">Create Service Variant</h2>
            <button
              onClick={() => {
                if (disableBackdrop) {
                  Swal.fire({
                    title: "Are you sure?",
                    text: "If you close this popup, the service you just created will be deleted after some minutes",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "OK",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#D32F2F",
                    cancelButtonColor: "#1976D2",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      handleClose(false);
                      navigate("/service");
                    }
                  });
                } else {
                  handleClose(false);
                }
              }}
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
                multiline
                rows={4}
                placeholder="Enter service content details..."
                value={variant.serviceContent}
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
                helperText={error.content ? "Service content is required." : ""}
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
                placeholder="Enter service price..."
                value={variant.servicePrice}
                onChange={(e) => {
                  setVariant((prev) => ({
                    ...prev,
                    servicePrice: e.target.value,
                  }));
                  if (e.target.value !== "") {
                    setError((prev) => ({
                      ...prev,
                      price: "",
                    }));
                  }
                }}
                error={!!error.price}
                helperText={error.price}
                InputProps={{
                  startAdornment: (
                    <span className="text-customDarkGrey mr-1">$</span>
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
          </form>
        </div>

        <div className="bg-customGrey px-6 py-4 rounded-b-2xl border-t border-customLightPrimary flex justify-end space-x-3">
          <button
            onClick={() => {
              if (disableBackdrop) {
                Swal.fire({
                  title: "Are you sure?",
                  text: "If you close this popup, the service you just created will be deleted after some minutes",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "OK",
                  cancelButtonText: "Cancel",
                  confirmButtonColor: "#D32F2F",
                  cancelButtonColor: "#1976D2",
                }).then((result) => {
                  if (result.isConfirmed) {
                    handleClose(false);
                    navigate("/service");
                  }
                });
              } else {
                handleClose(false);
                navigate(`/service/${id}`);
              }
            }}
            className="px-5 py-2 bg-white border border-customDarkGrey text-customDark rounded-lg shadow-sm hover:bg-customGrey transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            data-testid="submit-button-variant"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-customPrimary hover:bg-customLightPrimary hover:text-customPrimary text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Save
              </>
            )}
          </button>
        </div>
      </Box>
    </Modal>
  );
};

export default AddVariantModal;
