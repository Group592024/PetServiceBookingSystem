import React, { useRef } from "react";
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import CustomerBookingDatatable from "../../../../components/Booking/datatable/CustomerBookingDatatable";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";

const CustomerBookingList = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const handleNewButtonClick = () => {
    navigate("/customer/bookings/new");
  };

  return (
    <div className="list">
      <NavbarCustomer />
      <div className="listContainer">
        <main className="p-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-semibold">Booking List</h2>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNewButtonClick}
                className="flex items-center px-5 py-2.5 text-sm font-medium text-blue-700 border border-blue-700 rounded-lg hover:text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New
              </button>
            </div>
          </div>
          <CustomerBookingDatatable />
        </main>
      </div>
    </div>
  );
};


export default CustomerBookingList
