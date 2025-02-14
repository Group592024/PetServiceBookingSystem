import React, { forwardRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./index.js";

const Sidebar = forwardRef((_, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

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
        <li
          className={location.pathname.startsWith("/dashboard") ? "active" : ""}
        >
          <Link to="/dashboard">
            <i className="bx bxs-dashboard"></i>
            Dashboard
          </Link>
        </li>
        <li
          className={location.pathname.startsWith("/service") ? "active" : ""}
        >
          <Link to="/service">
            <i className="bx bx-store-alt"></i>
            Service
          </Link>
        </li>
        <li
          className={
            location.pathname.startsWith("/pethealthbook") ? "active" : ""
          }
        >
          <Link to="/pethealthbook">
            <i className="bx bxs-capsule"></i>
            PetHealthBook
          </Link>
        </li>
        <li
          className={location.pathname.startsWith("/account") ? "active" : ""}
        >
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
        <li className={location.pathname.startsWith("/pet") ? "active" : ""}>
          <Link to="/pet">
            <i className="bx bxs-dog"></i>
            Pet
          </Link>
        </li>
        <li className={location.pathname.startsWith("/gift") ? "active" : ""}>
          <Link to="/gift">
            <i className="bx bx-gift"></i>
            Gift
          </Link>
        </li>
        <li
          className={location.pathname.startsWith("/vouchers") ? "active" : ""}
        >
          <Link to="/vouchers">
            <i className="bx bxs-coupon"></i>
            Voucher
          </Link>
        </li>
        <li
          className={location.pathname.startsWith("/petType") ? "active" : ""}
        >
          <Link to="/petType">
            <i className="bx bxs-cat"></i>
            Pet Type
          </Link>
        </li>
      </ul>

      <ul className="side-menu">
        <li>
          <a href="#" className="logout" onClick={handleLogout}>
            <i className="bx bx-log-out-circle"></i>
            Logout
          </a>
        </li>
      </ul>
    </div>
  );
});

export default Sidebar;
