import React, { useRef, useEffect } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import List from "../../../components/chat/list/List";
import ChatBox from "../../../components/chat/chatbox/ChatBox";
import "./chat.css";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
const Chat = () => {
    const sidebarRef = useRef(null);
    const { currentUser, fetchUserInfo } = useUserStore();
    const {chatId} = useChatStore();
    useEffect(() => {
      const storedAccountId = sessionStorage.getItem('accountId');
      if (!currentUser && storedAccountId) {
        fetchUserInfo(storedAccountId);
      }
    }, [currentUser, fetchUserInfo]);
    

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
            <div className="chatBody">
            <div className="chatContainer">
            <List/>
          {chatId &&   <ChatBox/>}
           </div>
            </div>
          
        </main>
      </div>
    </div>
  );
};

export default Chat;
