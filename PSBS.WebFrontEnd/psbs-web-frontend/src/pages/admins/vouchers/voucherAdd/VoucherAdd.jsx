import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import EditableDiv from "../../../../components/reuseableForm/ReuseableForm";
import {
  validateNonNegativeInteger,
  validateVoucherDiscount,
  validateVoucherStartDate,
  validateVoucherEndDate,
} from "../../../../Utilities/ValidationFunctions";
import { postData } from "../../../../Utilities/ApiFunctions";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const VoucherAdd = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const model = [
    { name: "id", label: "ID", type: "string", disabled: true, pass: true },
    { name: "voucherName", label: "Voucher Name", type: "string" },
    { name: "voucherCode", label: "Voucher Code", type: "string" },
    {
      name: "voucherQuantity",
      label: "Voucher Quantity",
      type: "integer",
      customValidation: (value) => {
        if (!/^-?\d+$/.test(value)) {
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
        if (!/^-?\d+$/.test(value)) {
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
        if (!/^-?\d+$/.test(value)) {
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
        if (!/^-?\d+$/.test(value)) {
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
      customValidation: (value) => {
        if (!validateVoucherStartDate(value)) {
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
    { name: "isDeleted", label: "Status", type: "bool", pass: true },
    { name: "isGift", label: "Gift", type: "bool" },
  ];

  const handleSubmit = async (data) => {
    console.log("Form Data:", data);
    // API call or other handling logic
    try {
      const response = await postData(`api/voucher`, data);
      if (response.flag) {
        Swal.fire({
          title: "Success!",
          text: response.message,
          icon: "success",
          confirmButtonText: "OK",
        });
        // setRows((prevRows) => [...prevRows, response.data]);
        navigate(`/vouchers`);
      } else {
        console.log("ua trong day ne poh hon");
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
          <div className="">
            <EditableDiv
              onSubmit={handleSubmit}
              fields={model}
              title="Add Voucher"
              initialData
              view={false}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VoucherAdd;
