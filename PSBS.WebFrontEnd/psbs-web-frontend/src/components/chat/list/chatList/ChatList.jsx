import React, { useEffect, useState, useCallback } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { getData } from "../../../../Utilities/ApiFunctions";
import { useChatStore } from "../../../../lib/chatStore";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import Swal from "sweetalert2";

const ChatList = ({ signalRService, currentUser }) => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null); // Track the active chat
  const [searchTerm, setSearchTerm] = useState(""); // Add search functionality
  const { chatId, ChangeChat } = useChatStore();

  const fetchUserDetails = useCallback(async (chatRooms) => {
    const promises = chatRooms.map(async (item) => {
      try {
        const user = await getData(`api/Account/${item.serveFor}`);
        return { ...item, user };
      } catch (error) {
        console.error(
          `Error fetching user for receiverId: ${item.serveFor}`,
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
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  }, []);

  useEffect(() => {
    const handleUpdateChatList = async (chatRooms) => {
      const sortedChats = await fetchUserDetails(chatRooms);
      // Update chats: mark active chat as seen
      const updatedChats = sortedChats.map((chat) => {
        if (chat.chatRoomId === currentChat) {
          return { ...chat, isSeen: true }; // Only mark the active chat as seen
        }
        return chat; // Other chats remain unchanged
      });
      setChats(updatedChats);
    };

    const startSignalR = async () => {
      try {
        if (!signalRService) {
          console.error("❌ SignalRService is not initialized.");
          return;
        }
        await signalRService.startConnection(
          "http://localhost:5050/chatHub",
          currentUser.accountId
        );
        console.log("✅ SignalR Connected");
        signalRService.on("getList", handleUpdateChatList);
        signalRService.on("updateaftercreate", handleUpdateChatList);
        signalRService.on("staffremoved", (message) => {
          Swal.fire("Success", "Leave room successfully", "success");
          ChangeChat(null, null, null);
        });
        await signalRService.invoke("ChatRoomList", currentUser.accountId);
      } catch (error) {
        console.error("❌ SignalR Connection Failed:", error);
      }
    };

    startSignalR();
    return () => {
      signalRService.off("updatechatlist");
    };
  }, [currentUser, fetchUserDetails, signalRService, currentChat]);

  const handleSelect = async (chat) => {
    setCurrentChat(chat.chatRoomId); // Set the active chat ID
    // Create a new array with updated isSeen value for the selected chat
    const updatedChats = chats.map((item) => {
      if (item.chatRoomId === chat.chatRoomId) {
        return { ...item, isSeen: true }; // Mark selected chat as seen
      }
      return item;
    });
    setChats(updatedChats); // Update the chats state
    ChangeChat(chat.chatRoomId, chat.user.data, chat.isSupportRoom); // Change the active chat in the store
  };

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    const name = chat.isSupportRoom && currentUser.roleId !== "user"
      ? `Support For ${chat.user.data?.accountName}`
      : chat.isSupportRoom && currentUser.roleId === "user"
      ? "Support Agent"
      : `${chat.user.data?.accountName}`;
    
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="/search.png" alt="" />
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "/minus.png" : "/plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          key={chat.chatRoomId}
          className={`item ${chat.isSupportRoom ? "support" : ""} ${
            chat.chatRoomId === chatId ? "selected" : ""
          }`}
          onClick={() => handleSelect(chat)}
        >
          <img
            src={
              chat?.user.data.accountImage
                ? `http://localhost:5050/account-service/images/${chat.user.data.accountImage}`
                : "/avatar.png"
            }
            alt="Profile"
          />
          <div className="texts">
            <span>
              {chat.isSupportRoom && currentUser.roleId !== "user"
                ? `Support For ${chat.user.data?.accountName}`
                : chat.isSupportRoom && currentUser.roleId === "user"
                ? "Support Agent"
                : `${chat.user.data?.accountName}`}
            </span>
            <p>{chat?.lastMessage || "No messages yet"}</p>
          </div>
          {/* Show unread dot if the message is unread */}
          {!chat.isSeen && <div className="unreadDot"></div>}
          {chat.isSupportRoom && <SupportAgentIcon className="supportIcon" />}
        </div>
      ))}
      {addMode && (
        <AddUser
          signalRService={signalRService}
          currentUser={currentUser}
          currentList={chats}
          setClose={setAddMode}
        />
      )}
    </div>
  );
};

export default ChatList;
