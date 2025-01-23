import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2"; // Import SweetAlert2
import "./style.css";

const NavbarCustomer = () => {
  const [accountName, setAccountName] = useState("Admin");
  const [accountImage, setAccountImage] = useState(
    "https://i.pinimg.com/736x/48/4c/c6/484cc69755c6b5daa6b31e720d848629.jpg"
  );
  const [accountId, setAccountId] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      const decodedToken = jwt_decode(token);
      const { AccountName, AccountImage, AccountId } = decodedToken;

      setAccountName(AccountName || "Admin");
      setAccountId(AccountId);

      if (AccountImage) {
        fetch(`http://localhost:5000/api/Account/loadImage?filename=${AccountImage}`)
          .then((response) => response.json())
          .then((imageData) => {
            if (imageData.flag) {
              const imgContent = imageData.data.fileContents;
              const imgContentType = imageData.data.contentType;
              setAccountImage(`data:${imgContentType};base64,${imgContent}`);
            } else {
              console.error("Error loading image:", imageData.message);
            }
          })
          .catch((error) => console.error("Error fetching image:", error));
      }
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleViewProfile = () => {
    navigate(`/profilecustomer/${accountId}`);
  };

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
        // Remove token and user data from storage
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("userData");
        sessionStorage.removeItem("userData");

        // Show success message and redirect to login page
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
    <div className="navbarCustomer">
      <a href="#" className="logo">
        <i className="bx bxs-cat"></i>
        <div className="logo-name">
          <span>Pet</span>Ease
        </div>
      </a>

      <div className="navbar-central">
        <form action="#">
          <div className="form-input">
            <input type="search" placeholder="Search..." />
            <button className="search-btn" type="submit">
              <i className="bx bx-search"></i>
            </button>
          </div>
        </form>

        <ul className="navbar-links">
          <li>
            <a href="#">
              <i className="bx bx-store-alt"></i>
              Service
            </a>
          </li>
          <li>
            <a href="#">
              <i className="bx bx-home-heart"></i>
              Room
            </a>
          </li>
          <li>
            <a href="#">
              <i className="bx bxs-webcam"></i>
              Camera
            </a>
          </li>
          <li>
            <a href="/pethealthbookcus">
              <i className="bx bxs-dog"></i>
              Pet
            </a>
          </li>
          <li>
            <a href="#">
              <i className="bx bx-gift"></i>
              Gift
            </a>
          </li>
          <li>
            <a href="#">
              <i className="bx bx-wallet"></i>
              Voucher
            </a>
          </li>
          
        </ul>
      </div>
      <div><li><a>{accountName}</a></li></div>
      <div className="navbar-profile" onClick={toggleDropdown}>
        <img
          src={accountImage}
          alt="Profile Avatar"
          className="profile-avatar"
        />

        {dropdownVisible && (
          <div className="dropdown-menu">
            <ul>
              
              <li onClick={handleViewProfile}>View Profile</li>
              <li onClick={handleLogout}>Logout</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarCustomer;
