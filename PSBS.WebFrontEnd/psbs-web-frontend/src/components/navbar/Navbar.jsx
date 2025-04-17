import React, { useEffect, useState, useRef } from "react";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import NotificationsDropdown from "../../pages/admins/notification/userNotifications/UserNotificationDropDown";
import signalRService from "../../lib/ChatService";

const Navbar = ({ sidebarRef }) => {
  const [accountName, setAccountName] = useState(null);
  const [accountImage, setAccountImage] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const [notificationDropdownVisible, setNotificationDropdownVisible] =
    useState(false);
  const [notificationCount, setNotificationCount] = useState("0");
  const intervalRef = useRef(null);
  const isNotificationOpenRef = useRef(false);

  // Create a ref to store the latest notification count from dropdown
  const dropdownUnreadCountRef = useRef(0);
  useEffect(() => {
    const id = sessionStorage.getItem("accountId");

    const handleNotificationCount = (value) => {
      // Only update if dropdown is closed or we haven't received data from dropdown
      if (!isNotificationOpenRef.current) {
        setNotificationCount(value.unreadChats);
      }
    };

    const fetchNotificationCount = () => {
      if (id) {
        signalRService.invoke("GetUnreadNotificationCount", id).catch(console.error);
      }
    };

    // Initial fetch
    fetchNotificationCount();

    // Set up periodic refresh only when dropdown is closed
    intervalRef.current = setInterval(fetchNotificationCount, 30000);

    // Set up listener
    signalRService.on("chatcount", handleNotificationCount);

    return () => {
      clearInterval(intervalRef.current);
      signalRService.off("chatcount", handleNotificationCount);
    };
  }, []);


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
  const toggleNotificationDropdown = () => {
    const newState = !notificationDropdownVisible;
    setNotificationDropdownVisible(newState);
    isNotificationOpenRef.current = newState;

    // When opening, use the dropdown's count
    if (newState) {
      setNotificationCount(dropdownUnreadCountRef.current.toString());
    } else {
      // When closing, fetch the latest count from SignalR
      const id = sessionStorage.getItem("accountId");
      if (id) {
        signalRService.invoke("GetUnreadNotificationCount", id).catch(console.error);
      }
    }
  };
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };
  const handleMenuClick = () => {
    if (sidebarRef.current) {
      const isClosed = sidebarRef.current.classList.toggle("close");
      localStorage.setItem("sidebarClosed", isClosed);
    }
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
    <div className="nav flex justify-between items-center px-4 py-2 relative">
      <i className="bx bx-menu" onClick={handleMenuClick}></i>
      <input type="checkbox" id="theme-toggle" hidden />
      <label htmlFor="theme-toggle"></label>
      <div className="flex items-center ml-auto space-x-4">
        <div className="notifications" onClick={toggleNotificationDropdown}>
          <i class="bx bx-bell"></i>
        </div>
        <a href="/chat" className="notifications">
          <i className="bx bx-message-square-dots"></i>
        </a>
      </div>
      {notificationDropdownVisible && (
        <NotificationsDropdown
          onClose={() => {
            setNotificationDropdownVisible(false);
            isNotificationOpenRef.current = false;
          }}
          onUnreadCountChange={(count) => {
            dropdownUnreadCountRef.current = count;
            setNotificationCount(count.toString());
          }}
        />
      )}
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
