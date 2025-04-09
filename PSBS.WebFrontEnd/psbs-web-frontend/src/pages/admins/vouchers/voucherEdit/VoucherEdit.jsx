import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import EditableDiv from "../../../../components/reuseableForm/ReuseableForm";
import { useLocation, useParams } from "react-router-dom";
import {
  validateNonNegativeInteger,
  validateVoucherDiscount,
  validateVoucherStartDate,
  validateVoucherEndDate,
} from "../../../../Utilities/ValidationFunctions";
import { updateData, getData } from "../../../../Utilities/ApiFunctions";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const VoucherEdit = () => {
  const sidebarRef = useRef(null);
  const location = useLocation();
  const { voucherId } = useParams(); // Get the id from URL params
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVoucher = async (voucherId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getData(`api/Voucher/${voucherId}`);
        if (response.flag) {
          setFormData(response.data);
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
    if (initialData !== null) {
      setFormData(initialData);
    } else if (voucherId) {
      fetchVoucher(voucherId);
    } else {
      setError("No voucher ID provided");
    }
  }, [location.state?.rowData, voucherId]);

  const model = [
    { name: "id", label: "ID", type: "string", disabled: true, pass: true },
    { name: "voucherName", label: "Voucher Name", type: "string" },
    { name: "voucherCode", label: "Voucher Code", type: "string" },
    {
      name: "voucherQuantity",
      label: "Voucher Quantity",
      type: "integer",
      customValidation: (value) => {
        if (!/^-?\d+$/.test(value.toString())) {
          return "This must be a valid number";
        }
        if (!validateNonNegativeInteger(value)) {
          return "Voucher Quantity must be bigger than 0";
        }
        return null;
      },
    },
    {
      name: "voucherDiscount",
      label: "Voucher Discount",
      type: "integer",
      customValidation: (value) => {
        if (!/^-?\d+$/.test(value.toString())) {
          return "This must be a valid number";
        }
        if (!validateVoucherDiscount(value)) {
          return "Voucher Discount must be between 1 and 100";
        }
        return null;
      },
    },
    {
      name: "voucherMaximum",
      label: "Voucher Maximum",
      type: "integer",
      customValidation: (value) => {
        if (!/^-?\d+$/.test(value.toString())) {
          return "This must be a valid number";
        }
        if (!validateNonNegativeInteger(value)) {
          return "Voucher Maximum must be bigger than 0";
        }
        return null;
      },
    },
    {
      name: "voucherMinimumSpend",
      label: "Voucher Minimum Spend",
      type: "integer",
      customValidation: (value) => {
        if (!/^-?\d+$/.test(value.toString())) {
          return "This must be a valid number";
        }
        if (!validateNonNegativeInteger(value)) {
          return "Voucher Minimum Spend must be bigger than 0";
        }
        return null;
      },
    },
    {
      name: "voucherStartDate",
      label: "Voucher Start Date",
      type: "Date",
      customValidation: (value) => {
        if (!validateVoucherStartDate(value)) {
          return "Voucher Start Date must be at least one day ahead";
        }
        return null;
      },
    },
    {
      name: "voucherEndDate",
      label: "Voucher End Date",
      type: "Date",
      customValidation: (value, data) => {
        if (!validateVoucherEndDate(value, data)) {
          return "Voucher End Date must be later than Voucher Start Date";
        }
        return null;
      },
    },
    {
      name: "voucherDescription",
      label: "Voucher Description",
      type: "string",
    },
    { name: "isDeleted", label: "Status", type: "bool" },
    { name: "isGift", label: "Gift", type: "bool" },
  ];

  const handleEditSubmit = async (data) => {
    try {
      const response = await updateData(`api/Voucher`, data);
      if (response.flag) {
        Swal.fire({
          title: "Success!",
          text: response.message,
          icon: "success",
          confirmButtonText: "OK",
        });
        navigate(`/vouchers`);
      } else {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to submit data.");
    }
  };

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div>
            {loading ? (
              <div className="flex justify-center items-center h-[300px] w-full">
                <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
                  <div className="mb-4">
                    <i className="fas fa-circle-notch fa-spin text-3xl text-blue-500"></i>
                  </div>
                  <p className="text-blue-700 font-medium text-lg">
                    Loading voucher details...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-[300px] w-full">
                <div className="bg-red-50 p-6 rounded-lg shadow-md text-center max-w-md w-full border border-red-100">
                  <div className="text-red-600 text-4xl mb-4">
                    <i className="fas fa-exclamation-circle"></i>
                  </div>
                  <p className="text-red-700 font-medium text-lg mb-2">
                    Unable to load voucher
                  </p>
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              </div>
            ) : formData ? (
              <EditableDiv
                onSubmit={handleEditSubmit}
                fields={model}
                title="Edit Voucher"
                initialData={formData}
                view={false}
              />
            ) : (
              <div className="flex justify-center items-center h-[300px] w-full">
                <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center max-w-md w-full border border-gray-200">
                  <div className="text-gray-500 text-4xl mb-4">
                    <i className="fas fa-search"></i>
                  </div>
                  <p className="text-gray-700 font-medium text-lg mb-2">
                    No voucher found
                  </p>
                  <p className="text-gray-500 text-sm">
                    The requested voucher information is not available
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VoucherEdit;
