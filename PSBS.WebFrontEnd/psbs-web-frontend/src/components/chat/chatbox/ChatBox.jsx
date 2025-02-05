import React, { useEffect, useRef, useState } from "react";
import "./chatbox.css";
import EmojiPicker from "emoji-picker-react";
import signalRService from "../../../lib/ChatService";
import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from "../../../lib/userStore";
import { formatDate } from "../../../Utilities/convertDateTime";
const ChatBox = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([]); // Ensure it's initialized as an array
  const [text, setText] = useState("");
  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();
  const endRef = useRef(null);

  const handleEmoji = (e) => {
    setText((pre) => pre + e.emoji);
    setOpen(false);
  };

  useEffect(() => {
    if (!chatId) return; // Ensure chatId exists before joining

    signalRService.invoke("JoinChatRoom", chatId);

    const handleUpdateChatMessages = (messages) => {
      console.log("Received chat messages:", messages);
      setChat(messages);
    };

    const handleReceiveMessage = (senderId, messageText) => {
      console.log("New message received:", { senderId, messageText });
      setChat((prevChat) => [
        ...prevChat,
        {
          chatMessageId: Date.now(),
          senderId,
          text: messageText,
        },
      ]);
    };

    signalRService.on("UpdateChatMessages", handleUpdateChatMessages);
    signalRService.on("ReceiveMessage", handleReceiveMessage);

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
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>{user?.accountName || "Unknown"}</span>
            <p>Hey it's all me just don't go</p>
          </div>
        </div>
        {/* <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div> */}
      </div>
      <div className="center">
        {chat.map((message) => (
          <div
            className={`message ${
              message.senderId === currentUser.accountId ? "own" : "notOwn"
            }`}
            key={message.chatMessageId}
          >
            <div className="texts">
              <p>{message.text}</p>
              {/* <span>{formatDate(message.createdAt)}</span> */}
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
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((pre) => !pre)}
          />
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
