import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import EditableDiv from "../../../../components/reuseableForm/ReuseableForm";
import { useLocation } from "react-router-dom";

const VoucherDetail = () => {
  const sidebarRef = useRef(null);
  const location = useLocation();
  const [formData, setFormData] = useState();

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
  console.log("Form Data:", formData);
  const model = [
    {name: "id", label: "ID",type: "string",disabled: true,pass: true},
    { name: "voucherName", label: "Voucher Name", type: "string" },
    { name: "voucherCode", label: "Voucher Code", type: "string" },
    { name: "voucherQuantity", label: "Voucher Quantity", type: "integer" },
    { name: "voucherDiscount", label: "Voucher Discount", type: "integer" },
    { name: "voucherMaximum", label: "Voucher Maximum", type: "integer" },
    { name: "voucherMinimumSpend", label: "Voucher Minimum Spend", type: "integer" },
    { name: "voucherStartDate", label: "Voucher Start Date", type: "Date" },
    { name: "voucherEndDate", label: "Voucher End Date", type: "Date" },
    { name: "voucherDescription", label: "Voucher Description", type: "string" },
    { name: "isGift", label: "Gift", type: "bool"},
    { name: "isDeleted", label: "Status", type: "bool" },
  ];
  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div>
            <EditableDiv
              onSubmit={(data) => console.log(data)}
              fields={model}
              title="Voucher Detail"
              initialData={formData}
              view={true} 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VoucherDetail;
