import React from "react";
import "./list.css";

import ChatList from "./chatList/ChatList";
import UserInfor from "./userInfo/UserInfo";

const List = () => {
  return <div className="list">
    <UserInfor/>
    <ChatList/>
  </div>;
};

export default List;
