import React, { useRef } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
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
            <li>
              <i className="bx bx-calendar-check"></i>
              <span className="info">
                <h3>1,074</h3>
                <p>Paid Order</p>
              </span>
            </li>
            <li>
              <i className="bx bx-calendar-check"></i>
              <span className="info">
                <h3>1,074</h3>
                <p>Paid Order</p>
              </span>
            </li>
            <li>
              <i className="bx bx-calendar-check"></i>
              <span className="info">
                <h3>1,074</h3>
                <p>Paid Order</p>
              </span>
            </li>
            <li>
              <i className="bx bx-calendar-check"></i>
              <span className="info">
                <h3>1,074</h3>
                <p>Paid Order</p>
              </span>
            </li>
          </ul>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
