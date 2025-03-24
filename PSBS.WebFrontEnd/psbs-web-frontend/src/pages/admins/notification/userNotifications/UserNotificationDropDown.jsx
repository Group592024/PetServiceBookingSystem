import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import {
  Close,
  Notifications as NotificationsIcon,
  CheckCircle,
  ErrorOutline,
  Refresh,
  Delete,
} from "@mui/icons-material";
import { getData, deleteData } from "../../../../Utilities/ApiFunctions";
import Swal from "sweetalert2";

const NotificationsDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const id = sessionStorage.getItem("accountId");
      const response = await getData(`api/Notification/user/${id}`);

      if (response.flag) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n) => !n.isRead).length);
      } else {
        throw new Error(response.message || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContextMenu = (event, notification) => {
    event.preventDefault();
    setSelectedNotification(notification);
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      const response = await deleteData(
        `api/Notification/user/${selectedNotification.notificationId}`
      );

      if (response.flag) {
        setNotifications((prev) =>
          prev.filter(
            (n) => n.notificationId !== selectedNotification.notificationId
          )
        );

        if (!selectedNotification.isRead) {
          setUnreadCount((prev) => prev - 1);
        }

        // // Optional: Show success message
        // Swal.fire({
        //   title: "Success",
        //   text: "Notification deleted successfully",
        //   icon: "success",
        //   timer: 2000,
        //   showConfirmButton: false,
        // });
      } else {
        throw new Error(response.message || "Failed to delete notification");
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      Swal.fire({
        title: "Error",
        text: err.message || "Failed to delete notification. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      handleCloseContextMenu();
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount((prev) => prev - 1);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }
    // Handle navigation or other actions
    console.log("Notification clicked:", notification);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Booking":
        return <NotificationsIcon color="primary" />;
      case "Common":
        return <NotificationsIcon color="secondary" />;
      default:
        return <NotificationsIcon />;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Box
      sx={{
        position: "absolute",
        right: 0,
        top: "100%",
        width: "350px",
        maxHeight: "400px",
        overflowY: "auto",
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        borderRadius: "8px",
        zIndex: 1000,
        padding: "12px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Typography>
        <Box>
          <IconButton
            onClick={markAllAsRead}
            size="small"
            disabled={unreadCount === 0}
            title="Mark all as read"
          >
            <CheckCircle fontSize="small" />
          </IconButton>
          <IconButton onClick={fetchNotifications} size="small" title="Refresh">
            <Refresh fontSize="small" />
          </IconButton>
          <IconButton onClick={onClose} size="small">
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Divider />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 2,
            textAlign: "center",
          }}
        >
          <ErrorOutline color="error" sx={{ fontSize: 48, mb: 1 }} />
          <Typography color="error">{error}</Typography>
          <Button
            variant="outlined"
            onClick={fetchNotifications}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      ) : notifications.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 3,
            textAlign: "center",
          }}
        >
          <CheckCircle sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No notifications available
          </Typography>
        </Box>
      ) : (
        <>
          {notifications.map((notification) => (
            <Box
              key={notification.notificationId}
              sx={{
                padding: "12px 8px",
                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                cursor: "pointer",
                backgroundColor: notification.isRead
                  ? "inherit"
                  : "rgba(0, 0, 0, 0.04)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.08)",
                },
                opacity: notification.isDeleted ? 0.6 : 1,
              }}
              onClick={() => handleNotificationClick(notification)}
              onContextMenu={(e) => handleContextMenu(e, notification)}
            >
              <Box
                sx={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
              >
                <Box sx={{ marginTop: "4px" }}>
                  {getNotificationIcon(notification.notiTypeName)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={notification.isRead ? "normal" : "bold"}
                    >
                      {notification.notificationTitle}
                    </Typography>
                    <Chip
                      label={notification.notiTypeName}
                      size="small"
                      color={
                        notification.notiTypeName === "Booking"
                          ? "primary"
                          : notification.notiTypeName === "Common"
                          ? "secondary"
                          : "default"
                      }
                      variant="outlined"
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontWeight: notification.isRead ? "normal" : "500",
                      margin: "4px 0",
                    }}
                  >
                    {notification.notificationContent}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(notification.createdDate), {
                        addSuffix: true,
                      })}
                    </Typography>
                    {notification.isDeleted && (
                      <Chip
                        label="Inactive"
                        size="small"
                        color="error"
                        sx={{ ml: 1 }}
                      />
                    )}
                    {!notification.isRead && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "primary.main",
                          ml: 1,
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </>
      )}

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleDeleteNotification}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2" color="error">
            Delete Notification
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NotificationsDropdown;
