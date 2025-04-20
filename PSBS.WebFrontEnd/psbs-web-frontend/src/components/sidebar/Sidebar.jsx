import React, { forwardRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";
import "./index.js";
import Tooltip from '@mui/material/Tooltip';
const Sidebar = forwardRef((_, ref) => {
  const location = useLocation();
  const token = sessionStorage.getItem("token");

  let isAdmin = false;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const role =
        decodedToken.role ||
        decodedToken.roleid ||
        decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if (role && role.toLowerCase() === "admin") {
        isAdmin = true;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }


  useEffect(() => {
    const isClosed = localStorage.getItem("sidebarClosed") === "true";
    if (isClosed && ref.current) {
      ref.current.classList.add("close");
    }
  }, [ref]);



  return (
    <div className="sidebar" ref={ref}>
      <a href="/dashboard" className="logo">
        <i className="bx bxs-cat"></i>
        <div className="logo-name">
          <span>Pet</span>Ease
        </div>
      </a>

      <ul className="side-menu">
        {/* Dashboard stays at the top */}
        <li className={location.pathname.startsWith("/report") ? "active" : ""}>
          <Link to="/report">
            <Tooltip title="Dashboard" placement="right">
              <i className="bx bxs-report"></i>
            </Tooltip>
            Dashboard
          </Link>
        </li>
        {/* Alphabetically sorted */}
        <li className={location.pathname.startsWith("/account") ? "active" : ""}>
          <Link to="/account">
            <Tooltip title="Accounts" placement="right">
              <i className="bx bxs-user-account"></i>
            </Tooltip>
            Accounts
          </Link>
        </li>

        <li className={location.pathname.startsWith("/bookings/") ? "active" : ""}>
          <Link to="/bookings/">
            <Tooltip title="Booking" placement="right">
              <i className='bx bx-receipt'></i>
            </Tooltip>
            Booking
          </Link>
        </li>

        {isAdmin && (
          <li className={/^\/camera(\/|$)/.test(location.pathname) ? "active" : ""}>
            <Link to="/camera">
              <Tooltip title="Camera" placement="right">
                <i className="bx bxs-camera"></i>
              </Tooltip>
              Camera
            </Link>
          </li>
        )}

        <li className={location.pathname.startsWith("/gifts") ? "active" : ""}>
          <Link to="/gifts">
            <Tooltip title="Gift" placement="right">
              <i className="bx bx-gift"></i>
            </Tooltip>
            Gift
          </Link>
        </li>
        {isAdmin && (
          <li className={location.pathname.startsWith("/notification") ? "active" : ""}>
            <Link to="/notification">
              <Tooltip title="Notification" placement="right">
                <i className="bx bx-bell"></i>
              </Tooltip>
              Notification
            </Link>
          </li>
        )}
        <li className={/^\/pet(\/|$)/.test(location.pathname) ? "active" : ""}>
          <Link to="/pet">
            <Tooltip title="Pet" placement="right">
              <i className="bx bxs-dog"></i>
            </Tooltip>
            Pet
          </Link>
        </li>

        <li className={/^\/pethealthbook(\/|$)/.test(location.pathname) ? "active" : ""}>
          <Link to="/pethealthbook">
            <Tooltip title="Pet HealthBook" placement="right">
              <i className="bx bxs-capsule"></i>
            </Tooltip>
            Pet HealthBook
          </Link>
        </li>
      
        <li className={location.pathname.startsWith("/room") ? "active" : ""}>
          <Link to="/room">
            <Tooltip title="Room" placement="right">
              <i className="bx bx-home-heart"></i>
            </Tooltip>
            Room
          </Link>
        </li>
        {isAdmin && (
          <li className={location.pathname.startsWith("/settings") ? "active" : ""}>
            <Link to="/settings">
              <Tooltip title="Settings" placement="right">
                <i className="bx bxs-dashboard"></i>
              </Tooltip>
              Settings
            </Link>
          </li>
        )}
        <li className={location.pathname.startsWith("/service") ? "active" : ""}>
          <Link to="/service">
            <Tooltip title="Service" placement="right">
              <i className="bx bx-store-alt"></i>
            </Tooltip>
            Service
          </Link>
        </li>
        {isAdmin && (
          <li className={location.pathname.startsWith("/vouchers") ? "active" : ""}>
            <Link to="/vouchers">
              <Tooltip title="Voucher" placement="right">
                <i className="bx bxs-coupon"></i>
              </Tooltip>
              Voucher
            </Link>
          </li>
        )}
      </ul>


      {/* Có thể thêm mục Logout nếu cần */}
      {/* <ul className="side-menu">
        <li>
          <a href="#" className="logout" onClick={handleLogout}>
            <i className="bx bx-log-out-circle"></i>
            Logout
          </a>
        </li>
      </ul> */}
    </div >
  );
});

export default Sidebar;
