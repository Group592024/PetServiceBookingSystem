import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Navbar = ({ sidebarRef }) => {
  const [accountName, setAccountName] = useState(null);
  const [accountImage, setAccountImage] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      const decodedToken = jwt_decode(token);
      setAccountName(decodedToken.AccountName);
      setAccountImage(decodedToken.AccountImage);
      setAccountId(decodedToken.AccountId);

      if (decodedToken.AccountImage) {
        fetch(
          `http://localhost:5050/api/Account/loadImage?filename=${decodedToken.AccountImage}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Thêm token vào header
            },
          }
        )
          .then((response) => {
            if (!response.ok)
              throw new Error(
                `Failed to load image, Status: ${response.status}`
              );
            return response.json();
          })
          .then((imageData) => {
            if (imageData.flag) {
              const imgContent = imageData.data.fileContents;
              const imgContentType = imageData.data.contentType;
              setImagePreview(`data:${imgContentType};base64,${imgContent}`);
            } else {
              console.error("Error loading image:", imageData.message);
            }
          })
          .catch((error) => console.error("Error fetching image:", error));
      }
    }
  }, []);

  const handleMenuClick = () => {
    if (sidebarRef.current) {
      const isClosed = sidebarRef.current.classList.toggle("close");
      localStorage.setItem("sidebarClosed", isClosed);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
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
    <div className="nav">
      <i className="bx bx-menu" onClick={handleMenuClick}></i>
      <form action="#">
        <div className="form-input">
          <input type="search" placeholder="Search..." />
          <button className="search-btn" type="submit">
            <i className="bx bx-search"></i>
          </button>
        </div>
      </form>
      <input type="checkbox" id="theme-toggle" hidden />
      <label htmlFor="theme-toggle"></label>
      <a href="chat" className="notifications">
        <i className="bx bx-message-square-dots"></i>
        <span className="count">12</span>
      </a>

      <div className="navbar-profile" onClick={toggleDropdown}>
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Profile Avatar"
            className="profile-avatar"
          />
        ) : (
          <img
            src="/avatar.png"
            alt="Profile Avatar"
            className="profile-avatar"
          />
        )}
        {dropdownVisible && (
          <div className="dropdown-menu">
            <ul>
              <li>{accountName || "User"}</li>
              <li>
                <a href={`/profile/${accountId}`}>View Profile</a>
              </li>
              <li onClick={handleLogout}>Logout</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
