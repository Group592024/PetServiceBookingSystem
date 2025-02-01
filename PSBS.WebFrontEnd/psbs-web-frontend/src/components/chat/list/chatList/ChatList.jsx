import React, { useEffect, useState, useCallback } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../../lib/userStore";
import signalRService from "../../../../lib/ChatService"; // Ensure correct import
import { getData } from "../../../../Utilities/ApiFunctions";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const { currentUser } = useUserStore();

  // Fetch user details for each chat room
  const fetchUserDetails = useCallback(async (chatRooms) => {
    const promises = chatRooms.map(async (item) => {
      try {
        const user = await getData(`api/Account/${item.receiverId}`);
        return { ...item, user };
      } catch (error) {
        console.error(`Error fetching user for receiverId: ${item.receiverId}`, error);
        return { ...item, user: { accountName: "Unknown", avatar: "./default-avatar.png" } }; // Fallback data
      }
    });

    const chatData = await Promise.all(promises);
    return chatData.sort((a, b) => new Date(b.UpdatedAt) - new Date(a.UpdatedAt));
  }, []);

  // Connect to SignalR and set up listeners
  useEffect(() => {
    const connectToHub = async () => {
      if (!currentUser) return;

      // Start the SignalR connection
      await signalRService.startConnection("http://localhost:5159/chatHub");

      // Listen for the UpdateChatList event
      signalRService.on("UpdateChatList", async (chatRooms) => {
        console.log("UpdateChatList event received:", chatRooms);
        const sortedChats = await fetchUserDetails(chatRooms);
        setChats(sortedChats);
      });

      // Request the chat list from the server
      await signalRService.invoke("ChatRoomList", currentUser.accountId);
    };

    connectToHub();

    // Clean up the listener when the component unmounts
    return () => {
      signalRService.off("UpdateChatList");
    };
  }, [currentUser, fetchUserDetails]);

  if (!currentUser) {
    return <div className="userInfo">Loading...</div>;
  }

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder="Search" />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {chats.map((chat) => (
        <div key={chat.chatRoomId} className="item">
          <img src={chat.user.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{chat.user.data.accountName}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser signalRService={signalRService} currentUser={currentUser} />}
    </div>
  );
};

export default ChatList;