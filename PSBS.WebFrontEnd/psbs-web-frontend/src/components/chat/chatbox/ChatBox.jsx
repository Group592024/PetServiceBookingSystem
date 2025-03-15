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
import { Avatar, Chip } from "@mui/material";
const ChatBox = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([]); // Ensure it's initialized as an array
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
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

    const handleReceiveMessage = (
      senderId,
      messageText,
      updatedAt,
      imageUrl
    ) => {
      console.log("New message received:", { senderId, messageText });
      setChat((prevChat) => [
        ...prevChat,
        {
          name: currentUser.accountName,
          createdAt: updatedAt,
          senderId,
          text: messageText,
          image: imageUrl,
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
  const handleImg = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log("Selected file:", selectedFile); // Log the selected file

      setImg({
        file: selectedFile,
        url: URL.createObjectURL(selectedFile),
      });
      console.log("Selected ne he:", img); // Log the selected file
    }
  };
  const handleSend = async () => {
    if (text.trim() === "" && !img.file) return;

    try {
      if (img.file) {
        // File size validation
        const maxSize = 5 * 1024 * 1024; // 5MB limit
        if (img.file.size > maxSize) {
          Swal.fire("Error", "Image size exceeds the limit (5MB).", "error");
          return;
        }

        // File type validation
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(img.file.type)) {
          Swal.fire(
            "Error",
            "Invalid file type. Only JPEG, PNG, and GIF are allowed.",
            "error"
          );
          return;
        }

        // Upload the image using the API
        const formData = new FormData();
        formData.append("image", img.file);

        const response = await fetch(
          "http://localhost:5050/api/ChatControllers/upload-image",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload image.");
        }

        const imageData = await response.json();

        if (imageData.flag) {
          const imageUrl = imageData.data;

          // Send the image URL via SignalR
          await signalRService.invoke(
            "SendMessage",
            chatId,
            currentUser.accountId,
            text,
            imageUrl // Send the image URL
          );

          setText("");
        } else {
          Swal.fire("Error", imageData.message, "error");
        }
      } else {
        // Send text-only message via SignalR
        await signalRService.invoke(
          "SendMessage",
          chatId,
          currentUser.accountId,
          text,
          null // Send null for imageUrl when text only
        );
        setText("");
      }

      setImg({
        file: null,
        url: "",
      });
    } catch (err) {
      console.log(err);
      Swal.fire("Error", "Failed to send the message.", "error");
    }
  };
  const handleRemoveImg = () => {
    setImg({
      file: null,
      url: "",
    });
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
          <img
            src={
              user?.accountImage
                ? `http://localhost:5050/account-service/images/${user.accountImage}`
                : "/avatar.png"
            }
            alt="Profile"
          />
          <div className="texts">
            <span>
              {isSupportChat && currentUser.roleId === "user"
                ? "Support Agent"
                : `Support For ${user?.accountName}`}
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
              {isSupportChat && (
                <h6 className="font-semibold text-xs">
                  {userMap[message.senderId]?.accountName || message.name}
                </h6>
              )}
              {message.image && <img src={message.image} alt="" />}
              {message.text && message.text.trim() !== "" && (
                <p>{message.text}</p>
              )}
              <span>{formatDate(message.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          {/* Toggle visibility based on img.url */}
          {!img.url && (
            <label htmlFor="file">
              <img src="/img.png" alt="" />
            </label>
          )}
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
            accept="image/*"
          />
        </div>
        {img.url && (
          <Chip
            avatar={<Avatar alt="Selected Image" src={img.url} />}
            label=""
            onDelete={handleRemoveImg}
            color="primary"
          />
        )}

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
