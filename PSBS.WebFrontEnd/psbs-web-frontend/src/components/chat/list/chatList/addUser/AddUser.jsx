import React, { useState, useEffect } from "react";
import "./addUser.css";
import { getData } from "../../../../../Utilities/ApiFunctions";

const AddUser = ({ signalRService, currentUser }) => {
  const [userList, setUserList] = useState([]);
  const [filteredUserList, setFilteredUserList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getData("api/Account/all");
        if (data.flag) {
          setUserList(data.data);
          setFilteredUserList(data.data);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredUserList(
      searchTerm
        ? userList.filter((user) =>
            user.accountName.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : userList
    );
  }, [searchTerm, userList]);

  const handleAdd = async (receiverId) => {
    try {
      const senderId = currentUser.accountId; // Ensure currentUser is accessible
      const success = await signalRService.invoke("CreateChatRoom", senderId, receiverId);
      if (success) {
        console.log("Chat room created successfully");
         // Request the chat list from the server
              await signalRService.invoke("ChatRoomList", currentUser.accountId);
      } else {
        console.error("Failed to create chat room");
      }
    } catch (err) {
      console.error("Error creating chat room:", err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search by username"
          name="username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

     <div className="userContainer">
     {filteredUserList.map((user) => (
        <div className="user" key={user.accountId}>
          <div className="detail">
            <img src="./avatar.png" alt="" />
            <span>{user.accountName}</span>
          </div>
          <button onClick={() => handleAdd(user.accountId)}>Add User</button>
        </div>
      ))}
     </div>
    </div>
  );
};

export default AddUser;
