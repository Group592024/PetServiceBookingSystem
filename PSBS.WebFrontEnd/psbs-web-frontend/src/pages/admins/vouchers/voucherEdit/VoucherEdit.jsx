import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import EditableDiv from "../../../../components/reuseableForm/ReuseableForm";
import { useLocation } from "react-router-dom";
import {
  validateNonNegativeInteger,
  validateVoucherDiscount,
  validateVoucherStartDate,
  validateVoucherEndDate,
} from "../../../../Utilities/ValidationFunctions";
import { updateData } from "../../../../Utilities/ApiFunctions";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const VoucherEdit = () => {
  const sidebarRef = useRef(null);
  const location = useLocation();
  const [formData, setFormData] = useState();
  const navigate = useNavigate();
  useEffect(() => {
    const initialData = location.state?.rowData || null;
    if (initialData !== null) {
      setFormData(initialData);
    } else {
      // Fetch data based on the ID or handle the null case as needed
      // For example, you could call a fetch function here to get data from an API
    }
  }, [location.state?.rowData]);

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
    console.log("Edited Data:", data);
    // API call or other handling logic for updated data
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
            <EditableDiv
              onSubmit={handleEditSubmit}
              fields={model}
              title="Edit Voucher"
              initialData={formData}
              view={false}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VoucherEdit;
