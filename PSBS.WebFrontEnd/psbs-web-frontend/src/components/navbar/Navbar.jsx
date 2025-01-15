import './index.js';
import React, { useEffect,useState } from 'react';
const Navbar = ({ sidebarRef }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
    const [userData, setUserData] = useState({
      name: "Admin", // Mặc định là Admin nếu không có thông tin
      avatar: "https://i.pinimg.com/736x/48/4c/c6/484cc69755c6b5daa6b31e720d848629.jpg", // Mặc định hình ảnh avatar
    });
  
    const toggleDropdown = () => {
      setDropdownVisible(!dropdownVisible);
    };
  const handleMenuClick = () => {
    console.log(sidebarRef);
    console.log(sidebarRef.current);
    if (sidebarRef.current) {
      sidebarRef.current.classList.toggle('close');
    }
  };
  return (
    <div className='nav'>
      <i className='bx bx-menu' onClick={handleMenuClick}></i>
      <form action='#'>
        <div className='form-input'>
          <input type='search' placeholder='Search...' />
          <button className='search-btn' type='submit'>
            <i className='bx bx-search'></i>
          </button>
        </div>
      </form>
      <input type='checkbox' id='theme-toggle' hidden />
      <label htmlFor='theme-toggle'></label>
      <a href='#' className='notifications'>
      <i class='bx bx-message-square-dots'></i>
        <span className='count'>12</span>
      </a>
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

export default Navbar;
