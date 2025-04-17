import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Box, Modal } from "@mui/material";
import formatCurrency from "../../Utilities/formatCurrency";

const VariantDetailModal = ({ id, open, handleClose }) => {
  const navigate = useNavigate();
  const [variant, setVariant] = useState({});
  const [selectedOption, setSelectedOption] = useState(variant.isDeleted);
  const [loading, setLoading] = useState(true);

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

  return (
    <Modal
      open={open}
      onClose={handleClose}
      data-testid="variant-detail-modal"
      aria-labelledby="service-variant-detail-modal"
      aria-describedby="modal-showing-service-variant-details"
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
            <h2 className="text-2xl font-bold">Service Variant Detail</h2>
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
            <div className="space-y-6">
              <div>
                <h3 className="text-customDark font-semibold mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-customPrimary"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Service Content
                </h3>
                <div className="bg-white p-4 rounded-xl border border-customLightPrimary shadow-sm">
                  <p className="text-customDark">
                    {variant.serviceContent || "N/A"}
                  </p>
                </div>
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
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Service Price
                </h3>
                <div className="bg-white p-4 rounded-xl border border-customLightPrimary shadow-sm">
                  <p className="text-customDark font-medium">
                    {formatCurrency(variant.servicePrice)}
                  </p>
                </div>
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
                <div className="bg-white p-4 rounded-xl border border-customLightPrimary shadow-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedOption
                        ? "bg-customLightDanger text-customDanger"
                        : "bg-customLightSuccess text-customSuccess"
                    }`}
                  >
                    {selectedOption ? "Inactive" : "Active"}
                  </span>
                </div>
              </div>

              {variant.createdDate && (
                <div className="flex justify-between text-sm text-customDarkGrey mt-6 pt-4 border-t border-customGrey">
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(variant.createdDate).toLocaleString()}
                  </div>
                  {variant.updatedDate && (
                    <div>
                      <span className="font-medium">Last Updated:</span>{" "}
                      {new Date(variant.updatedDate).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-customGrey px-6 py-4 rounded-b-2xl border-t border-customLightPrimary flex justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-customPrimary hover:bg-customLightPrimary hover:text-customPrimary text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            Close
          </button>
        </div>
      </Box>
    </Modal>
  );
};

export default VariantDetailModal;
