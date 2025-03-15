import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./addUser.css";
import { getData } from "../../../../../Utilities/ApiFunctions";
import CloseIcon from "@mui/icons-material/Close";
const AddUser = ({ signalRService, currentUser, currentList, setClose }) => {
  const [userList, setUserList] = useState([]);
  const [filteredUserList, setFilteredUserList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getData("api/Account/all");
        if (data.flag) {
          const filtered = data.data.filter(
            (user) =>
              user.accountId !== currentUser.accountId &&
              !currentList.some(
                (chat) =>
                  chat.serveFor === user.accountId && !chat.isSupportRoom
              ) // Exclude users in currentList
          );
          setUserList(filtered);
          setFilteredUserList(filtered); // Set the filtered list initially to full list
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUsers();
  }, [currentUser, currentList]);

  const handleSearch = () => {
    const filtered = userList.filter(
      (user) =>
        user.accountName.toLowerCase().includes(searchTerm.toLowerCase()) // Apply search filter
    );
    setFilteredUserList(filtered);
  };

  const handleAdd = async (receiverId) => {
    try {
      const senderId = currentUser.accountId;
      await signalRService.invoke("CreateChatRoom", senderId, receiverId);
    } catch (err) {
      Swal.fire(
        "Error",
        "Failed to create chat room. Please try again.",
        "error"
      );
      console.error("Error creating chat room:", err);
    }
  };

  // Handle success and failure from SignalR
  useEffect(() => {
    signalRService.on("ChatRoomCreated", () => {
      Swal.fire("Success", "Chat room created successfully!", "success");
    });

    signalRService.on("ChatRoomCreationFailed", (message) => {
      Swal.fire("Error", message, "error");
    });

    return () => {
      signalRService.off("ChatRoomCreated");
      signalRService.off("ChatRoomCreationFailed");
    };
  }, [signalRService]);

  return (
    <div className="addUser">
      <div className="close-button" onClick={() => setClose((prev) => !prev)}>
        <CloseIcon />
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="button" onClick={handleSearch}>
          Search
        </button>
      </form>

      <div className="userContainer">
        {filteredUserList.length > 0 ? (
          filteredUserList.map((user) => (
            <div className="user" key={user.accountId}>
              <div className="detail">
                <img
                  src={
                    user.accountImage
                      ? `http://localhost:5050/account-service/images/${user.accountImage}`
                      : "/avatar.png"
                  }
                  alt="Profile"
                />
                <span>{user.accountName}</span>
              </div>
              <button onClick={() => handleAdd(user.accountId)}>
                Add User
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

export default AddUser;
