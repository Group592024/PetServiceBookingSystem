import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
import "./style.css";
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
  const [notificationDropdownVisible, setNotificationDropdownVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState("0");
  const intervalRef = useRef(null);
  const isNotificationOpenRef = useRef(false);
  const dropdownUnreadCountRef = useRef(0);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Add a mounted ref to prevent state updates after unmounting
  const isMounted = useRef(true);

  // Set isMounted to false when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Function to safely update state only if component is still mounted
  const safeSetState = (stateSetter, value) => {
    if (isMounted.current) {
      stateSetter(value);
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        safeSetState(setShowSearchResults, false);
      }
    }
    // Only add the listener when the dropdown is shown
    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSearchResults]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      safeSetState(setShowSearchResults, false);
      return;
    }
    safeSetState(setIsSearching, true);
    safeSetState(setShowSearchResults, true);

    const token = sessionStorage.getItem("token");
    const headers = token ? {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    } : {
      "Content-Type": "application/json",
    };

    // Use Promise.all to handle all fetches together
    Promise.all([
      fetch(`http://localhost:5050/api/Service?showAll=false`, {
        method: "GET",
        headers: headers,
      }).then(response => {
        if (!response.ok) throw new Error('Service API error');
        return response.json();
      }).catch(() => ({ data: [] })),

      fetch(`http://localhost:5050/api/Room/available`, {
        method: "GET",
        headers: headers,
      }).then(response => {
        if (!response.ok) throw new Error('Room API error');
        return response.json();
      }).catch(() => ({ data: [] })),

      fetch(`http://localhost:5050/Gifts`, {
        method: "GET",
        headers: headers,
      }).then(response => {
        if (!response.ok) throw new Error('Gift API error');
        return response.json();
      }).catch(() => ({ flag: false, data: [] }))
    ])
      .then(([serviceData, roomData, giftData]) => {
        if (!isMounted.current) return;

        const keyword = searchTerm.trim().toLowerCase();

        const services = serviceData && serviceData.data ? serviceData.data
          .filter(service => service.serviceName?.toLowerCase().includes(keyword))
          .map(service => ({
            id: service.serviceId,
            name: service.serviceName,
            type: 'service',
            image: service.serviceImage,
          })) : [];

        const rooms = roomData && roomData.data ? roomData.data
          .filter(room => room.roomName?.toLowerCase().includes(keyword))
          .map(room => ({
            id: room.roomId,
            name: room.roomName,
            type: 'room',
            image: room.roomImage,
          })) : [];

        const gifts = giftData && giftData.flag && giftData.data ? giftData.data
          .filter(gift => gift.giftName?.toLowerCase().includes(keyword))
          .map(gift => ({
            id: gift.giftId,
            name: gift.giftName,
            type: 'gift',
            image: gift.giftImage,
          })) : [];

        safeSetState(setSearchResults, [...services, ...rooms, ...gifts]);
        safeSetState(setIsSearching, false);
      })
      .catch(error => {
        console.error("Error fetching search results:", error);
        if (isMounted.current) {
          safeSetState(setSearchResults, []);
          safeSetState(setIsSearching, false);
        }
      });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    safeSetState(setSearchTerm, value);

    if (!value.trim()) {
      safeSetState(setShowSearchResults, false);
      safeSetState(setSearchResults, []);
      return;
    }

    safeSetState(setIsSearching, true);
    safeSetState(setShowSearchResults, true);

    const token = sessionStorage.getItem("token");
    const headers = token ? {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    } : {
      "Content-Type": "application/json",
    };

    // Use Promise.all to handle all fetches together
    Promise.all([
      fetch(`http://localhost:5050/api/Service?showAll=false`, {
        method: "GET",
        headers: headers,
      }).then(response => {
        if (!response.ok) throw new Error('Service API error');
        return response.json();
      }).catch(() => ({ data: [] })),

      fetch(`http://localhost:5050/api/Room/available`, {
        method: "GET",
        headers: headers,
      }).then(response => {
        if (!response.ok) throw new Error('Room API error');
        return response.json();
      }).catch(() => ({ data: [] })),

      fetch(`http://localhost:5050/Gifts`, {
        method: "GET",
        headers: headers,
      }).then(response => {
        if (!response.ok) throw new Error('Gift API error');
        return response.json();
      }).catch(() => ({ flag: false, data: [] }))
    ])
      .then(([serviceData, roomData, giftData]) => {
        if (!isMounted.current) return;

        const keyword = value.trim().toLowerCase();

        const services = serviceData && serviceData.data ? serviceData.data
          .filter(service => service.serviceName?.toLowerCase().includes(keyword))
          .map(service => ({
            id: service.serviceId,
            name: service.serviceName,
            type: 'service',
            image: service.serviceImage,
          })) : [];

        const rooms = roomData && roomData.data ? roomData.data
          .filter(room => room.roomName?.toLowerCase().includes(keyword))
          .map(room => ({
            id: room.roomId,
            name: room.roomName,
            type: 'room',
            image: room.roomImage,
          })) : [];

        const gifts = giftData && giftData.flag && giftData.data ? giftData.data
          .filter(gift => gift.giftName?.toLowerCase().includes(keyword))
          .map(gift => ({
            id: gift.giftId,
            name: gift.giftName,
            type: 'gift',
            image: gift.giftImage,
          })) : [];

        safeSetState(setSearchResults, [...services, ...rooms, ...gifts]);
        safeSetState(setIsSearching, false);
      })
      .catch(error => {
        console.error("Error fetching search results:", error);
        if (isMounted.current) {
          safeSetState(setSearchResults, []);
          safeSetState(setIsSearching, false);
        }
      });
  };

  // Handle search result click
  const handleResultClick = (result) => {
    safeSetState(setShowSearchResults, false);
    safeSetState(setSearchTerm, "");
    if (result.type === 'service') {
      navigate(`/customer/services/${result.id}`);
    } else if (result.type === 'room') {
      navigate(`/customerroom/${result.id}`);
    } else if (result.type === 'gift') {
      navigate(`/customer/gifts/detail/${result.id}`);
    }
  };

  useEffect(() => {
    const id = sessionStorage.getItem("accountId");

    const handleNotificationCount = (value) => {
      if (!isNotificationOpenRef.current && isMounted.current) {
        safeSetState(setNotificationCount, value.unreadChats);
      }
    };

    const fetchNotificationCount = () => {
      if (id) {
        signalRService.invoke("GetUnreadNotificationCount", id).catch(console.error);
      }
    };

    fetchNotificationCount();
    intervalRef.current = setInterval(fetchNotificationCount, 30000);
    signalRService.on("chatcount", handleNotificationCount);

    return () => {
      clearInterval(intervalRef.current);
      signalRService.off("chatcount", handleNotificationCount);
    };
  }, []);

  const toggleNotificationDropdown = () => {
    const newState = !notificationDropdownVisible;
    safeSetState(setNotificationDropdownVisible, newState);
    isNotificationOpenRef.current = newState;

    if (newState) {
      safeSetState(setNotificationCount, dropdownUnreadCountRef.current.toString());
    } else {
      const id = sessionStorage.getItem("accountId");
      if (id) {
        signalRService.invoke("GetUnreadNotificationCount", id).catch(console.error);
      }
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        safeSetState(setIsLoggedIn, true);
        const decodedToken = jwt_decode(token);
        const { AccountName, AccountImage, AccountId } = decodedToken;

        safeSetState(setAccountName, AccountName || "User");
        safeSetState(setAccountId, AccountId);
        sessionStorage.setItem("accountId", AccountId);

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
            .then((response) => {
              if (!response.ok) throw new Error('Image API error');
              return response.json();
            })
            .then((imageData) => {
              if (!isMounted.current) return;
              if (imageData.flag) {
                const imgContent = imageData.data.fileContents;
                const imgContentType = imageData.data.contentType;
                safeSetState(setAccountImage, `data:${imgContentType};base64,${imgContent}`);
              } else {
                console.error("Error loading image:", imageData.message);
              }
            })
            .catch((error) => console.error("Error fetching image:", error));
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        safeSetState(setIsLoggedIn, false);
      }
    } else {
      safeSetState(setIsLoggedIn, false);
    }
  }, []);

  const toggleDropdown = () => {
    safeSetState(setDropdownVisible, !dropdownVisible);
  };

  const toggleMobileMenu = () => {
    safeSetState(setMobileMenuOpen, !mobileMenuOpen);
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
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("userData");
        sessionStorage.removeItem("userData");
        sessionStorage.removeItem("accountId");

        Swal.fire({
          title: "Logged out",
          text: "You have been logged out successfully!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          if (isMounted.current) {
            safeSetState(setIsLoggedIn, false);
            navigate("/login", { replace: true });
          }
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

      {/* Mobile menu toggle - add to your CSS */}
      <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <i className={`bx ${mobileMenuOpen ? 'bx-x' : 'bx-menu'}`}></i>
      </div>

      <div className={`navbar-central ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="search-container" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="form-input">
              <input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button className="search-btn" type="submit">
                <i className="bx bx-search"></i>
              </button>
            </div>

            {/* Search results dropdown */}
            {showSearchResults && (
              <div className="search-results-dropdown">
                {isSearching ? (
                  <div className="search-loading">
                    <i className='bx bx-loader-alt bx-spin'></i> Searching...
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <>
                    {searchResults.some(r => r.type === 'service') && (
                      <>
                        <div className="search-section-title">Services</div>
                        {searchResults
                          .filter(result => result.type === 'service')
                          .map((result) => (
                            <div
                              key={`${result.type}-${result.id}`}
                              className={`search-result-item ${result.type}`}
                              onClick={() => handleResultClick(result)}
                            >
                              <div className="search-result-image">
                                {result.image ? (
                                  <img
                                    src={`http://localhost:5050/facility-service${result.image}`}
                                    alt={result.name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://via.placeholder.com/50";
                                    }}
                                  />
                                ) : (
                                  <div className="placeholder-image">
                                    <i className="bx bx-store-alt"></i>
                                  </div>
                                )}
                              </div>
                              <div className="search-result-content">
                                <div className="search-result-name">{result.name}</div>
                                <div className="search-result-type">
                                  <i className="bx bx-store-alt"></i> Service
                                </div>
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                    {searchResults.some(r => r.type === 'room') && (
                      <>
                        <div className="divider"></div>
                        <div className="search-section-title">Rooms</div>
                        {searchResults
                          .filter(result => result.type === 'room')
                          .map((result) => (
                            <div
                              key={`${result.type}-${result.id}`}
                              className={`search-result-item ${result.type}`}
                              onClick={() => handleResultClick(result)}
                            >
                              <div className="search-result-image">
                                {result.image ? (
                                  <img
                                    src={`http://localhost:5050/facility-service${result.image}`}
                                    alt={result.name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://via.placeholder.com/50";
                                    }}
                                  />
                                ) : (
                                  <div className="placeholder-image">
                                    <i className="bx bx-home-circle"></i>
                                  </div>
                                )}
                              </div>
                              <div className="search-result-content">
                                <div className="search-result-name">{result.name}</div>
                                <div className="search-result-type">
                                  <i className="bx bx-home-circle"></i> Room
                                </div>
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                    {/* Add Gift section */}
                    {searchResults.some(r => r.type === 'gift') && (
                      <>
                        <div className="divider"></div>
                        <div className="search-section-title">Gifts</div>
                        {searchResults
                          .filter(result => result.type === 'gift')
                          .map((result) => (
                            <div
                              key={`${result.type}-${result.id}`}
                              className={`search-result-item ${result.type}`}
                              onClick={() => handleResultClick(result)}
                            >
                              <div className="search-result-image">
                                {result.image ? (
                                  <img
                                    src={`http://localhost:5050${result.image}`}
                                    alt={result.name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://via.placeholder.com/50";
                                    }}
                                  />
                                ) : (
                                  <div className="placeholder-image">
                                    <i className="bx bx-gift"></i>
                                  </div>
                                )}
                              </div>
                              <div className="search-result-content">
                                <div className="search-result-name">{result.name}</div>
                                <div className="search-result-type">
                                  <i className="bx bx-gift"></i> Gift
                                </div>
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                  </>
                ) : searchTerm.trim().length > 0 ? (
                  <div className="no-results">No results found</div>
                ) : (
                  <div className="search-hint">Start typing to search</div>
                )}
              </div>
            )}
          </form>
        </div>

        <ul className="navbar-links">
          <li>
            <NavLink
              to="/customer/services"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              onClick={() => safeSetState(setMobileMenuOpen, false)}
            >
              <i className="bx bx-store-alt"></i>
              Service
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/customerroom"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              onClick={() => safeSetState(setMobileMenuOpen, false)}
            >
              <i className='bx bx-home-circle'></i>
              Room
            </NavLink>
          </li>
          {isLoggedIn && (
            <li>
              <NavLink
                to="/customer/bookings"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={() => safeSetState(setMobileMenuOpen, false)}
              >
                <i className="bx bx-home-heart"></i>
                Booking
              </NavLink>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <NavLink
                to="/customer/gifts"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={() => safeSetState(setMobileMenuOpen, false)}
              >
                <i className="bx bx-gift"></i>
                Gift
              </NavLink>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <NavLink
                to="/customer/pet"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={() => safeSetState(setMobileMenuOpen, false)}
              >
                <i className="bx bxs-dog"></i>
                Pet
              </NavLink>
            </li>
          )}
        </ul>
      </div>

      <div className="navbar-right">
        {isLoggedIn && (
          <>
            <div className="notifications" onClick={toggleNotificationDropdown}>
              <i className="bx bx-bell"></i>
              {notificationCount > 0 && (
                <span className="count">{notificationCount}</span>
              )}
            </div>

            <Link to="/chat/customer" className="notifications">
              <i className="bx bx-message-square-dots"></i>
            </Link>
          </>
        )}

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
                  <li onClick={handleViewProfile}>
                    <i className="bx bx-user"></i> View Profile
                  </li>
                  <li onClick={handleLogout}>
                    <i className="bx bx-log-out"></i> Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {notificationDropdownVisible && (
          <NotificationsDropdown
            onClose={() => safeSetState(setNotificationDropdownVisible, false)}
            onUnreadCountChange={(count) => {
              dropdownUnreadCountRef.current = count;
              safeSetState(setNotificationCount, count.toString());
            }}
          />
        )}
      </div>
    </div>
  );
};

export default NavbarCustomer;
