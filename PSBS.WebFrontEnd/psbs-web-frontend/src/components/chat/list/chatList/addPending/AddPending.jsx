import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "./addUser.css";
import { getData } from "../../../../../Utilities/ApiFunctions";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";

const AddPending = ({
  signalRService,
  currentUser,
  currentList,
  setAddMode,
}) => {
  const [pendingUsersWithDetails, setPendingUsersWithDetails] = useState([]);
  const [filteredUserList, setFilteredUserList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [originalUserList, setOriginalUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRooms, setProcessingRooms] = useState(new Set());
  
  // Add a new state to track the active search term
  const [activeSearchTerm, setActiveSearchTerm] = useState("");

  const fetchUserDetails = useCallback(async (pendingUsers) => {
    const promises = pendingUsers.map(async (item) => {
      try {
        const user = await getData(`api/Account/${item.serveFor}`);
        return { ...item, user: user.data };
      } catch (error) {
        console.error(`Error fetching user for ${item.serveFor}:`, error);
        return {
          ...item,
          user: { accountName: "Unknown", avatar: "./default-avatar.png" },
        };
      }
    });
    return Promise.all(promises);
  }, []);

  const filterUsers = useCallback(
    (users) => {
      // Use activeSearchTerm instead of searchTerm for filtering
      const filtered = users.filter((user) => {
        const userName = user.user?.accountName?.toLowerCase() || "";
        return userName.includes(activeSearchTerm.toLowerCase());
      });
      setFilteredUserList(filtered);
    },
    [activeSearchTerm] // Change dependency to activeSearchTerm
  );

  useEffect(() => {
    const getDetailsAndFilter = async () => {
      setIsLoading(true);
      if (currentList && currentList.length > 0) {
        const usersWithDetails = await fetchUserDetails(currentList);
        setPendingUsersWithDetails(usersWithDetails);
        setOriginalUserList(usersWithDetails);
        setFilteredUserList(usersWithDetails); // Show all users initially
      } else {
        setPendingUsersWithDetails([]);
        setFilteredUserList([]);
        setOriginalUserList([]);
      }
      setIsLoading(false);
    };
    getDetailsAndFilter();
  }, [currentList, fetchUserDetails]);

  // Update this useEffect to respond to activeSearchTerm changes
  useEffect(() => {
    filterUsers(originalUserList);
  }, [activeSearchTerm, originalUserList, filterUsers]);

  // Update handleSearch to set the activeSearchTerm
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearchTerm(searchTerm); // Only update the active search term when button is clicked
  };

  const handleAdd = async (chatRoomId, staffId, customerId) => {
    try {
      setProcessingRooms(prev => new Set(prev).add(chatRoomId));
      
      await signalRService.invoke(
        "AssignStaffToChatRoom",
        chatRoomId,
        staffId,
        customerId
      );
      
      const updatedCurrentList = filteredUserList.filter(
        (item) => item.chatRoomId !== chatRoomId
      );
      setFilteredUserList(updatedCurrentList);
      setOriginalUserList(updatedCurrentList);
      
      Swal.fire({
        title: "Success",
        text: "Staff assigned successfully!",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Failed to assign staff. Please try again.",
        icon: "error",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000
      });
      console.error("Error assigning staff to chat room:", err);
    } finally {
      setProcessingRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatRoomId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (signalRService) {
      signalRService.on("AssignStaffFailed", (message) => {
        Swal.fire({
          title: "Error",
          text: message,
          icon: "error",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000
        });
      });
      
      return () => {
        signalRService.off("AssignStaffFailed");
      };
    }
  }, [signalRService]);

  const handleClose = () => {
    setAddMode(false);
  };

  return (
    <div className="addUser">
      <div className="header">
        <h2>Pending Chat Rooms</h2>
        <div className="close-button">
          <CloseIcon onClick={handleClose} style={{ cursor: "pointer" }} />
        </div>
      </div>
      
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">
          <SearchIcon fontSize="small" style={{ marginRight: "5px" }} />
          Search
        </button>
      </form>
      
      <div className="userContainer">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
            <CircularProgress size={40} style={{ color: '#1a73e8' }} />
          </div>
        ) : filteredUserList.length > 0 ? (
          filteredUserList.map((user) => (
            <div className="user" key={user.chatRoomId}>
              <div className="detail">
                <img
                  src={
                    user.user.accountImage
                      ? `http://localhost:5050/account-service/images/${user.user.accountImage}`
                      : "/avatar.png"
                  }
                  alt="Profile"
                  onError={(e) => {
                    e.target.src = "/avatar.png";
                  }}
                />
                <div className="nameAndMessage">
                  <span>{user.user?.accountName || "Unknown User"}</span>
                  <p className="truncate">
                    {user?.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleAdd(
                    user.chatRoomId,
                    currentUser.accountId,
                    user.user.accountId
                  )
                }
                disabled={processingRooms.has(user.chatRoomId)}
              >
                {processingRooms.has(user.chatRoomId) ? (
                  <CircularProgress size={16} style={{ color: 'white' }} />
                ) : (
                  "Claim Room"
                )}
              </button>
            </div>
          ))
        ) : (
          <div className="no-users">
            <p>No pending chat rooms found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPending;
