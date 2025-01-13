import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";  
const Navbar = ({ sidebarRef }) => {
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
        <i className="bx bx-bell"></i>
        <span className="count">12</span>
      </a>
      <span>{accountName}</span>
      <a href={`/profile/${accountId}`} className="profile">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Profile"
          />
        ) : (
          <div className="default-profile-pic"> </div>
        )}
        
      </a>
    </div>
  );
};

export default Navbar;
