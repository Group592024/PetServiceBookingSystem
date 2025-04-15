import React from "react";
import "./list.css";

import ChatList from "./chatList/ChatList";
import UserInfor from "./userInfo/UserInfo";
import signalRService from "../../../lib/ChatService";
import { useUserStore } from "../../../lib/userStore";
import { CircularProgress } from "@mui/material";
const List = () => {
  const { currentUser } = useUserStore();

  if (!currentUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="list">
      <UserInfor />
      <ChatList signalRService={signalRService} currentUser={currentUser} />
    </div>
  );
};

export default List;