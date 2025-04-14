import React, { useRef } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import { Link } from "react-router-dom";
import Tooltip from '@mui/material/Tooltip';
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
            <i class='bx bx-receipt'></i>
              <span className="info">
                <h3>Setting</h3>
                <p> Booking Type</p>
              </span>
            </li>
            </Link>
            <Link to="/settings/bookingStatus">
            <li className="second">
            <i class='bx bx-receipt'></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Booking Status</p>
              </span>
            </li>
            </Link>
            <Link to="/settings/paymentType">
            <li className="third">
            <i class='bx bx-money' ></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Payment Type</p>
              </span>
            </li>
            </Link>
             <Link to="/settings/pointRule">
             <li className="fourth">
             <i class='bx bx-coin'></i>
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
             <i class='bx bx-home-heart' ></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Room Type</p>
              </span>
            </li>
            </Link>
            <Link to="/petType">
             <li className="third">
             <i class='bx bxs-dog' ></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Pet Type</p>
              </span>
            </li>
            </Link>
            <Link to="/petBreed">
             <li className="third">
             <i class='bx bxs-dog' ></i>
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
           <i class='bx bx-plus-medical' ></i>
            <span className="info">
              <h3>Setting</h3>
              <p>Treatment</p>
            </span>
          </li>
          </Link>         
          <Link to="/medicines">
           <li className="second">
           <i class='bx bxs-capsule' ></i>
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
