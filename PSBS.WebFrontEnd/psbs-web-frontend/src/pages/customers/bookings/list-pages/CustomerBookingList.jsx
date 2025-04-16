// CustomerBookingList.js
import React from "react";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";
import { useNavigate } from "react-router-dom";
import CustomerBookingDatatable from "../../../../components/Booking/datatable/CustomerBookingDatatable"; 

const CustomerBookingList = () => {
    const navigate = useNavigate();
  
    const handleNewBooking = () => {
        navigate("/customer/bookings/new"); 
    };
  
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
            <NavbarCustomer />
            <div className="container mx-auto px-6 py-8">
                {/* Enhanced Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                            Your Booking History
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Manage and view all your service appointments
                        </p>
                    </div>
                    {/* New Booking Button */}
                    <button
                        onClick={handleNewBooking}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                                 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 
                                 flex items-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Booking
                    </button>
                </div>
                <CustomerBookingDatatable />
            </div>
        </div>
    );
};

export default CustomerBookingList;