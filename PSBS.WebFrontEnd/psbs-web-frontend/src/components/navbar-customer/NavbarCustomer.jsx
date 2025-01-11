import React, { useEffect, useState } from "react";
import "./style.css";

const NavbarCustomer = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userData, setUserData] = useState({
    name: "Admin", // Mặc định là Admin nếu không có thông tin
    avatar: "https://i.pinimg.com/736x/48/4c/c6/484cc69755c6b5daa6b31e720d848629.jpg", // Mặc định hình ảnh avatar
  });

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Lấy thông tin người dùng từ localStorage (hoặc sessionStorage)
  useEffect(() => {
    const savedUserData = localStorage.getItem("userData"); // Giả sử lưu trữ trong localStorage
    if (savedUserData) {
      const parsedData = JSON.parse(savedUserData);
      setUserData({
        name: parsedData.name || "Admin", // Lấy tên người dùng
        avatar: parsedData.avatar || "https://i.pinimg.com/736x/48/4c/c6/484cc69755c6b5daa6b31e720d848629.jpg", // Lấy ảnh đại diện
      });
    }
  }, []);

  useEffect(() => {
    const navbarLinks = document.querySelectorAll(".navbar-links li a");

    navbarLinks.forEach((item) => {
      const li = item.parentElement;
      item.addEventListener("click", () => {
        navbarLinks.forEach((i) => {
          i.parentElement.classList.remove("active");
        });
        li.classList.add("active");
      });
    });

    return () => {
      // Cleanup event listeners
      navbarLinks.forEach((item) => {
        item.removeEventListener("click", () => {});
      });
    };
  }, []);

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
          src={userData.avatar} // Hiển thị avatar từ state
          alt="Profile Avatar"
          className="profile-avatar"
        />
        {dropdownVisible && (
          <div className="dropdown-menu">
            <ul>
              <li>{userData.name}</li> {/* Hiển thị tên người dùng */}
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
