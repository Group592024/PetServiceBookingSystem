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
} from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

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
  // **Validation Schema**
  const validationSchema = Yup.object().shape({
    notiTypeId: Yup.string().required("Notification Type is required"),
    notificationTitle: Yup.string().required("Title is required"),
    notificationContent: Yup.string().required("Content is required"),
    isDeleted: Yup.boolean().required("Status is required"),
  });

  // Ensure initialNotification is valid
  const safeNotification = initialNotification || {};

  // Initial Values - Mapping `notiTypeName` to `notiTypeId`
  const initialValues = {
    notificationId: safeNotification.notificationId || "", // Store it but don't display
    notiTypeId:
      notificationTypes.find(
        (type) => type.NotiName === safeNotification.notiTypeName
      )?.notiTypeId || notificationTypes[0].notiTypeId,
    notificationTitle: safeNotification.notificationTitle || "",
    notificationContent: safeNotification.notificationContent || "",
    isDeleted: safeNotification.isDeleted ?? false,
  };

  // **Submit Handler**
  const handleSubmit = (values, { resetForm }) => {
    onUpdate({
      ...values,
      notificationId: initialNotification?.notificationId,
    });
    resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <Box className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-lg font-semibold mb-4">Update Notification</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, handleChange }) => (
            <Form className="space-y-4">
              {/* Notification Type */}
              <FormControl fullWidth>
                <InputLabel id="notiTypeId-label" shrink>
                  Notification Type
                </InputLabel>
                <Select
                  labelId="notiTypeId-label"
                  id="notiTypeId"
                  name="notiTypeId"
                  value={values.notiTypeId}
                  onChange={handleChange}
                  className="!text-black"
                  label="Notification Type"
                >
                  {notificationTypes.map((type) => (
                    <MenuItem key={type.notiTypeId} value={type.notiTypeId}>
                      {type.NotiName}
                    </MenuItem>
                  ))}
                </Select>
                <ErrorMessage
                  name="notiTypeId"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </FormControl>

              {/* Notification Title */}
              <Field
                as={TextField}
                label="Notification Title"
                name="notificationTitle"
                fullWidth
                margin="normal"
                error={touched.notificationTitle && !!errors.notificationTitle}
                helperText={
                  touched.notificationTitle && errors.notificationTitle
                }
                className="!text-black"
              />

              {/* Notification Content */}
              <Field
                as={TextField}
                label="Notification Content"
                name="notificationContent"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                error={
                  touched.notificationContent && !!errors.notificationContent
                }
                helperText={
                  touched.notificationContent && errors.notificationContent
                }
                className="!text-black"
              />

              {/* Is Deleted */}
              <FormControl fullWidth>
                <InputLabel id="isDeleted-label" shrink>
                  Status
                </InputLabel>
                <Select
                  labelId="isDeleted-label"
                  id="isDeleted"
                  name="isDeleted"
                  value={values.isDeleted}
                  onChange={handleChange}
                  className="!text-black"
                  label="Status"
                >
                  <MenuItem value={false}>Active</MenuItem>
                  <MenuItem value={true}>Inactive</MenuItem>
                </Select>
                <ErrorMessage
                  name="isDeleted"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </FormControl>

              {/* Buttons */}
              <div className="flex justify-between mt-4">
                <Button onClick={onClose}>Back</Button>
                <Button type="submit" variant="contained" color="primary">
                  Confirm
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};

export default UpdateNotificationModal;
