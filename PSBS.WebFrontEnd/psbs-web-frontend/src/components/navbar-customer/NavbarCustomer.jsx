import React, { useEffect, useState } from "react";
import "./style.css";

const NavbarCustomer = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };
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
      <div className="navbar-profile">
        <img
          src="https://i.pinimg.com/736x/48/4c/c6/484cc69755c6b5daa6b31e720d848629.jpg"
          alt="Profile Avatar"
          className="profile-avatar"
        //   onClick={toggleDropdown}
        />
        {dropdownVisible && (
          <div className="dropdown-menu">
            <ul>
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
