import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "./addUser.css";
import { getData } from "../../../../../Utilities/ApiFunctions";
import CloseIcon from '@mui/icons-material/Close';

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
      const filtered = users.filter((user) => {
        const userName = user.user?.accountName?.toLowerCase() || "";
        return userName.includes(searchTerm.toLowerCase());
      });
      setFilteredUserList(filtered);
    },
    [searchTerm]
  );

  useEffect(() => {
    const getDetailsAndFilter = async () => {
      if (currentList && currentList.length > 0) {
        const usersWithDetails = await fetchUserDetails(currentList);
        setPendingUsersWithDetails(usersWithDetails);
        setOriginalUserList(usersWithDetails);
        filterUsers(usersWithDetails);
      } else {
        setPendingUsersWithDetails([]);
        setFilteredUserList([]);
        setOriginalUserList([]);
      }
    };

    getDetailsAndFilter();
  }, [currentList, fetchUserDetails, filterUsers]);

  const handleSearch = () => {
    filterUsers(originalUserList);
  };

  const handleAdd = async (chatRoomId, staffId, customerId) => {
    try {
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
      Swal.fire("Success", "Staff assigned successfully!", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to assign staff. Please try again.", "error");
      console.error("Error assigning staff to chat room:", err);
    }
  };

  useEffect(() => {
    if (signalRService) {
      signalRService.on("AssignStaffFailed", (message) => {
        Swal.fire("Error", message, "error");
      });

      return () => {
        signalRService.off("AssignStaffFailed");
      };
    }
  }, [signalRService, currentList]);

  const handleClose = () => {
    setAddMode(false);
  };

  return (
    <div className="addUser">
      <div className="close-button">
        <CloseIcon onClick={handleClose} style={{ cursor: 'pointer' }} />
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="button" onClick={handleSearch}>Search</button>
      </form>
      <div className="userContainer">
        {filteredUserList.length > 0 ? (
          filteredUserList.map((user) => (
            <div className="user" key={user.chatRoomId}>
              <div className="detail">
                <img src={user.user?.avatar || "./avatar.png"} alt="" />
                <div className="nameAndMessage">
                  <span>{user.user?.accountName}</span>
                  <p className="truncate max-w-[200px]">
                    {user?.lastMessage || "null"}
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
              >
                Claim room
              </button>
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
};

export default AddPending;