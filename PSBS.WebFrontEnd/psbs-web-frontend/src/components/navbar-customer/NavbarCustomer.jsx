import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import "./style.css";

const NavbarCustomer = () => {
  const [accountName, setAccountName] = useState("Admin"); // Tên mặc định là Admin
  const [accountImage, setAccountImage] = useState(
    "https://i.pinimg.com/736x/48/4c/c6/484cc69755c6b5daa6b31e720d848629.jpg"
  ); // Hình ảnh mặc định
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      const decodedToken = jwt_decode(token);
      const { AccountName, AccountImage } = decodedToken;

      setAccountName(AccountName || "Admin");
      if (AccountImage) {
        // Fetch image if available
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

  return (
    <div className="navbarCustomer">
      {/* Logo */}
      <a href="#" className="logo">
        <i className="bx bxs-cat"></i>
        <div className="logo-name">
          <span>Pet</span>Ease
        </div>
      </a>

      {/* Central section (Search bar + Links) */}
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
            <a href="#">
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

      {/* Profile Avatar */}
      <div className="navbar-profile" onClick={toggleDropdown}>
        <img
          src={accountImage}
          alt="Profile Avatar"
          className="profile-avatar"
        />

        {dropdownVisible && (
          <div className="dropdown-menu">
            <ul>
              <li>{accountName}</li> {/* Display account name */}
              <li>View Profile</li>
              <li>Logout</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarCustomer;
