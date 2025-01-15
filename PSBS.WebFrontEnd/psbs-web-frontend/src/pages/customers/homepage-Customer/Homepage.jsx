import React from "react";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import { Link } from "react-router-dom";
const Homepage = () => {
  return (
    <div>
      <NavbarCustomer />

      <div className="content">
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
                  <a href="#">Sub-Table in Bookings</a>
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
            <i class='bx bx-cog'></i>
              <span className="info">
                <h3>Setting</h3>
                <p> Booking Type</p>
              </span>
            </li>
            </Link>
            <Link to="/settings/bookingStatus">
            <li className="second">
            <i class='bx bxs-cog' ></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Booking Status</p>
              </span>
            </li>
            </Link>
            <Link to="/settings/paymentType">
            <li className="third">
            <i class='bx bx-cog'></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Payment Type</p>
              </span>
            </li>
            </Link>
             <Link to="/settings/pointRule">
             <li className="fourth">
             <i class='bx bxs-cog' ></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Point Rule</p>
              </span>
            </li>
            </Link>
            <Link to="/settings/treatments">
             <li className="fifth">
            <i className="bx bx-calendar-check"></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Treatment</p>
              </span>
            </li>
            </Link>
            <Link to="/settings/servicetypes">
             <li className="sixth">
            <i className="bx bx-calendar-check"></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Service Type</p>
              </span>
            </li>
            </Link>
            <Link to="/settings/roomtypes">
             <li className="seventh">
            <i className="bx bx-calendar-check"></i>
              <span className="info">
                <h3>Setting</h3>
                <p>Room Type</p>
              </span>
            </li>
            </Link>
          </ul>
        </main>
      </div>
    </div>
  );
};

export default Homepage;
