import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Paper,
  Stack,
  Chip,
  FormHelperText,
  Grow,
  Slide,
  Fade,
  Zoom,
  styled,
  CircularProgress
} from "@mui/material";
import { Close, Save, LinkOff, Link } from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { keyframes } from "@emotion/react";
import { getData, updateData } from "../../../../Utilities/ApiFunctions";
import Swal from 'sweetalert2'; // Import SweetAlert

// Custom pulse animation
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components with animations
const AnimatedPaper = styled(Paper)(({ theme }) => ({
  animation: `${pulse} 0.5s ${theme.transitions.easing.easeInOut}`,
}));

const BounceButton = styled(Button)(({ theme }) => ({
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const AssignCamera = ({ open, onClose, roomHistoryId, cameraId, onSuccess }) => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(true);

  // Fetch available cameras when the modal opens
  useEffect(() => {
    if (open) {
      fetchCameras();
    }
  }, [open]);

  const fetchCameras = async () => {
    try {
      const response = await getData("api/Camera");
      // Filter cameras to only show those with "Free" status
      const availableCameras = response.data.filter(camera => 
        camera.cameraStatus === "Free" && !camera.isDeleted
      );
      setCameras(availableCameras);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };

  const validationSchema = Yup.object().shape({
    cameraId: Yup.string().required("Camera selection is required")
  });

  const initialValues = {
    cameraId: ""
  };

  const handleSubmit = async (values, { resetForm }) => {
    // Check if there's already a camera assigned (cameraId is not null)
    if (cameraId) {
      // Show warning with SweetAlert
      const result = await Swal.fire({
        title: 'Warning!',
        text: 'This room already has a camera assigned. If you proceed, the current camera will be marked as under repair. Do you want to continue?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, assign new camera',
        cancelButtonText: 'Cancel'
      });
      
      // If user cancels, return early
      if (!result.isConfirmed) {
        return;
      }
    }
    
    setLoading(true);
    setAnimateIn(false);
    
    try {
      const assignData = {
        reoomHistoryId: roomHistoryId, 
        cameraId: values.cameraId
      };
      
      const response = await updateData("api/Camera/assign", assignData);
      
      if (response.flag) {
        Swal.fire({
          title: 'Success!',
          text: 'Camera assigned successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        if (onSuccess) onSuccess();
        resetForm();
        onClose();
      } else {
        Swal.fire({
          title: 'Error!',
          text: response.message || 'Failed to assign camera',
          icon: 'error'
        });
        console.error("Failed to assign camera:", response.message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while assigning the camera',
        icon: 'error'
      });
      console.error("Error assigning camera:", error);
    } finally {
      setLoading(false);
      setAnimateIn(true);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Grow in={open} timeout={300}>
        <Box
          sx={{
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            outline: "none",
            width: { xs: "90%", sm: "80%", md: "500px" },
          }}
        >
          <Slide direction="up" in={animateIn} mountOnEnter unmountOnExit>
            <AnimatedPaper elevation={10} sx={{ p: 3, borderRadius: 3 }}>
              {/* Header with icon animation */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="h2" fontWeight="bold">
                  <Zoom in={animateIn} style={{ transitionDelay: "100ms" }}>
                    <Link
                      color="primary"
                      sx={{
                        verticalAlign: "middle",
                        mr: 1,
                        animation: `${pulse} 2s infinite`,
                      }}
                    />
                  </Zoom>
                  <Fade in={animateIn} style={{ transitionDelay: "200ms" }}>
                    <span>Assign Camera to Room</span>
                  </Fade>
                </Typography>
                <Zoom in={animateIn} style={{ transitionDelay: "300ms" }}>
                  <Button onClick={onClose} size="small" sx={{ minWidth: 0 }}>
                    <Close />
                  </Button>
                </Zoom>
              </Box>
              <Divider sx={{ my: 2 }} />
              
              {/* Display info about current camera if one exists */}
              {cameraId && (
                <Fade in={animateIn} style={{ transitionDelay: "350ms" }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      icon={<Link />}
                      label="This room already has a camera assigned" 
                      color="warning" 
                      variant="outlined"
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                    />
                  </Box>
                </Fade>
              )}
              
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, values, handleChange, handleBlur, setFieldValue }) => (
                  <Form>
                    <Stack spacing={3}>
                      {/* Camera Selection */}
                      <Fade in={animateIn} style={{ transitionDelay: "400ms" }}>
                        <FormControl
                          fullWidth
                          error={touched.cameraId && !!errors.cameraId}
                        >
                          <InputLabel id="camera-select-label">
                            Select Camera *
                          </InputLabel>
                          <Select
                            labelId="camera-select-label"
                            id="cameraId"
                            name="cameraId"
                            value={values.cameraId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            label="Select Camera *"
                          >
                            {cameras.length === 0 ? (
                              <MenuItem disabled value="">
                                No available cameras
                              </MenuItem>
                            ) : (
                              cameras.map((camera) => (
                                <MenuItem
                                  key={camera.cameraId}
                                  value={camera.cameraId}
                                  sx={{
                                    transition: "all 0.3s",
                                    "&:hover": {
                                      backgroundColor: "primary.light",
                                      transform: "translateX(5px)",
                                    },
                                  }}
                                >
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography>{camera.cameraCode}</Typography>
                                    <Chip 
                                      size="small" 
                                      label={camera.cameraType} 
                                      color="info" 
                                      variant="outlined" 
                                    />
                                  </Stack>
                                </MenuItem>
                              ))
                            )}
                          </Select>
                          <FormHelperText>
                            {touched.cameraId && errors.cameraId}
                          </FormHelperText>
                        </FormControl>
                      </Fade>

                      <Divider sx={{ my: 1 }} />
                      
                      {/* Action Buttons */}
                      <Fade in={animateIn} style={{ transitionDelay: "500ms" }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <BounceButton
                            onClick={onClose}
                            variant="outlined"
                            color="inherit"
                            sx={{ px: 3 }}
                            disabled={loading}
                            startIcon={<LinkOff />}
                          >
                            Cancel
                          </BounceButton>
                          <BounceButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Link />}
                            sx={{ px: 3 }}
                            disabled={loading || cameras.length === 0}
                          >
                            {loading ? "Assigning..." : "Assign Camera"}
                          </BounceButton>
                        </Box>
                      </Fade>
                    </Stack>
                  </Form>
                )}
              </Formik>
            </AnimatedPaper>
          </Slide>
        </Box>
      </Grow>
    </Modal>
  );
};

export default AssignCamera;
