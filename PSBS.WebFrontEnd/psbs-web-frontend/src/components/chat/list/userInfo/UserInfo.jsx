import React from "react";
import "./userInfo.css";
import { useUserStore } from "../../../../lib/userStore";
const UserInfor = () => {
  const { currentUser } = useUserStore();
  if (!currentUser) {
    return <div className="userInfo">Loading...</div>;
  }
  return (
    <div className="userInfo">
      <div className="user">
        <img
          src="https://i.pinimg.com/736x/c3/c9/95/c3c9951496a19c743fd75defe47ed571.jpg"
          alt=""
        />
        <h4>{currentUser.accountName}</h4>
      </div>
      <div className="icons">
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  );
};

export default UserInfor;
