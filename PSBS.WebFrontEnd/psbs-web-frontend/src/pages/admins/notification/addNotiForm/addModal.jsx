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
import { Close, Send } from "@mui/icons-material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CircularProgress from '@mui/material/CircularProgress';
const CreateNotificationModal = ({ open, onClose, onCreate }) => {
  const [notificationTypes] = useState([
    { NotiTypeId: "11111111-1111-1111-1111-111111111111", NotiName: "Common" },
    { NotiTypeId: "22222222-2222-2222-2222-222222222222", NotiName: "Booking" },
    { NotiTypeId: "33333333-3333-3333-3333-333333333333", NotiName: "Other" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const validationSchema = Yup.object().shape({
    NotiTypeId: Yup.string().required("Notification Type is required"),
    NotificationTitle: Yup.string()
      .required("Title is required")
      .max(100, "Title must be at most 100 characters"),
    NotificationContent: Yup.string()
      .required("Content is required")
      .max(1000, "Content must be at most 1000 characters"),
  });

  const initialValues = {
    NotiTypeId: notificationTypes[0].NotiTypeId,
    NotificationTitle: "",
    NotificationContent: "",
  };

  const handleSubmit = async (values, { resetForm }) => {
    setIsLoading(true);
    try {
      await onCreate(values);
      resetForm();
      onClose();
    } catch (error) {
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
              Create New Notification
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
                  {/* Notification Type */}
                  <FormControl
                    fullWidth
                    error={touched.NotiTypeId && !!errors.NotiTypeId}
                  >
                    <InputLabel id="notiTypeId-label">
                      Notification Type *
                    </InputLabel>
                    <Select
                      labelId="notiTypeId-label"
                      id="NotiTypeId"
                      name="NotiTypeId"
                      value={values.NotiTypeId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Notification Type *"
                    >
                      {notificationTypes.map((type) => (
                        <MenuItem key={type.NotiTypeId} value={type.NotiTypeId}>
                          {type.NotiName}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {touched.NotiTypeId && errors.NotiTypeId}
                    </FormHelperText>
                  </FormControl>

                  {/* Notification Title */}
                  <Field
                    as={TextField}
                    label="Notification Title *"
                    name="NotificationTitle"
                    fullWidth
                    variant="outlined"
                    error={
                      touched.NotificationTitle && !!errors.NotificationTitle
                    }
                    helperText={
                      touched.NotificationTitle && errors.NotificationTitle
                    }
                    inputProps={{
                      maxLength: 100,
                    }}
                    FormHelperTextProps={{
                      sx: { display: "flex", justifyContent: "space-between" },
                    }}
                  />

                  {/* Notification Content */}
                  <Field
                    as={TextField}
                    label="Notification Content *"
                    name="NotificationContent"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    error={
                      touched.NotificationContent &&
                      !!errors.NotificationContent
                    }
                    inputProps={{
                      maxLength: 1000,
                    }}
                    FormHelperTextProps={{
                      sx: { display: "flex", justifyContent: "space-between" },
                    }}
                    helperText={
                      <>
                        {touched.NotificationContent &&
                          errors.NotificationContent}
                        <span>{values.NotificationContent.length}/1000</span>
                      </>
                    }
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
                          <Send />
                        )
                      }
                      sx={{ px: 4, minWidth: 180 }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Notification"}
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

export default CreateNotificationModal;
