import React, { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';

const Navbar = ({ sidebarRef }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userData, setUserData] = useState({
    name: "Admin",
    avatar: "https://i.pinimg.com/736x/48/4c/c6/484cc69755c6b5daa6b31e720d848629.jpg",
  });
  const [accountName, setAccountName] = useState(null);
  const [accountImage, setAccountImage] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decodedToken = jwt_decode(token);
      setAccountName(decodedToken.AccountName);
      setAccountImage(decodedToken.AccountImage);
      setAccountId(decodedToken.AccountId);

      if (decodedToken.AccountImage) {
        fetch(`http://localhost:5000/api/Account/loadImage?filename=${decodedToken.AccountImage}`)
          .then(response => response.json())
          .then(imageData => {
            if (imageData.flag) {
              const imgContent = imageData.data.fileContents;
              const imgContentType = imageData.data.contentType;
              setImagePreview(`data:${imgContentType};base64,${imgContent}`);
            } else {
              console.error("Error loading image:", imageData.message);
            }
          })
          .catch(error => console.error("Error fetching image:", error));
      }
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleMenuClick = () => {
    if (sidebarRef.current) {
      sidebarRef.current.classList.toggle("close");
    }
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
      <a href="#" className="notifications">
        <i className="bx bx-message-square-dots"></i>
        <span className="count">12</span>
      </a>
      <div className="navbar-profile" onClick={toggleDropdown}>
        {imagePreview ? (
          <img src={imagePreview} alt="Profile Avatar" className="profile-avatar" />
        ) : (
          <img src={userData.avatar} alt="Profile Avatar" className="profile-avatar" />
        )}
        {dropdownVisible && (
          <div className="dropdown-menu">
            <ul>
              <li>{accountName || userData.name}</li>
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
