import React from "react";
import { 
  Modal, 
  Box, 
  Typography, 
  Chip, 
  Button,
  Divider,
  Stack,
  Paper,
  Link
} from "@mui/material";
import { Close, CameraAlt } from "@mui/icons-material";

const CameraDetailModal = ({ open, onClose, camera }) => {
  if (!camera) {
    return null;
  }

  const {
    cameraId,
    cameraType,
    cameraCode,
    cameraStatus,
    rtspUrl,
    cameraAddress,
    isDeleted,
  } = camera;

  const getStatusColor = (status) => {
    switch(status) {
      case 'InUse': return 'primary';
      case 'Free': return 'info';
      case 'Discard': return 'default';
      case 'UnderRepair': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'InUse': return 'In Use';
      case 'Free': return 'Free';
      case 'Discard': return 'Discarded';
      case 'UnderRepair': return 'Under Repair';
      default: return status;
    }
  };

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
              <CameraAlt sx={{ verticalAlign: 'middle', mr: 1 }} />
              Camera Details
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
                Camera ID
              </Typography>
              <Typography variant="body1" fontFamily="monospace">
                {cameraId}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Camera Code
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {cameraCode}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Camera Type
              </Typography>
              <Typography variant="body1">
                {cameraType}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                RTSP URL
              </Typography>
              <Link 
                href={rtspUrl} 
                target="_blank" 
                rel="noopener"
                sx={{ 
                  wordBreak: 'break-all',
                  display: 'inline-block',
                  mt: 0.5
                }}
              >
                {rtspUrl}
              </Link>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Camera Address
              </Typography>
              <Typography variant="body1">
                {cameraAddress}
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
                Camera Status
              </Typography>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Operational Status:
                  </Typography>
                  <Chip 
                    label={getStatusLabel(cameraStatus)} 
                    color={getStatusColor(cameraStatus)} 
                    size="small"
                    variant="outlined"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    System Status:
                  </Typography>
                  {isDeleted ? (
                    <Chip 
                      label="Deleted" 
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
              startIcon={<Close />}
            >
              Close
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
};

export default CameraDetailModal;