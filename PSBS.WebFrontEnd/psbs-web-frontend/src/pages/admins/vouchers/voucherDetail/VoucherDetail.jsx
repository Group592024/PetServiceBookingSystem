import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import EditableDiv from "../../../../components/reuseableForm/ReuseableForm";
import { useLocation, useParams } from "react-router-dom";
import { getData } from "../../../../Utilities/ApiFunctions";

const VoucherDetail = () => {
  const sidebarRef = useRef(null);
  const location = useLocation();
  const { voucherId } = useParams(); // Get the id from URL params
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVoucher = async (voucherId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getData(`api/Voucher/${voucherId}`);
        console.log("response", response);
        if (response.flag) {
          setFormData(response.data);
        } else {
          setError(response.message || "Voucher not founds");
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
      console.log("this is init data:", initialData);
    } else if (voucherId) {
      fetchVoucher(voucherId);
    }
  }, [location.state?.rowData, voucherId]);

  console.log("Form Data:", formData);

  const model = [
    { name: "id", label: "ID", type: "string", disabled: true, pass: true },
    { name: "voucherName", label: "Voucher Name", type: "string" },
    { name: "voucherCode", label: "Voucher Code", type: "string" },
    { name: "voucherQuantity", label: "Voucher Quantity", type: "integer" },
    { name: "voucherDiscount", label: "Voucher Discount", type: "integer" },
    { name: "voucherMaximum", label: "Voucher Maximum", type: "integer" },
    {
      name: "voucherMinimumSpend",
      label: "Voucher Minimum Spend",
      type: "integer",
    },
    { name: "voucherStartDate", label: "Voucher Start Date", type: "Date" },
    { name: "voucherEndDate", label: "Voucher End Date", type: "Date" },
    {
      name: "voucherDescription",
      label: "Voucher Description",
      type: "string",
    },
    { name: "isGift", label: "Gift", type: "bool" },
    { name: "isDeleted", label: "Status", type: "bool" },
  ];

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
                onSubmit={(data) => console.log(data)}
                fields={model}
                title="Voucher Detail"
                initialData={formData}
                view={true}
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

export default VoucherDetail;
