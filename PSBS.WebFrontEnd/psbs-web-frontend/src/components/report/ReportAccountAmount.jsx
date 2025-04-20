import React, { useEffect, useState } from "react";
import useTimeStore from "../../lib/timeStore";
import Datatable from "../services/Datatable";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import formatCurrency from "../../Utilities/formatCurrency.js";
import { useNavigate } from 'react-router-dom';

const ReportAccountAmount = () => {
  const navigate = useNavigate();
  const [dtos, setDtos] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const { type, year, month, startDate, endDate } = useTimeStore();

  const [accounts, setAccounts] = useState([]);

  const fetchAccounts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/ReportAccount/countCustomers",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();
      const result = response.data;
      setAccounts(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccountAmount = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      let url = "http://localhost:5050/api/ReportBooking/accountAmount?";

      if (type === "all") url = "http://localhost:5050/api/ReportBooking/accountAmount";
      if (type === "year") url += `year=${year}`;
      if (type === "month") url += `year=${year}&month=${month}`;
      if (type === "day") url += `startDate=${startDate}&endDate=${endDate}`;
      const fetchData = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!fetchData.ok) {
        setDtos([]);
        setData([]);
      } else {
        const response = await fetchData.json();
        const result = response.data;
        setDtos(result);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountAmount();
  }, [type, year, month, startDate, endDate]);

  useEffect(() => {
    // Only run when both dtos and accounts are ready
    if (dtos.length === 0 || accounts.length === 0) return;

    const accountMap = new Map();
    accounts.forEach((account) => {
      accountMap.set(account.accountId, account.accountName);
    });

    const report = dtos.map((dto, index) => ({
      id: index + 1,
      accountId: dto.accountId,
      accountName: accountMap.get(dto.accountId) || "Unknown",
      totalAmount: dto.totalAmount,
      bookings: dto.bookings,
      completedBookings: dto.completedBookings,
      cancelBookings: dto.cancelBookings

    }));

    // Calculate total revenue
    const total = report.reduce((sum, item) => sum + item.totalAmount, 0);
    setTotalRevenue(total);

    setData(report);
  }, [dtos, accounts]);

  // Find top spender
  const topSpender =
    data.length > 0
      ? data.reduce((prev, current) =>
        prev.totalAmount > current.totalAmount ? prev : current
      )
      : null;

  const handleViewCustomerDetails = (accountId) => {
    navigate(`/profile/${accountId}`);
  };

  const columns = [
    {
      field: "id",
      headerName: "No.",
      width: 70,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "accountName",
      headerName: "Customer Name",
      flex: 1,
      minWidth: 200,
      align: "left",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <PeopleAltIcon className="text-blue-500" fontSize="small" />
          <span>{params.value}</span>
        </div>
      ),
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      flex: 1,
      minWidth: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div
          className={`flex items-center gap-1 px-3 ${params.value > 1000000
            ? "text-green-700 border-green-500 bg-green-50"
            : "text-blue-700 border-blue-500 bg-blue-50"
            }`}
        >
          <AccountBalanceWalletIcon fontSize="small" />
          <span>{formatCurrency(params.value)}</span>
        </div>
      ),
    },
    {
      field: "bookings",
      headerName: "Total Bookings",
      flex: 1,
      minWidth: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 px-3 py-1.5  bg-blue-50 text-blue-700 font-medium shadow-sm border border-blue-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>{params.value}</span>
        </div>
      ),
    },
    {
      field: "completedBookings",
      headerName: "Completed Bookings",
      flex: 1,
      minWidth: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className={`flex items-center justify-center gap-2 px-3 py-1.5 font-medium shadow-sm transition-all ${params.value >= 3
          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
          : "bg-gray-50 text-gray-600 border border-gray-200"
          }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{params.value}</span>

        </div>
      ),
    },
    {
      field: "cancelBookings",
      headerName: "Canceled Bookings",
      flex: 1,
      minWidth: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className={`flex items-center justify-center gap-2 px-3 py-1.5 font-medium shadow-sm transition-all ${params.value >= 3
          ? "bg-red-100 text-red-700 border border-red-300"
          : "bg-gray-50 text-gray-600 border border-gray-200"
          }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{params.value}</span>

        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <button
          onClick={() => handleViewCustomerDetails(params.row.accountId)}
          className="flex items-center justify-center gap-1.5 px-2 bg-gradient-to-r from-blue-500 to-blue-300 font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>View Account</span>
        </button>
      ),
    }
  ];

  const getTimeRangeText = () => {
    if (type === "year") return `Year ${year}`;
    if (type === "month") return `${month}/${year}`;
    if (type === "day") return `${startDate} to ${endDate}`;
    return "";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Customer Spending Report</h1>
        <p className="text-blue-100">{getTimeRangeText()}</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center py-16 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-500 italic">
              No data available for this period
            </p>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-4 text-white shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Total Customers</p>
                    <p className="text-3xl font-bold">{data.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-xl p-4 text-white shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-green-400 bg-opacity-30 rounded-full mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-100 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top spender highlight */}
            {topSpender && (
              <div className="mb-6 p-4 border border-dashed border-amber-500 bg-amber-50 rounded-lg">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-amber-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-amber-800 font-medium">
                    Top Spender:{" "}
                    <span className="font-bold">{topSpender.accountName}</span>{" "}
                    ({formatCurrency(topSpender.totalAmount)})
                  </p>
                </div>
              </div>
            )}

            {/* Table section */}
            <div className="bg-white rounded-xl shadow border border-gray-100">
              <div className="border-b border-gray-100 p-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Customer Spending Details
                </h2>
              </div>
              <div className="p-1">
                <Datatable
                  columns={columns}
                  data={data}
                  pageSize={5}
                  pageSizeOptions={[5, 10, 15]}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportAccountAmount;
