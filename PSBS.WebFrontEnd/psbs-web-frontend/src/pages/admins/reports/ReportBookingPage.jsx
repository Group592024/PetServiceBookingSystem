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

const ReportBookingPage = () => {
  const sidebarRef = useRef(null);
  const { type, year, month, startDate, endDate, changeTime } = useTimeStore();

  const [reportType, setReportType] = useState("General");

  const selectedTypes = ["General", "Booking", "Service", "Room", "Pet"];

  const generateYears = () => {
    for (var i = 1; i <= 10; i++) {
      const currentYear = parseInt(format(new Date(), "yyyy"));
      return Array.from({ length: 10 }, (_, i) => currentYear - i);
    }
  };

  const selectedYears = generateYears();
  const selectedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="">
      <Sidebar ref={sidebarRef} />
      <div class="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="header">
            <div className="left mb-3">
              <p className="text-xl text-customDark font-bold">
                Report For{" "}
                <span className="text-customPrimary">
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="p-2 rounded-xl"
                  >
                    {selectedTypes.map((item) => (
                      <option value={item}>{item}</option>
                    ))}
                  </select>
                </span>
              </p>
            </div>

            {reportType !== "General" && (
              <div className="mb-2">
                <select
                  value={type}
                  onChange={(e) =>
                    changeTime(e.target.value, year, month, startDate, endDate)
                  }
                  className="p-2 rounded-xl"
                >
                  <option value="year">By year</option>
                  <option value="month">By month</option>
                  <option value="day">By a specific time</option>
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
                    className="ml-3 p-2 rounded-xl"
                  >
                    {selectedYears.map((item) => (
                      <option value={item}>{item}</option>
                    ))}
                  </select>
                )}

                {type === "month" && (
                  <div className="mt-3">
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
                      className="p-2 rounded-xl"
                    >
                      {selectedYears.map((item) => (
                        <option value={item}>{item}</option>
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
                      className="ml-3 p-2 rounded-xl"
                    >
                      {selectedMonths.map((item) => (
                        <option value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                )}

                {type === "day" && (
                  <div className="mt-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) =>
                        changeTime(type, "", "", e.target.value, endDate)
                      }
                      className="p-2 rounded-xl"
                    />

                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) =>
                        changeTime(type, "", "", startDate, e.target.value)
                      }
                      className="ml-3 p-2 rounded-xl"
                    />
                  </div>
                )}
                {console.log(type)}
                {console.log(year)}
                {console.log(month)}
                {console.log(startDate)}
                {console.log(endDate)}
                {console.log(endDate)}
              </div>
            )}
          </div>

          {reportType === "General" && (
            <div className="p-3 rounded-3xl bg-neutral-200">
              <div className="mb-5">
                <div className="flex justify-center">
                  <p className="text-2xl font-bold rounded-lg  p-3">
                    General key metrics
                  </p>
                </div>
                <ReportGeneral />
              </div>
            </div>
          )}

          {reportType === "Booking" && (
            <div className="p-3 rounded-3xl bg-neutral-200">
              <div className="mb-3">
                <div className="p-3 bg-neutral-600 rounded-3xl">
                  <div className="flex justify-center">
                    <p className="text-2xl font-bold rounded-lg text-white p-3">
                      Total revenue of bookings
                    </p>
                  </div>
                  <ReportIncome />
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-center">
                  <p className="text-2xl font-bold rounded-lg  p-3">
                    Number of bookings by status
                  </p>
                </div>

                <ReportBookingStatusList />
              </div>
            </div>
          )}
          {reportType === "Service" && (
            <div className="p-3 rounded-3xl bg-neutral-200">
              <div className="mb-5">
                <div className="flex justify-center items-center">
                  <div>
                    <div className="flex justify-center">
                      <p className="text-2xl font-bold rounded-lg  p-3">
                        Number of bookings by service
                      </p>
                    </div>
                    <ReportBookingServiceItem />
                  </div>
                </div>
              </div>
              <div className="mb-5">
                <div className="flex justify-center">
                  <p className="text-2xl font-bold rounded-lg  p-3">
                    Number of services by service type
                  </p>
                </div>
                <div className="flex justify-center">
                  <ReportServiceType />
                </div>
              </div>
            </div>
          )}
          {reportType === "Room" && (
            <div className="p-3 rounded-3xl bg-neutral-200">
              <div className="mb-5">
                <div className="flex justify-center items-center">
                  <div>
                    <div className="flex justify-center">
                      <p className="text-2xl font-bold rounded-lg  p-3">
                        Number of bookings by room type
                      </p>
                    </div>
                    <ReportRoomHistory />
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-center">
                  <p className="text-2xl font-bold rounded-lg  p-3">
                    Number of rooms by room type
                  </p>
                </div>
                <div className="flex justify-center">
                  <ReportRoomType />
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-center">
                  <p className="text-2xl font-bold rounded-lg  p-3">
                    Number of room by status
                  </p>
                </div>
                <ReportRoomStatusList />
              </div>
            </div>
          )}

          {reportType === "Pet" && (
            <div className="p-3 rounded-3xl bg-neutral-200">
              <div className="mb-5">
                <div className="flex justify-center">
                  <p className="text-2xl font-bold rounded-lg  p-3">
                    Service booking rate by pet breed{" "}
                    <span className="italic text-xl">
                      {" "}
                      (unit: number of pets)
                    </span>
                  </p>
                </div>
                <div className="flex justify-center">
                  <ReportPet />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReportBookingPage;
