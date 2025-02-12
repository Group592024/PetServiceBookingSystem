import React, {  useEffect } from "react";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import List from "../../../components/chat/list/List";
import ChatBox from "../../../components/chat/chatbox/ChatBox";
import "./chat.css";
const CustomerChatPage = () => {
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
         <NavbarCustomer />
         <div className="max-w-7xl mx-auto mt-5 px-4 overflow-hidden">
         <div className="chatBody">
            <div className="chatContainer">
            <List/>
          {chatId &&   <ChatBox/>}
           </div>
            </div>
          
            </div>
    </div>
  )
}

export default CustomerChatPage