import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
import "./style.css"; // Make sure this path is correct
import { NavLink } from "react-router-dom";
import NotificationsDropdown from "../../pages/admins/notification/userNotifications/UserNotificationDropDown";
import signalRService from "../../lib/ChatService";
const NavbarCustomer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountName, setAccountName] = useState("Guest");
  const [accountImage, setAccountImage] = useState(
    "https://i.pinimg.com/736x/48/4c/c6/484cc69755c6b5daa6b31e720d848629.jpg"
  );
  const [accountId, setAccountId] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [notificationDropdownVisible, setNotificationDropdownVisible] =
    useState(false);
  const navigate = useNavigate();
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

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    // signalRService.on("notificationCount", handleNotificationCount);
    if (token) {
      setIsLoggedIn(true);
      const decodedToken = jwt_decode(token);
      const { AccountName, AccountImage, AccountId } = decodedToken;

      setAccountName(AccountName || "User");
      setAccountId(AccountId);
      if (AccountImage) {
        fetch(
          `http://localhost:5050/api/Account/loadImage?filename=${AccountImage}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
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
    } else {
      setIsLoggedIn(false);
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
          setIsLoggedIn(false); // Update state
          navigate("/login", { replace: true });
        });
      }
    });
  };

  return (
    <div className="navbarCustomer">
      <a href="/" className="logo">
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
            <NavLink
              to="/customer/services"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <i className="bx bx-store-alt"></i>
              Service
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/customer/bookings"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <i className="bx bx-home-heart"></i>
              Booking
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/customer/pet"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <i className="bx bxs-dog"></i>
              Pet
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/customer/gifts"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <i className="bx bx-gift"></i>
              Gift
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/customerroom"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
            <i class='bx bx-home-circle' ></i>
              Room
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Right side icons and profile */}
      <div className="navbar-right">
        {isLoggedIn && (
          <>
            <div className="notifications" onClick={toggleNotificationDropdown}>
              <i className="bx bx-bell"></i>
              <span className="count">{notificationCount}</span>
            </div>

            <Link to="/chat/customer" className="notifications">
              <i className="bx bx-message-square-dots"></i>
            </Link>
          </>
        )}

        {/* Show Login button if not logged in, otherwise show profile */}
        {!isLoggedIn ? (
          <Link
            to="/login"
            className="login-button bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition duration-300 hover:opacity-80"
          >
            <i className="bx bx-log-in text-xl"></i> Login
          </Link>
        ) : (
          <div className="navbar-profile" onClick={toggleDropdown}>
            <img
              src={accountImage}
              alt="Profile Avatar"
              className="profile-avatar"
            />

            {dropdownVisible && (
              <div className="dropdown-menu">
                <ul>
                  <li>{accountName || "User"}</li>
                  <li onClick={handleViewProfile}>View Profile</li>
                  <li onClick={handleLogout}>Logout</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {notificationDropdownVisible && (
          <NotificationsDropdown
            onClose={() => setNotificationDropdownVisible(false)}
            onUnreadCountChange={(count) => {
              dropdownUnreadCountRef.current = count;
              setNotificationCount(count.toString());
            }}
          />
        )}
      </div>
    </div>
  );
};

export default NavbarCustomer;
