import React, { useEffect, useState, useCallback } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { getData } from "../../../../Utilities/ApiFunctions";
import { useChatStore } from "../../../../lib/chatStore";

const ChatList = ({ signalRService, currentUser}) => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const { chatId, ChangeChat } = useChatStore();
  console.log(chatId);
  // Fetch user details for each chat room
  const fetchUserDetails = useCallback(async (chatRooms) => {
    const promises = chatRooms.map(async (item) => {
      try {
        const user = await getData(`api/Account/${item.receiverId}`);
        return { ...item, user };
      } catch (error) {
        console.error(
          `Error fetching user for receiverId: ${item.receiverId}`,
          error
        );
        return {
          ...item,
          user: {
            data: { accountName: "Unknown", avatar: "./default-avatar.png" },
          },
        }; // Fallback data
      }
    });

    const chatData = await Promise.all(promises);
    return chatData.sort(
      (a, b) => new Date(b.updateAt) - new Date(a.updateAt)
    );
  }, []);
 
  // Set up SignalR listeners
  useEffect(() => {
    console.log("Starting SignalR...");
  
    const handleUpdateChatList = async (chatRooms) => {
      console.log("UpdateChatList event received:", chatRooms);
      const sortedChats = await fetchUserDetails(chatRooms);
      setChats(sortedChats);
    };
  
    const startSignalR = async () => {
      try {
        if (!signalRService) {
          console.error("❌ SignalRService is not initialized.");
          return;
        }
  
        // Use startConnection() instead of start()
        await signalRService.startConnection("http://localhost:5159/chatHub");
        console.log("✅ SignalR Connected");
  
        signalRService.on("updatechatlist", handleUpdateChatList);
        await signalRService.invoke("ChatRoomList", currentUser.accountId);
      } catch (error) {
        console.error("❌ SignalR Connection Failed:", error);
      }
    };
  
    startSignalR();
  
    return () => {
      signalRService.off("updatechatlist");
    };
  }, [currentUser, fetchUserDetails]);
  
  
  


  const handleSelect = async (chat) => {
    ChangeChat(chat.chatRoomId, chat.user.data);
  };
  console.log("chat nay:"+chats);
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
        <div
          key={chat.chatRoomId}
          className="item"
          onClick={() => handleSelect(chat)}
        >
          <img src={chat.user.data?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{chat.user.data?.accountName || "Unknown"}</span>
            <p>{chat?.lastMessage || "null"}</p>
          </div>
        </div>
      ))}
      {addMode && (
        <AddUser signalRService={signalRService} currentUser={currentUser} />
      )}
    </div>
  );
};

export default ChatList;
