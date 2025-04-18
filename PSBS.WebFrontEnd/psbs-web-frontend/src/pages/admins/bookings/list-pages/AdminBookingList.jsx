import React, { useRef, useState } from "react";
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import AdminBookingDatatable from "../../../../components/Booking/datatable/AdminBookingDatatable";

const AdminBookingList = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [filterOptions, setFilterOptions] = useState({
    status: null,
    date: null
  });

  // Track active filters for UI highlighting
  const [activeDateFilter, setActiveDateFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");

  const handleNewButtonClick = () => {
    navigate("/bookings/new");
  };

  const handleDateFilterClick = (filterType) => {
    let newFilterOptions = { ...filterOptions };

    if (filterType === "all") {
      newFilterOptions.date = null;
      setActiveDateFilter("all");
    }
    else if (filterType === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      newFilterOptions.date = today;
      setActiveDateFilter("today");
    }

    setFilterOptions(newFilterOptions);
  };

  const handleStatusFilterClick = (filterType) => {
    let newFilterOptions = { ...filterOptions };

    if (filterType === "all") {
      newFilterOptions.status = null;
      setActiveStatusFilter("all");
    }
    else if (filterType === "checkedIn") {
      newFilterOptions.status = "Checked in";
      setActiveStatusFilter("checkedIn");
    }
    else if (filterType === "processing") {
      newFilterOptions.status = "Processing";
      setActiveStatusFilter("processing");
    }

    setFilterOptions(newFilterOptions);
  };

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="listContainer content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* Header with title and button in same line with proper justification */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Booking List</h2>
              <button
                type="button"
                onClick={handleNewButtonClick}
                className="flex items-center px-5 py-2.5 text-sm font-medium text-blue-700 border border-blue-700 rounded-lg hover:text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 transition-colors duration-200"
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

            {/* Filter groups */}
            <div className="flex flex-wrap gap-4 mb-6">
              {/* Date filter group */}
              <div className="filter-group">
                <span className="text-sm font-medium text-gray-700 mr-2">Type:</span>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    onClick={() => handleDateFilterClick("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg border border-gray-200 ${activeDateFilter === "all"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    All Bookings
                  </button>
                  <button
                    onClick={() => handleDateFilterClick("today")}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg border border-gray-200 ${activeDateFilter === "today"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                      } border-l-0`}
                  >
                    Today's Bookings
                  </button>
                </div>
              </div>

              {/* Status filter group */}
              <div className="filter-group">
                <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    onClick={() => handleStatusFilterClick("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg border border-gray-200 ${activeStatusFilter === "all"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleStatusFilterClick("checkedIn")}
                    className={`px-4 py-2 text-sm font-medium border border-gray-200 ${activeStatusFilter === "checkedIn"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                      } border-l-0`}
                  >
                    Checked In
                  </button>
                  <button
                    onClick={() => handleStatusFilterClick("processing")}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg border border-gray-200 ${activeStatusFilter === "processing"
                      ? "bg-yellow-600 text-white border-yellow-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                      } border-l-0`}
                  >
                    Processing
                  </button>
                </div>
              </div>
            </div>

            {/* DataTable contained within the same container */}
            <AdminBookingDatatable filterOptions={filterOptions} />
          </div>
        </main>
      </div>
    </div>
  );
};


export default AdminBookingList;
