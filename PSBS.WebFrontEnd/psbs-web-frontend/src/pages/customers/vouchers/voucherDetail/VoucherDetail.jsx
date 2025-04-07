import React, { useState, useEffect } from "react";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";
import { useLocation } from "react-router-dom";
import {
  Card,
  Typography,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  Snackbar,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const CustomerVoucherDetail = () => {
  const [voucher, setVoucher] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const initialData = location.state?.rowData || null;
    if (initialData) {
      setVoucher(initialData);
      console.log("Voucher data:", initialData);
    }
  }, [location.state?.rowData]);

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

  if (!voucher) {
    return (
      <div>
        <NavbarCustomer />
        <div className="max-w-7xl mx-auto mt-5 px-4">
          <div className="text-center py-10">
            <Typography variant="h6">Loading voucher details...</Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavbarCustomer />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" className="font-bold text-gray-800">
            Voucher Details
          </Typography>
          <Chip
            label={voucher.isGift ? "Gift Voucher" : "Regular Voucher"}
            color={voucher.isGift ? "success" : "primary"}
            icon={voucher.isGift ? <CheckCircleIcon /> : <LocalOfferIcon />}
          />
        </div>

        <Card className="p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Voucher Basic Info */}
            <div>
              <div className="mb-6">
                <Typography
                  variant="h5"
                  className="font-semibold mb-4 flex items-center"
                >
                  <LocalOfferIcon className="mr-2" /> Voucher Information
                </Typography>

                <div className="space-y-4">
                  <div>
                    <Typography variant="subtitle2" className="text-gray-500">
                      Voucher Name
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {voucher.voucherName}
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="subtitle2" className="text-gray-500">
                      Voucher Code
                    </Typography>
                    <div className="flex items-center">
                      <Tooltip title="Click to copy code">
                        <div
                          onClick={handleCopyCode}
                          className="flex items-center cursor-pointer bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Typography
                            variant="body1"
                            className="font-medium mr-2"
                          >
                            {voucher.voucherCode}
                          </Typography>
                          <ContentCopyIcon fontSize="small" color="action" />
                        </div>
                      </Tooltip>
                    </div>
                  </div>

                  <div>
                    <Typography variant="subtitle2" className="text-gray-500">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {voucher.voucherDescription || "N/A"}
                    </Typography>
                  </div>
                </div>
              </div>

              <Divider className="my-4" />

              <div>
                <Typography
                  variant="h5"
                  className="font-semibold mb-4 flex items-center"
                >
                  <EventIcon className="mr-2" /> Validity Period
                </Typography>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="subtitle2" className="text-gray-500">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(voucher.voucherStartDate)}
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="subtitle2" className="text-gray-500">
                      End Date
                    </Typography>
                    <Typography variant="body1">
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
                  className="font-semibold mb-4 flex items-center"
                >
                  <InfoIcon className="mr-2" /> Discount Details
                </Typography>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Typography variant="subtitle2" className="text-gray-500">
                        Discount
                      </Typography>
                      <Typography
                        variant="body1"
                        className="font-medium text-green-600"
                      >
                        {voucher.voucherDiscount}%
                      </Typography>
                    </div>

                    <div>
                      <Typography variant="subtitle2" className="text-gray-500">
                        Minimum Spend
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        ${voucher.voucherMinimumSpend || "0"}
                      </Typography>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Typography variant="subtitle2" className="text-gray-500">
                        Maximum Discount
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        ${voucher.voucherMaximum || "No limit"}
                      </Typography>
                    </div>

                    <div>
                      <Typography variant="subtitle2" className="text-gray-500">
                        Quantity
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        {voucher.voucherQuantity || "Unlimited"}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              <Divider className="my-4" />

              <div>
                <Typography variant="h5" className="font-semibold mb-4">
                  Terms & Conditions
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {voucher.voucherTerms ||
                    "Standard terms and conditions apply. This voucher cannot be combined with other offers."}
                </Typography>
              </div>
            </div>
          </div>

          <Divider className="my-6" />

          <div className="flex justify-between items-center">
            <Typography variant="caption" className="text-gray-500">
              Voucher ID: {voucher.id}
            </Typography>

            <div className="flex space-x-2">
              {new Date(voucher.voucherEndDate) > new Date() ? (
                <Chip
                  label="Active"
                  color="success"
                  icon={<CheckCircleIcon />}
                />
              ) : (
                <Chip label="Expired" color="error" icon={<CancelIcon />} />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Snackbar notification for copy success */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Voucher code copied to clipboard!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  );
};

export default CustomerVoucherDetail;
