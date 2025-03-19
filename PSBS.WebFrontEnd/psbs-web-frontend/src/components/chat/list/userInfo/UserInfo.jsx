import { useState, useEffect } from "react";
import "./userInfo.css";
import { useUserStore } from "../../../../lib/userStore";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AddPending from "../chatList/addPending/AddPending";
import signalRService from "../../../../lib/ChatService";
import Swal from "sweetalert2";

const UserInfor = () => {
  const [addMode, setAddMode] = useState(false);
  const [currentList, setCurrentList] = useState([]);
  const { currentUser } = useUserStore();

  useEffect(() => {
    if (currentUser) {
      const fetchPendingRequests = async () => {
        try {
          const pendingRequests = await signalRService.invoke(
            "GetPendingSupportRequests"
          );
          setCurrentList(pendingRequests);
          console.log("Pending requests:", pendingRequests);
        } catch (error) {
          console.error("Error fetching pending support requests:", error);
          Swal.fire("Error", "Failed to fetch pending requests.", "error");
        }
      };

      fetchPendingRequests();

      signalRService.on("SupportChatRoomCreated", (chatRoomId) => {
        Swal.fire("Success", "Support chat room created!", "success");
      });

      signalRService.on("SupportChatRoomCreationFailed", (message) => {
        Swal.fire("Error", message, "error");
      });
      signalRService.on("updatependingsupportrequests", (message) => {
        setCurrentList(message);
      });
      return () => {
        signalRService.off("SupportChatRoomCreated");
        signalRService.off("SupportChatRoomCreationFailed");
      };
    }
  }, [currentUser]);

  const handleSupportIconClick = () => {
    if (currentUser && currentUser.roleId === "user") {
      Swal.fire({
        title: "Start Support Conversation?",
        text: "Are you sure you want to initiate a support chat?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, start chat!",
        cancelButtonText: "No, cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          signalRService
            .invoke("CreateSupportChatRoom", currentUser.accountId)
            .catch((error) => {
              console.error("Error invoking CreateSupportChatRoom:", error);
              Swal.fire(
                "Error",
                "Failed to initiate chat room creation.",
                "error"
              );
            });
        }
      });
    } else if (currentUser) {
      setAddMode(true);
    }
  };

  if (!currentUser) {
    return <div className="userInfo">Loading...</div>;
  }

  return (
    <div className="userInfo">
      <div className="user">
        <img
         src={`http://localhost:5050/account-service/images/${currentUser.accountImage}`}
          alt=""
        />
        <h4>{currentUser.accountName}</h4>
      </div>
      <div className="icons">
        <div className="iconContainer">
          <SupportAgentIcon onClick={handleSupportIconClick} />
        {currentUser.roleId !=='user' &&   <span className="unreadDot">5</span>}
        </div>
      </div>

      {addMode && (
        <AddPending
          signalRService={signalRService}
          currentUser={currentUser}
          setAddMode={setAddMode}
          currentList={currentList}
        />
      )}
    </div>
  );
};

export default UserInfor;
