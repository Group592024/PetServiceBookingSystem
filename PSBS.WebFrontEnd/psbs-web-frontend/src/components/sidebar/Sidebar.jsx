import React, { forwardRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
import "./index.js";

const Sidebar = forwardRef((_, ref) => {
  const navigate = useNavigate();
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

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure? You want to log out?",
      text: "You are about to log out from your account. Make sure you have saved your progress.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#4CD630FF",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("userData");
        sessionStorage.removeItem("userData");

        Swal.fire({
          title: "Logged out",
          text: "You have been logged out successfully!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/login", { replace: true });
        });
      }
    });
  };

  return (
    <div className="sidebar" ref={ref}>
      <a href="#" className="logo">
        <i className="bx bxs-cat"></i>
        <div className="logo-name">
          <span>Pet</span>Ease
        </div>
      </a>

      <ul className="side-menu">
        <li className={location.pathname.startsWith("/dashboard") ? "active" : ""}>
          <Link to="/dashboard">
            <i className="bx bxs-dashboard"></i>
            Dashboard
          </Link>
        </li>

        <li className={location.pathname.startsWith("/report") ? "active" : ""}>
          <Link to="/report">
            <i className="bx bxs-report"></i>
            Reports
          </Link>
        </li>

        <li className={location.pathname.startsWith("/admin/bookings/") ? "active" : ""}>
          <Link to="/admin/bookings/">
            <i className="bx bxs-book-content"></i>
            Booking
          </Link>
        </li>
        <li className={location.pathname.startsWith("/service") ? "active" : ""}>
          <Link to="/service">
            <i className="bx bx-store-alt"></i>
            Service
          </Link>
        </li>
        <li className={/^\/pet(\/|$)/.test(location.pathname) ? "active" : ""}>
          <Link to="/pet">
            <i className="bx bxs-dog"></i>
            Pet
          </Link>
        </li>
        <li className={location.pathname.startsWith("/account") ? "active" : ""}>
          <Link to="/account">
            <i className="bx bxs-user-account"></i>
            Accounts
          </Link>
        </li>
        <li className={location.pathname.startsWith("/room") ? "active" : ""}>
          <Link to="/room">
            <i className="bx bx-home-heart"></i>
            Room
          </Link>
        </li>
        {isAdmin && (
          <li className={/^\/cameralist(\/|$)/.test(location.pathname) ? "active" : ""}>
            <Link to="/cameralist">
              <i className="bx bxs-camera"></i>
              Camera
            </Link>
          </li>
        )}
        <li className={/^\/pethealthbook(\/|$)/.test(location.pathname) ? "active" : ""}>
          <Link to="/pethealthbook">
            <i className="bx bxs-capsule"></i>
            PetHealthBook
          </Link>
        </li>
        <li className={location.pathname.startsWith("/gifts") ? "active" : ""}>
          <Link to="/gifts">
            <i className="bx bx-gift"></i>
            Gift
          </Link>
        </li>
        <li className={location.pathname.startsWith("/vouchers") ? "active" : ""}>
          <Link to="/vouchers">
            <i className="bx bxs-coupon"></i>
            Voucher
          </Link>
        </li>
        <li className={location.pathname.startsWith("/notification") ? "active" : ""}>
          <Link to="/notification">
            <i className="bx bx-bell"></i>
            Notification
          </Link>
        </li>
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
    </div>
  );
});

export default Sidebar;
