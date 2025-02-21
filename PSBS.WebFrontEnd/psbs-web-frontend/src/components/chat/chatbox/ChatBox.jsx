import React, { useCallback, useEffect, useRef, useState } from "react";
import "./chatbox.css";
import EmojiPicker from "emoji-picker-react";
import signalRService from "../../../lib/ChatService";
import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from "../../../lib/userStore";
import { formatDate } from "../../../Utilities/convertDateTime";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Swal from "sweetalert2";
import { getData } from "../../../Utilities/ApiFunctions";
const ChatBox = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([]); // Ensure it's initialized as an array
  const [text, setText] = useState("");
  const [userMap, setUserMap] = useState({});
  const { chatId, user, isSupportChat, ChangeChat } = useChatStore();
  const { currentUser } = useUserStore();
  const endRef = useRef(null);
  console.log("day la is support room ne", isSupportChat);
  const handleEmoji = (e) => {
    setText((pre) => pre + e.emoji);
    setOpen(false);
  };
  const fetchUserDetails = useCallback(async (senderIds) => {
    const uniqueIds = [...new Set(senderIds)]; // Remove duplicates
    const promises = uniqueIds.map(async (id) => {
      try {
        const response = await getData(`api/Account/${id}`);
        return {
          id,
          user: response?.data || {
            accountName: "Unknown",
            avatar: "./default-avatar.png",
          },
        };
      } catch (error) {
        console.error(`Error fetching user details for senderId: ${id}`, error);
        return {
          id,
          user: { accountName: "Unknown", avatar: "./default-avatar.png" },
        }; // Fallback user data
      }
    });

    const users = await Promise.all(promises);
    const userMap = users.reduce((acc, { id, user }) => {
      acc[id] = user;
      return acc;
    }, {});

    setUserMap(userMap); // Store user data in state
  }, []);
  useEffect(() => {
    if (!chatId) return; // Ensure chatId exists before joining

    signalRService.invoke("JoinChatRoom", chatId);

    const handleUpdateChatMessages = async (messages) => {
      console.log("Received chat messages:", messages);
      setChat(messages);
      // Extract unique sender IDs
      const senderIds = messages.map((msg) => msg.senderId);
      await fetchUserDetails(senderIds); // Fetch user details
    };

    const handleReceiveMessage = (senderId, messageText, updatedAt) => {
      console.log("New message received:", { senderId, messageText });
      setChat((prevChat) => [
        ...prevChat,
        {
          name: currentUser.accountName,
          createdAt: updatedAt,
          senderId,
          text: messageText,
        },
      ]);
    };

    signalRService.on("UpdateChatMessages", handleUpdateChatMessages);
    signalRService.on("ReceiveMessage", handleReceiveMessage);
    signalRService.on("removestafffailed", (message) => {
      Swal.fire("Error", message, "error");
    });
    signalRService.on("NewSupporterRequested", (message) => {
      ChangeChat(null, null, null);
      Swal.fire("Success", message, "success");
    });
    signalRService.on("RequestNewSupporterFailed", (message) => {
      Swal.fire("Error", message, "error");
    });
    signalRService.invoke("GetChatMessages", chatId, currentUser.accountId);

    // Store current chatId in a variable for cleanup
    const currentChatId = chatId;

    return () => {
      signalRService.off("UpdateChatMessages", handleUpdateChatMessages);
      signalRService.off("ReceiveMessage", handleReceiveMessage);

      // Use the stored chatId to leave the room correctly
      if (currentChatId) {
        signalRService.invoke("LeaveChatRoom", currentChatId);
      }
    };
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = async () => {
    if (text.trim() === "") return;
    try {
      await signalRService.invoke(
        "SendMessage",
        chatId,
        currentUser.accountId,
        text
      );
      setText(""); // Clear input after sending
    } catch (err) {
      console.log("Error sending message:", err);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevents new line creation
      handleSend(); // Call handleSend when Enter is pressed
    }
  };

  const handleExitRoom = () => {
    if (currentUser && currentUser.roleId === "user") {
      Swal.fire({
        title: "Request another supporter?",
        text: "Are you sure you want to request?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, start requesting!",
        cancelButtonText: "No, cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          signalRService
            .invoke("RequestNewSupporter", chatId)
            .catch((error) => {
              console.error("Error invoking RequestNewSupporter:", error);
              Swal.fire(
                "Error",
                "Failed to request new supporter for this chat room.",
                "error"
              );
            });
        }
      });
    } else if (currentUser) {
      Swal.fire({
        title: "Leave Support Conversation?",
        text: "Are you sure you want to leave this support chat?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, leave chat!",
        cancelButtonText: "No, cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          signalRService
            .invoke("RemoveStaffFromChatRoom", chatId, currentUser.accountId)
            .catch((error) => {
              console.error("Error invoking RemoveStaffFromChatRoom:", error);
              Swal.fire("Error", "Failed to leaving chat room.", "error");
            });
        }
      });
    }
  };
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="/avatar.png" alt="" />
          <div className="texts">
            <span>
              {isSupportChat && currentUser.roleId === "user"
                ? "Support Agent"
                : user?.accountName}
            </span>

            <p>Hey it's all me just don't go</p>
          </div>
        </div>
        <div className="icons">
          {isSupportChat && <ExitToAppIcon onClick={handleExitRoom} />}
        </div>
      </div>
      <div className="center">
        {chat.map((message) => (
          <div
            className={`message ${
              currentUser.roleId === "user"
                ? message.senderId === currentUser.accountId
                  ? "own"
                  : "notOwn"
                : (isSupportChat &&
                    currentUser.accountId !== user.accountId &&
                    message.senderId !== user.accountId) ||
                  (!isSupportChat && message.senderId === currentUser.accountId)
                ? "own"
                : "notOwn"
            }`}
            key={message.chatMessageId}
          >
            <div className="texts">
              <strong>
                {userMap[message.senderId]?.accountName || message.name}:
              </strong>
              <p>{message.text}</p>
              <span>{formatDate(message.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <div className="emoji">
          <img src="/emoji.png" alt="" onClick={() => setOpen((pre) => !pre)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
