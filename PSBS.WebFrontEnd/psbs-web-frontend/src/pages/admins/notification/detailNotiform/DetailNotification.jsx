import React from "react";
import { 
  Modal, 
  Box, 
  Typography, 
  Chip, 
  Button,
  Divider,
  Stack,
  Paper
} from "@mui/material";
import { Close } from "@mui/icons-material";

const NotificationDetailModal = ({ open, onClose, notification }) => {
  if (!notification) {
    return null;
  }

  const {
    notificationId,
    notiTypeName,
    notificationTitle,
    notificationContent,
    createdDate,
    isDeleted,
    isPushed,
  } = notification;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "600px" },
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          outline: "none"
        }}
      >
        <Paper elevation={0} sx={{ p: 3 }}>
          {/* Header */}
          <Box 
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2
            }}
          >
            <Typography variant="h5" component="h2" fontWeight="bold">
              Notification Details
            </Typography>
            <Button 
              onClick={onClose} 
              size="small" 
              sx={{ minWidth: 0 }}
            >
              <Close />
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Content */}
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Notification ID
              </Typography>
              <Typography variant="body1">
                {notificationId}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Title
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {notificationTitle}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Content
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: "pre-wrap",
                  p: 1,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  mt: 0.5
                }}
              >
                {notificationContent}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Created Date
              </Typography>
              <Typography variant="body1">
                {new Date(createdDate).toLocaleString()}
              </Typography>
            </Box>
            
            {/* Status Group */}
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2,
                borderRadius: 2,
                borderColor: 'divider'
              }}
            >
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                sx={{ mb: 1 }}
              >
                Notification Status
              </Typography>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Type:
                  </Typography>
                  <Chip 
                    label={notiTypeName} 
                    color="primary" 
                    size="small"
                    variant="outlined"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Push:
                  </Typography>
                  {isPushed ? (
                    <Chip 
                      label="Pushed" 
                      color="success" 
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Chip 
                      label="Pending" 
                      color="warning" 
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Status:
                  </Typography>
                  {isDeleted ? (
                    <Chip 
                      label="Inactive" 
                      color="error" 
                      size="small"
                     
                    />
                  ) : (
                    <Chip 
                      label="Active" 
                      color="success" 
                      size="small"
                     
                    />
                  )}
                </Box>
              </Stack>
            </Paper>
          </Stack>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Footer */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button 
              onClick={onClose} 
              variant="contained" 
              color="primary"
              size="medium"
              sx={{ px: 4 }}
            >
              Close
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
};

export default NotificationDetailModal;