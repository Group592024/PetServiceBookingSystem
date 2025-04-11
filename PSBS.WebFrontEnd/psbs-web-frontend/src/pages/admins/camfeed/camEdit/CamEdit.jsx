import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
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
  Switch,
  FormControlLabel,
  Grow,
  Slide,
  Fade,
  Zoom,
  styled,
} from "@mui/material";
import { Close, Save, Edit, CameraAlt } from "@mui/icons-material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { keyframes } from "@emotion/react";
import CircularProgress from '@mui/material/CircularProgress';
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

const cameraStatuses = [
  { value: "InUse", label: "In Use" },
  { value: "Free", label: "Free" },
  { value: "Discard", label: "Discard" },
  { value: "UnderRepair", label: "Under Repair" },
];

const UpdateCameraModal = ({
  open,
  onClose,
  onUpdate,
  initialCamera,
}) => {
  const [animateIn, setAnimateIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const validationSchema = Yup.object().shape({
    cameraType: Yup.string()
      .required("Camera type is required")
      .max(50, "Camera type must be at most 50 characters"),
    cameraCode: Yup.string()
      .required("Camera code is required")
      .max(50, "Camera code must be at most 50 characters"),
    cameraStatus: Yup.string().required("Status is required"),
    rtspUrl: Yup.string()
      .required("RTSP URL is required")
      .matches(
        /^rtsp:\/\/(?:[a-zA-Z0-9_-]+(?::[^\s@]+)?@)?(?:[a-zA-Z0-9.-]+)(?::\d+)?(?:\/[^\s]*)?$/,
        "Invalid RTSP URL format. Example: rtsp://admin:pass@192.168.1.1:554/stream"
      )
      .max(255, "RTSP URL must be at most 255 characters"),
    cameraAddress: Yup.string()
      .required("Address is required")
      .max(255, "Address must be at most 255 characters"),
    isDeleted: Yup.boolean().required("Status is required"),
  });
  
  const safeCamera = initialCamera || {};

  const initialValues = {
    cameraId: safeCamera.cameraId || "",
    cameraType: safeCamera.cameraType || "",
    cameraCode: safeCamera.cameraCode || "",
    cameraStatus: safeCamera.cameraStatus || cameraStatuses[0].value,
    rtspUrl: safeCamera.rtspUrl || "",
    cameraAddress: safeCamera.cameraAddress || "",
    isDeleted: safeCamera.isDeleted ?? false,
  };

  const handleSubmit = async (values, { resetForm }) => { // Make async
    setIsLoading(true); // Start loading
    setAnimateIn(false);
    
    try {
      await onUpdate({ // Wait for the update to complete
        ...values,
        cameraId: initialCamera?.cameraId,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsLoading(false); // Stop loading regardless of success/failure
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
            width: { xs: "90%", sm: "80%", md: "600px" },
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
                    <CameraAlt
                      color="primary"
                      sx={{
                        verticalAlign: "middle",
                        mr: 1,
                        animation: `${pulse} 2s infinite`,
                      }}
                    />
                  </Zoom>
                  <Fade in={animateIn} style={{ transitionDelay: "200ms" }}>
                    <span>Update Camera</span>
                  </Fade>
                </Typography>
                <Zoom in={animateIn} style={{ transitionDelay: "300ms" }}>
                  <Button onClick={onClose} size="small" sx={{ minWidth: 0 }}>
                    <Close />
                  </Button>
                </Zoom>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, values, handleChange, handleBlur }) => (
                  <Form>
                    <Stack spacing={3}>
                      {/* Camera Type with fade animation */}
                      <Fade in={animateIn} style={{ transitionDelay: "400ms" }}>
                        <div>
                          <Field
                            as={TextField}
                            label="Camera Type *"
                            name="cameraType"
                            fullWidth
                            variant="outlined"
                            error={touched.cameraType && !!errors.cameraType}
                            helperText={touched.cameraType && errors.cameraType}
                            inputProps={{
                              maxLength: 50,
                            }}
                          />
                        </div>
                      </Fade>

                      {/* Camera Code with slide animation */}
                      <Slide
                        direction="right"
                        in={animateIn}
                        style={{ transitionDelay: "500ms" }}
                      >
                        <div>
                          <Field
                            as={TextField}
                            label="Camera Code *"
                            name="cameraCode"
                            fullWidth
                            variant="outlined"
                            error={touched.cameraCode && !!errors.cameraCode}
                            helperText={touched.cameraCode && errors.cameraCode}
                            inputProps={{
                              maxLength: 50,
                            }}
                          />
                        </div>
                      </Slide>

                      {/* Camera Status with fade animation */}
                      <Fade in={animateIn} style={{ transitionDelay: "600ms" }}>
                        <FormControl
                          fullWidth
                          error={touched.cameraStatus && !!errors.cameraStatus}
                        >
                          <InputLabel id="cameraStatus-label">
                            Status *
                          </InputLabel>
                          <Select
                            labelId="cameraStatus-label"
                            id="cameraStatus"
                            name="cameraStatus"
                            value={values.cameraStatus}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            label="Status *"
                          >
                            {cameraStatuses.map((status, index) => (
                              <MenuItem
                                key={status.value}
                                value={status.value}
                                sx={{
                                  transition: "all 0.3s",
                                  "&:hover": {
                                    backgroundColor: "primary.light",
                                    transform: "translateX(5px)",
                                  },
                                }}
                              >
                                {status.label}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {touched.cameraStatus && errors.cameraStatus}
                          </FormHelperText>
                        </FormControl>
                      </Fade>

                      {/* RTSP URL with slide animation */}
                      <Slide
                        direction="left"
                        in={animateIn}
                        style={{ transitionDelay: "700ms" }}
                      >
                        <div>
                          <Field
                            as={TextField}
                            label="RTSP URL *"
                            name="rtspUrl"
                            fullWidth
                            variant="outlined"
                            error={touched.rtspUrl && !!errors.rtspUrl}
                            helperText={touched.rtspUrl && errors.rtspUrl}
                            inputProps={{
                              maxLength: 255,
                            }}
                          />
                        </div>
                      </Slide>

                      {/* Camera Address with fade animation */}
                      <Fade in={animateIn} style={{ transitionDelay: "800ms" }}>
                        <div>
                          <Field
                            as={TextField}
                            label="Camera Address *"
                            name="cameraAddress"
                            fullWidth
                            variant="outlined"
                            error={touched.cameraAddress && !!errors.cameraAddress}
                            helperText={touched.cameraAddress && errors.cameraAddress}
                            inputProps={{
                              maxLength: 255,
                            }}
                          />
                        </div>
                      </Fade>

                      {/* Status with grow animation */}
                      <Grow in={animateIn} style={{ transitionDelay: "900ms" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <FormControlLabel
                            control={
                              <Switch
                                name="isDeleted"
                                checked={values.isDeleted}
                                onChange={handleChange}
                                color={values.isDeleted ? "error" : "success"}
                              />
                            }
                            label={
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                Active Status:
                                <Chip
                                  label={
                                    values.isDeleted ? "Deleted" : "Active"
                                  }
                                  color={values.isDeleted ? "error" : "success"}
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                          />
                        </Box>
                      </Grow>

                      <Divider sx={{ my: 1 }} />

                      {/* Buttons with bounce animation */}
                      {/* Buttons with bounce animation */}
              <Fade in={animateIn} style={{ transitionDelay: "1000ms" }}>
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
                    sx={{ px: 4 }}
                    disabled={isLoading} // Disable cancel button during loading
                  >
                    Cancel
                  </BounceButton>
                  <BounceButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Edit />}
                    endIcon={!isLoading && <Save />}
                    sx={{ px: 4 }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Camera"}
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

export default UpdateCameraModal;