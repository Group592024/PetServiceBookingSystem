import React, { useState, useEffect } from "react";
import NavbarCustomer from '../../../../components/navbar-customer/NavbarCustomer'
import EditableDiv from '../../../../components/reuseableForm/ReuseableForm';
import { useLocation } from "react-router-dom";
const CustomerVoucherDetail = () => {
  const [formData, setFormData] = useState();
  const location = useLocation();
  useEffect(() => {
    const initialData = location.state?.rowData || null;
    if (initialData !== null) {
      setFormData(initialData);
      console.log("this is init data:", initialData)
    } else {
      // Fetch data based on the ID or handle the null case as needed
      // For example, you could call a fetch function here to get data from an API
    }
  }, [location.state?.rowData]);
  const model = [
    {name: "id", label: "ID",type: "string",disabled: true,pass: true},
    { name: "voucherName", label: "Voucher Name", type: "string" },
    { name: "voucherCode", label: "Voucher Code", type: "string" },
    { name: "voucherQuantity", label: "Voucher Quantity", type: "integer",pass: true },
    { name: "voucherDiscount", label: "Voucher Discount", type: "integer" },
    { name: "voucherMaximum", label: "Voucher Maximum", type: "integer" },
    { name: "voucherMinimumSpend", label: "Voucher Minimum Spend", type: "integer" },
    { name: "voucherStartDate", label: "Voucher Start Date", type: "Date" },
    { name: "voucherEndDate", label: "Voucher End Date", type: "Date" },
    { name: "voucherDescription", label: "Voucher Description", type: "string" },
    { name: "isGift", label: "Status", type: "bool", pass: true },
  ];
  return (
    <div>
       <NavbarCustomer />
       <div className="max-w-7xl mx-auto mt-5 px-4 overflow-hidden">
       <EditableDiv
              fields={model}
              title="Voucher Detail"
              initialData={formData}
              view={true} 
            />
        </div>
    </div>
  )
}

export default CustomerVoucherDetail