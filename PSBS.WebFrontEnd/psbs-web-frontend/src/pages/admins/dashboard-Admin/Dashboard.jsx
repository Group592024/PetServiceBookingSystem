import React, { useRef } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import { Link } from "react-router-dom";
const Dashboard = () => {
  const sidebarRef = useRef(null);
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
                  <a href="#">Analytics</a>
                </li>
                /
                <li>
                  <a href="#">Shop</a>
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
            <i className="bx bx-calendar-check"></i>
              <span className="info">
                <h3>Setting</h3>
                <p> Booking Type</p>
              </span>
            </li>
            </Link>
            <Link to="/settings/bookingStatus">
            <li className="second">
            <i className="bx bx-calendar-check"></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Booking Status</p>
              </span>
            </li>
            </Link>
            <Link to="/settings/paymentType">
            <li className="third">
            <i className="bx bx-calendar-check"></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Payment Type</p>
              </span>
            </li>
            </Link>
             <Link to="/settings/pointRule">
             <li className="fourth">
            <i className="bx bx-calendar-check"></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Point Rule</p>
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
