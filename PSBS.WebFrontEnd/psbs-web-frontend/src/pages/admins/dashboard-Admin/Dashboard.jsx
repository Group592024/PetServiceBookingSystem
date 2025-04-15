import React, { useRef,useMemo } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import { Link } from "react-router-dom";
import Tooltip from '@mui/material/Tooltip';
import jwtDecode from "jwt-decode";
const Dashboard = () => {
  const sidebarRef = useRef(null);
  const userToken = sessionStorage.getItem("token");
  console.log(userToken);
  const userRole = useMemo(() => {
    if (!userToken) {
      return null;
    }
    const decodedToken = jwtDecode(userToken);
    console.log(decodedToken);
    return (
      decodedToken?.role ||
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ]
    );
  }, [userToken]);

  if (userRole === "staff") {
    return (
      <div className="dashboard">
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main className="flex items-center justify-center min-h-[calc(100vh-56px)]"> {/* Adjust 56px based on your navbar height */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 mx-auto max-w-4xl">
            <div className="welcome-message flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-4xl font-bold flex items-center space-x-2">
              <h2>Welcome to   <i className="bx bxs-cat text-blue-600 text-5xl"></i> <span className="text-gray-800">Pet</span>
        <span className="text-blue-600">Ease</span> Dashboard 
      </h2>
    </div>
    <p className="text-gray-600 text-lg max-w-2xl">
      Your one-stop solution for managing pet care services with ease and efficiency
    </p>
              <div className="mt-6">
                <div className="bg-blue-50 p-4 rounded-full animate-pulse">
                  <svg
                    className="w-12 h-12 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    >
                    </path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="header">
            <div className="left">
              <h1>Dashboard</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Settings</a>
                </li>
                /
                <li>
                  <a href="#">Sub-Table in Booking</a>
                </li>
              </ul>
            </div>
            <a href="#" className="report">
              <i className="bx bx-cloud-download"></i>
              <span>Download CSV</span>
            </a>
          </div>
          <ul className="insights">
            <Link to="/settings/bookingType">
              <li className="first">
                <i className='bx bx-receipt'></i>
                <span className="info">
                  <h3>Setting</h3>
                  <p> Booking Type</p>
                </span>
              </li>
            </Link>
            <Link to="/settings/bookingStatus">
              <li className="second">
                <i className='bx bx-receipt'></i>
                <span className="info">
                  <h3>Setting</h3>
                  <p>Booking Status</p>
                </span>
              </li>
            </Link>
            <Link to="/settings/paymentType">
              <li className="third">
                <i className='bx bx-money' ></i>
                <span className="info">
                  <h3>Setting</h3>
                  <p>Payment Type</p>
                </span>
              </li>
            </Link>
            <Link to="/settings/pointRule">
              <li className="fourth">
                <i className='bx bx-coin'></i>
                <span className="info">
                  <h3>Setting</h3>
                  <p>Point Rule</p>
                </span>
              </li>
            </Link>
          </ul>
          <div className="header">
            <div className="left">
              <ul className="breadcrumb">
                <li>
                  <a href="#">Settings</a>
                </li>
                /
                <li>
                  <a href="#">Sub-Table in Facilitiy</a>
                </li>
              </ul>
            </div>
          </div>
          <ul className="insights">
            <Link to="/settings/servicetypes">
              <li className="first">
                <i className="bx bx-store-alt"></i>
                <span className="info">
                  <h3>Setting</h3>
                  <p>Service Type</p>
                </span>
              </li>
            </Link>
            <Link to="/settings/roomtypes">
              <li className="second">
                <i className='bx bx-home-heart' ></i>
                <span className="info">
                  <h3>Setting</h3>
                  <p>Room Type</p>
                </span>
              </li>
            </Link>
            <Link to="/petType">
              <li className="third">
                <i className='bx bxs-dog' ></i>
                <span className="info">
                  <h3>Setting</h3>
                  <p>Pet Type</p>
                </span>
              </li>
            </Link>
            <Link to="/petBreed">
              <li className="third">
                <i className='bx bxs-dog' ></i>
                <span className="info">
                  <h3>Setting</h3>
                  <p>Pet Breed</p>
                </span>
              </li>
            </Link>
          </ul>

          <div className="header">
            <div className="left">
              <ul className="breadcrumb">
                <li>
                  <a href="#">Settings</a>
                </li>
                /
                <li>
                  <a href="#">Sub-Table in HealCare</a>
                </li>
              </ul>
            </div>
          </div>
          <ul className="insights">
            <Link to="/settings/treatments">
              <li className="first">
                <i className='bx bx-plus-medical' ></i>
                <span className="info">
                  <h3>Setting</h3>
                  <p>Treatment</p>
                </span>
              </li>
            </Link>
            <Link to="/medicines">
              <li className="second">
                <i className='bx bxs-capsule' ></i>
                <span className="info">
                  <h3>Setting</h3>
                  <p>Medicine</p>
                </span>
              </li>
            </Link>
          </ul>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;