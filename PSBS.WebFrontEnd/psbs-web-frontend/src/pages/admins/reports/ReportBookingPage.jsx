import React, { useRef, useState } from "react";
import ReportBookingStatusList from "../../../components/report/ReportBookingStatusList";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import ReportIncome from "../../../components/report/ReportIncome";
import ReportBookingServiceItem from "../../../components/report/ReportBookingServiceItem";
import ReportRoomHistory from "../../../components/report/ReportRoomHistory";
import ReportServiceType from "../../../components/report/ReportServiceType";
import ReportRoomStatusList from "../../../components/report/ReportRoomStatusList";
import ReportRoomType from "../../../components/report/ReportRoomType";
import ReportPet from "../../../components/report/ReportPet";
import ReportGeneral from "../../../components/report/ReportGeneral";
import useTimeStore from "../../../lib/timeStore";
import { format } from "date-fns";
import ReportAccountAmount from "../../../components/report/ReportAccountAmount";

const ReportBookingPage = () => {
  const sidebarRef = useRef(null);
  const { type, year, month, startDate, endDate, changeTime } = useTimeStore();

  const [reportType, setReportType] = useState("General");

  const selectedTypes = [
    "General",
    "Booking",
    "Service",
    "Room",
    "Customer",
    "Pet",
  ];

  const generateYears = () => {
    const currentYear = parseInt(format(new Date(), "yyyy"));
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  };

  const selectedYears = generateYears();
  const selectedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main className="p-6">
          {/* Header Section with Gradient Background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-6 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                <p className="text-blue-100 mt-1">
                  Comprehensive reports and insights for your pet service
                  business
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-medium">Report Type:</span>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="bg-white bg-opacity-20 border border-blue-300 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all"
                >
                  {selectedTypes.map((item) => (
                    <option key={item} value={item} className="text-gray-800">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {reportType !== "General" && (
              <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <select
                    value={type}
                    onChange={(e) =>
                      changeTime(
                        e.target.value,
                        year,
                        month,
                        startDate,
                        endDate
                      )
                    }
                    className="bg-white bg-opacity-20 border border-blue-300 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  >
                    <option value="year" className="text-gray-800">
                      By year
                    </option>
                    <option value="month" className="text-gray-800">
                      By month
                    </option>
                    <option value="day" className="text-gray-800">
                      By a specific time
                    </option>
                  </select>

                  {type === "year" && (
                    <select
                      value={year}
                      onChange={(e) =>
                        changeTime(
                          type,
                          e.target.value,
                          month,
                          startDate,
                          endDate
                        )
                      }
                      className="bg-white bg-opacity-20 border border-blue-300 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    >
                      {selectedYears.map((item) => (
                        <option
                          key={item}
                          value={item}
                          className="text-gray-800"
                        >
                          {item}
                        </option>
                      ))}
                    </select>
                  )}

                  {type === "month" && (
                    <>
                      <select
                        value={year}
                        onChange={(e) =>
                          changeTime(
                            type,
                            e.target.value,
                            month,
                            startDate,
                            endDate
                          )
                        }
                        className="bg-white bg-opacity-20 border border-blue-300 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                      >
                        {selectedYears.map((item) => (
                          <option
                            key={item}
                            value={item}
                            className="text-gray-800"
                          >
                            {item}
                          </option>
                        ))}
                      </select>

                      <select
                        value={month}
                        onChange={(e) =>
                          changeTime(
                            type,
                            year,
                            e.target.value,
                            startDate,
                            endDate
                          )
                        }
                        className="bg-white bg-opacity-20 border border-blue-300 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                      >
                        {selectedMonths.map((item) => (
                          <option
                            key={item}
                            value={item}
                            className="text-gray-800"
                          >
                            {item}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  {type === "day" && (
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-100">From:</span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) =>
                            changeTime(type, "", "", e.target.value, endDate)
                          }
                          className="bg-white bg-opacity-20 border border-blue-300 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-blue-100">To:</span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) =>
                            changeTime(type, "", "", startDate, e.target.value)
                          }
                          className="bg-white bg-opacity-20 border border-blue-300 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Report Content Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 transition-all duration-300">
            {reportType === "General" && (
              <div className="space-y-6">
                <div className="flex justify-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 px-6 py-2 border-b-2 border-blue-500 inline-block">
                    General Key Metrics
                  </h2>
                </div>
                <ReportGeneral />
              </div>
            )}

            {reportType === "Booking" && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg p-6">
                  <div className="flex justify-center mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      Total Revenue of Bookings
                    </h2>
                  </div>
                  <ReportIncome />
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex justify-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 px-6 py-2 border-b-2 border-blue-500 inline-block">
                      Number of Bookings by Status
                    </h2>
                  </div>
                  <ReportBookingStatusList />
                </div>
              </div>
            )}

            {reportType === "Service" && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex justify-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 px-6 py-2 border-b-2 border-blue-500 inline-block">
                      Number of Bookings by Service
                    </h2>
                  </div>
                  <div className="justify-center">
                    <ReportBookingServiceItem />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex justify-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 px-6 py-2 border-b-2 border-blue-500 inline-block">
                      Number of Services by Service Type
                    </h2>
                  </div>
                  <div className="justify-center">
                    <ReportServiceType />
                  </div>
                </div>
              </div>
            )}

            {reportType === "Room" && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex justify-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 px-6 py-2 border-b-2 border-blue-500 inline-block">
                      Number of Bookings by Room Type
                    </h2>
                  </div>
                  <div className="justify-center">
                    <ReportRoomHistory />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex justify-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 px-6 py-2 border-b-2 border-blue-500 inline-block">
                      Number of Rooms by Room Type
                    </h2>
                  </div>
                  <div className="justify-center">
                    <ReportRoomType />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex justify-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 px-6 py-2 border-b-2 border-blue-500 inline-block">
                      Number of Room by Status
                    </h2>
                  </div>
                  <ReportRoomStatusList />
                </div>
              </div>
            )}

            {reportType === "Customer" && (
              <div>
                <ReportAccountAmount />
              </div>
            )}

            {reportType === "Pet" && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex justify-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 px-6 py-2 border-b-2 border-blue-500 inline-block">
                    Service Booking Rate by Pet Breed
                  </h2>
                </div>

                <div className="flex justify-center">
                  <ReportPet />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportBookingPage;
