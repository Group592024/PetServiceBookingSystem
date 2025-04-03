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
import { Close, Save, Edit, CircleNotifications } from "@mui/icons-material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { keyframes } from "@emotion/react";

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

const UpdateNotificationModal = ({
  open,
  onClose,
  onUpdate,
  initialNotification,
}) => {
  const [notificationTypes] = useState([
    { notiTypeId: "11111111-1111-1111-1111-111111111111", NotiName: "Common" },
    { notiTypeId: "22222222-2222-2222-2222-222222222222", NotiName: "Booking" },
    { notiTypeId: "33333333-3333-3333-3333-333333333333", NotiName: "Other" },
  ]);

  const [animateIn, setAnimateIn] = useState(true);

  const validationSchema = Yup.object().shape({
    notiTypeId: Yup.string().required("Notification Type is required"),
    notificationTitle: Yup.string()
      .required("Title is required")
      .max(100, "Title must be at most 100 characters"),
    notificationContent: Yup.string()
      .required("Content is required")
      .max(1000, "Content must be at most 1000 characters"),
    isDeleted: Yup.boolean().required("Status is required"),
  });

  const safeNotification = initialNotification || {};

  const initialValues = {
    notificationId: safeNotification.notificationId || "",
    notiTypeId:
      notificationTypes.find(
        (type) => type.NotiName === safeNotification.notiTypeName
      )?.notiTypeId || notificationTypes[0].notiTypeId,
    notificationTitle: safeNotification.notificationTitle || "",
    notificationContent: safeNotification.notificationContent || "",
    isDeleted: safeNotification.isDeleted ?? false,
  };

  const handleSubmit = (values, { resetForm }) => {
    setAnimateIn(false);
    setTimeout(() => {
      onUpdate({
        ...values,
        notificationId: initialNotification?.notificationId,
      });
      resetForm();
      onClose();
      setAnimateIn(true);
    }, 300);
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
                    <CircleNotifications
                      color="primary"
                      sx={{
                        verticalAlign: "middle",
                        mr: 1,
                        animation: `${pulse} 2s infinite`,
                      }}
                    />
                  </Zoom>
                  <Fade in={animateIn} style={{ transitionDelay: "200ms" }}>
                    <span>Update Notification</span>
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
                      {/* Notification Type with fade animation */}
                      <Fade in={animateIn} style={{ transitionDelay: "400ms" }}>
                        <FormControl
                          fullWidth
                          error={touched.notiTypeId && !!errors.notiTypeId}
                        >
                          <InputLabel id="notiTypeId-label">
                            Notification Type *
                          </InputLabel>
                          <Select
                            labelId="notiTypeId-label"
                            id="notiTypeId"
                            name="notiTypeId"
                            value={values.notiTypeId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            label="Notification Type *"
                          >
                            {notificationTypes.map((type, index) => (
                              <MenuItem
                                key={type.notiTypeId}
                                value={type.notiTypeId}
                                sx={{
                                  transition: "all 0.3s",
                                  "&:hover": {
                                    backgroundColor: "primary.light",
                                    transform: "translateX(5px)",
                                  },
                                }}
                              >
                                {type.NotiName}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {touched.notiTypeId && errors.notiTypeId}
                          </FormHelperText>
                        </FormControl>
                      </Fade>

                      {/* Notification Title with slide animation */}
                      <Slide
                        direction="right"
                        in={animateIn}
                        style={{ transitionDelay: "500ms" }}
                      >
                        <div>
                          <Field
                            as={TextField}
                            label="Notification Title *"
                            name="notificationTitle"
                            fullWidth
                            variant="outlined"
                            error={
                              touched.notificationTitle &&
                              !!errors.notificationTitle
                            }
                            inputProps={{
                              maxLength: 100,
                            }}
                            FormHelperTextProps={{
                              sx: {
                                display: "flex",
                                justifyContent: "space-between",
                              },
                            }}
                            helperText={
                              <>
                                {touched.notificationTitle &&
                                  errors.notificationTitle}
                                <span>
                                  {values.notificationTitle.length}/100
                                </span>
                              </>
                            }
                          />
                        </div>
                      </Slide>

                      {/* Notification Content with slide animation */}
                      <Slide
                        direction="left"
                        in={animateIn}
                        style={{ transitionDelay: "600ms" }}
                      >
                        <div>
                          <Field
                            as={TextField}
                            label="Notification Content *"
                            name="notificationContent"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            error={
                              touched.notificationContent &&
                              !!errors.notificationContent
                            }
                            inputProps={{
                              maxLength: 1000,
                            }}
                            FormHelperTextProps={{
                              sx: {
                                display: "flex",
                                justifyContent: "space-between",
                              },
                            }}
                            helperText={
                              <>
                                {touched.notificationContent &&
                                  errors.notificationContent}
                                <span>
                                  {values.notificationContent.length}/1000
                                </span>
                              </>
                            }
                          />
                        </div>
                      </Slide>

                      {/* Status with grow animation */}
                      <Grow in={animateIn} style={{ transitionDelay: "700ms" }}>
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
                                Status:
                                <Chip
                                  label={
                                    values.isDeleted ? "Inactive" : "Active"
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
                      <Fade in={animateIn} style={{ transitionDelay: "800ms" }}>
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
                          >
                            Cancel
                          </BounceButton>
                          <BounceButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            endIcon={<Save />}
                            sx={{ px: 4 }}
                          >
                            Update Notification
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

export default UpdateNotificationModal;
