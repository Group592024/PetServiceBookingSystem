import React, { useEffect, useRef, useState } from "react";
import "./chatbox.css";
import EmojiPicker from "emoji-picker-react";
import signalRService from "../../../lib/ChatService";
import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from "../../../lib/userStore";
const ChatBox = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([]); // Ensure it's initialized as an array
  const [text, setText] = useState("");
  const { chatId, user } = useChatStore();
  const {currentUser} = useUserStore();
  const endRef = useRef(null);

  const handleEmoji = (e) => {
    setText((pre) => pre + e.emoji);
    setOpen(false);
  };

  useEffect(() => {
    // Function to handle chat updates (fetching previous messages)
    const handleUpdateChatMessages = (messages) => {
      console.log("Received chat messages:", messages);
      setChat(messages);
    };

    // Function to handle receiving a new message in real-time
    const handleReceiveMessage = (senderId, messageText) => {
      console.log("New message received:", { senderId, messageText });

      // Append the new message to the existing chat
      setChat((prevChat) => [
        ...prevChat,
        {
          chatMessageId: Date.now(), // Temporary unique key
          senderId,
          text: messageText,
        },
      ]);
    };
     signalRService.invoke("JoinChatRoom", chatId);
    // Listen for initial chat messages
    signalRService.on("UpdateChatMessages", handleUpdateChatMessages);

    // Listen for new messages in real-time
    signalRService.on("ReceiveMessage", handleReceiveMessage);

    // Fetch chat messages for the user
    signalRService.invoke("GetChatMessages", chatId);

    return () => {
      signalRService.off("UpdateChatMessages", handleUpdateChatMessages);
      signalRService.off("ReceiveMessage", handleReceiveMessage);
    };
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = async () => {
    if (text.trim() === "") return;
    try {
      await signalRService.invoke("SendMessage", chatId, currentUser.accountId, text);
      setText(""); // Clear input after sending
    } catch (err) {
      console.log("Error sending message:", err);
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
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat.map((message) => (
          <div
            className={`message ${
              message.senderId === currentUser.accountId ? "own" : ""
            }`}
            key={message.chatMessageId}
          >
            <div className="texts">
              <p>{message.text}</p>
              <span>1 min ago</span>
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
