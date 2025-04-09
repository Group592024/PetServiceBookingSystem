import React, { useState, useEffect } from "react";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";
import { useLocation, useParams } from "react-router-dom";
import {
  Card,
  Typography,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { getData } from "../../../../Utilities/ApiFunctions";

const CustomerVoucherDetail = () => {
  const [voucher, setVoucher] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { voucherId } = useParams();

  useEffect(() => {
    const fetchVoucher = async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getData(`api/Voucher/${id}`);
        if (response.flag) {
          setVoucher(response.data);
        } else {
          setError(response.message || "Voucher not found");
        }
      } catch (error) {
        console.error("Error fetching voucher:", error);
        setError("Error fetching voucher details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const initialData = location.state?.rowData || null;
    if (initialData) {
      setVoucher(initialData);
      console.log("Voucher data from state:", initialData);
    } else if (voucherId) {
      fetchVoucher(voucherId);
    } else {
      setError("No voucher ID provided");
    }
  }, [location.state?.rowData, voucherId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCopyCode = () => {
    if (voucher?.voucherCode) {
      navigator.clipboard
        .writeText(voucher.voucherCode)
        .then(() => {
          setSnackbarOpen(true);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="bg-blue-50 min-h-screen">
        <NavbarCustomer />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full border border-blue-100">
              <div className="mb-6 flex justify-center">
                <CircularProgress 
                  size={60} 
                  thickness={4} 
                  sx={{ color: '#1976d2' }} 
                />
              </div>
              <Typography variant="h5" className="text-blue-700 font-medium mb-3">
                Loading Voucher Details
              </Typography>
              <Typography variant="body1" className="text-blue-500">
                Please wait while we fetch your voucher information...
              </Typography>
              
              {/* Decorative elements */}
              <div className="mt-8 flex justify-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-200 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-blue-300 animate-pulse delay-100"></div>
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse delay-200"></div>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-300"></div>
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-400"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-blue-50 min-h-screen">
        <NavbarCustomer />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full border border-red-100">
              <div className="text-red-500 text-5xl mb-6">
                <ErrorOutlineIcon fontSize="inherit" />
              </div>
              <Typography variant="h5" className="text-red-700 font-medium mb-3">
                Unable to Load Voucher
              </Typography>
              <Typography variant="body1" className="text-gray-600 mb-4">
                {error}
              </Typography>
              <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-100">
                <Typography variant="body2" className="text-red-600">
                  Please try again later or contact customer support if the problem persists.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No Voucher Found State
  if (!voucher) {
    return (
      <div className="bg-blue-50 min-h-screen">
        <NavbarCustomer />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full border border-blue-100">
              <div className="text-blue-400 text-5xl mb-6">
                <SearchOffIcon fontSize="inherit" />
              </div>
              <Typography variant="h5" className="text-blue-700 font-medium mb-3">
                No Voucher Found
              </Typography>
              <Typography variant="body1" className="text-gray-600 mb-4">
                The requested voucher information is not available
              </Typography>
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                <Typography variant="body2" className="text-blue-600">
                  Please check your voucher ID or try browsing available vouchers.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 min-h-screen">
      <NavbarCustomer />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" className="font-bold text-blue-800">
            Voucher Details
          </Typography>
          <Chip
            label={voucher.isGift ? "Gift Voucher" : "Regular Voucher"}
            color={voucher.isGift ? "success" : "primary"}
            icon={voucher.isGift ? <CheckCircleIcon /> : <LocalOfferIcon />}
            sx={{ backgroundColor: voucher.isGift ? '#4caf50' : '#1976d2', color: 'white' }}
          />
        </div>

        <Card className="shadow-lg overflow-hidden border-0">
          {/* Blue header with discount */}
          <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
            <div>
              <Typography variant="h4" className="font-bold">
                {voucher.voucherName}
              </Typography>
              <Typography variant="body1">
                {voucher.voucherDescription || "Use this voucher for your next purchase"}
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="h3" className="font-bold">
                {voucher.voucherDiscount}%
              </Typography>
              <Typography variant="subtitle1" className="uppercase tracking-wider">
                DISCOUNT
              </Typography>
            </div>
          </div>

          {/* Dotted separator */}
          <div className="relative h-4 bg-white">
            <div className="absolute left-0 right-0 border-b-2 border-dashed border-blue-300"></div>
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
              <i className="bx bxs-scissors text-blue-400 rotate-90 text-xl"></i>
            </div>
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
              <i className="bx bxs-scissors text-blue-400 rotate-90 text-xl"></i>
            </div>
          </div>

          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Voucher Basic Info */}
              <div>
                <div className="mb-6">
                  <Typography
                    variant="h5"
                    className="font-semibold mb-4 flex items-center text-blue-700"
                  >
                    <LocalOfferIcon className="mr-2 text-blue-600" /> Voucher Information
                  </Typography>

                  <div className="space-y-4">
                    <div>
                      <Typography variant="subtitle2" className="text-blue-500">
                        Voucher Code
                      </Typography>
                      <div className="flex items-center">
                        <Tooltip title="Click to copy code">
                          <div
                            onClick={handleCopyCode}
                            className="flex items-center cursor-pointer bg-blue-50 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                          >
                            <Typography
                              variant="body1"
                              className="font-medium mr-2 text-blue-800"
                            >
                              {voucher.voucherCode}
                            </Typography>
                            <ContentCopyIcon fontSize="small" className="text-blue-600" />
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider className="my-4" sx={{ borderColor: 'rgba(59, 130, 246, 0.2)' }} />

                <div>
                  <Typography
                    variant="h5"
                    className="font-semibold mb-4 flex items-center text-blue-700"
                  >
                    <EventIcon className="mr-2 text-blue-600" /> Validity Period
                  </Typography>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Typography variant="subtitle2" className="text-blue-500">
                        Start Date
                      </Typography>
                      <Typography variant="body1" className="text-blue-800 font-medium">
                        {formatDate(voucher.voucherStartDate)}
                      </Typography>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Typography variant="subtitle2" className="text-blue-500">
                        End Date
                      </Typography>
                      <Typography variant="body1" className="text-blue-800 font-medium">
                        {formatDate(voucher.voucherEndDate)}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voucher Discount Details */}
              <div>
                <div className="mb-6">
                  <Typography
                    variant="h5"
                    className="font-semibold mb-4 flex items-center text-blue-700"
                  >
                    <InfoIcon className="mr-2 text-blue-600" /> Discount Details
                  </Typography>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Typography variant="subtitle2" className="text-blue-500">
                          Discount
                        </Typography>
                        <Typography
                          variant="body1"
                          className="font-medium text-green-600"
                        >
                          {voucher.voucherDiscount}%
                        </Typography>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Typography variant="subtitle2" className="text-blue-500">
                          Minimum Spend
                        </Typography>
                        <Typography variant="body1" className="font-medium text-blue-800">
                          ${voucher.voucherMinimumSpend || "0"}
                        </Typography>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Typography variant="subtitle2" className="text-blue-500">
                          Maximum Discount
                        </Typography>
                        <Typography variant="body1" className="font-medium text-blue-800">
                          ${voucher.voucherMaximum || "No limit"}
                        </Typography>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Typography variant="subtitle2" className="text-blue-500">
                          Quantity
                        </Typography>
                        <Typography variant="body1" className="font-medium text-blue-800">
                          {voucher.voucherQuantity || "Unlimited"}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider className="my-4" sx={{ borderColor: 'rgba(59, 130, 246, 0.2)' }} />

                <div>
                  <Typography variant="h5" className="font-semibold mb-4 text-blue-700">
                    Terms & Conditions
                  </Typography>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <Typography variant="body2" className="text-blue-700">
                      {voucher.voucherTerms ||
                        "Standard terms and conditions apply. This voucher cannot be combined with other offers."}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <Divider className="my-6" sx={{ borderColor: 'rgba(59, 130, 246, 0.2)' }} />

            <div className="flex justify-between items-center">
              <Typography variant="caption" className="text-blue-500">
                Voucher ID: {voucher.voucherId || voucher.id}
              </Typography>

              <div className="flex space-x-2">
                {new Date(voucher.voucherEndDate) > new Date() ? (
                  <Chip
                    label="Active"
                    color="success"
                    icon={<CheckCircleIcon />}
                    sx={{ backgroundColor: '#4caf50', color: 'white' }}
                  />
                ) : (
                  <Chip 
                    label="Expired" 
                    color="error" 
                    icon={<CancelIcon />} 
                    sx={{ backgroundColor: '#f44336', color: 'white' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Blue accent elements */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 opacity-10 rounded-full -mr-5 -mt-5"></div>
          <div className="absolute bottom-0 right-10 w-8 h-8 bg-blue-500 opacity-10 rounded-full -mb-2"></div>
        </Card>
      </div>

      {/* Snackbar notification for copy success */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Voucher code copied to clipboard!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: { 
            backgroundColor: '#1976d2',
            color: 'white'
          }
        }}
      />
    </div>
  );
};

export default CustomerVoucherDetail;
