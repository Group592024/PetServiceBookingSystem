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
  FormHelperText,
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CircularProgress from '@mui/material/CircularProgress';

// Removed the cameraTypes array since we'll allow free text input

const cameraStatuses = [
  { value: "InUse", label: "In Use" },
  { value: "Free", label: "Free" },
  { value: "Discard", label: "Discard" },
  { value: "UnderRepair", label: "Under Repair" },
];

const CreateCameraModal = ({ open, onClose, onCreate }) => {
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
  
  
  

  const initialValues = {
    cameraType: "", // Changed from dropdown default to empty string
    cameraCode: "",
    cameraStatus: cameraStatuses[0].value,
    rtspUrl: "",
    cameraAddress: "",
    isDeleted: false,
  };

  const handleSubmit = async (values, { resetForm }) => {
    setIsLoading(true);
    try {
      await onCreate(values);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating camera:", error);
    } finally {
      setIsLoading(false);
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
          width: { xs: "90%", sm: "80%", md: "500px" },
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          outline: "none",
        }}
      >
        <Paper elevation={0} sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" component="h2" fontWeight="bold">
              Add New Camera
            </Typography>
            <Button onClick={onClose} size="small" sx={{ minWidth: 0 }}>
              <Close />
            </Button>
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
                  {/* Camera Type - Changed to TextField */}
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

                  {/* Camera Code */}
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

                  {/* Camera Status - Still a dropdown */}
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
                      {cameraStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {touched.cameraStatus && errors.cameraStatus}
                    </FormHelperText>
                  </FormControl>

                  {/* RTSP URL */}
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

                  {/* Camera Address */}
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

                  <Divider sx={{ my: 1 }} />

                  {/* Buttons */}
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Button
                      onClick={onClose}
                      variant="outlined"
                      color="inherit"
                      sx={{ px: 4 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      endIcon={
                        isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          <Save />
                        )
                      }
                      sx={{ px: 4, minWidth: 180 }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Camera"}
                    </Button>
                  </Box>
                </Stack>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Modal>
  );
};

export default CreateCameraModal;