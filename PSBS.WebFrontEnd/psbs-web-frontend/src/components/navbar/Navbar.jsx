
import "./index.js";
import React, { useEffect } from "react";
const Navbar = ({ sidebarRef }) => {
  const handleMenuClick = () => {
    if (sidebarRef.current) {
      sidebarRef.current.classList.toggle("close");
    }
  };
  return (
    <div className="nav">
      <i className="bx bx-menu"onClick={handleMenuClick}></i>
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
      <a href="#" className="notifications">
        <i className="bx bx-bell"></i>
        <span className="count">12</span>
      </a>
      <a href="#" className="profile">
        <img src="https://i.pinimg.com/736x/48/4c/c6/484cc69755c6b5daa6b31e720d848629.jpg"></img>
      </a>
    </div>
  );
};

export default Navbar;
