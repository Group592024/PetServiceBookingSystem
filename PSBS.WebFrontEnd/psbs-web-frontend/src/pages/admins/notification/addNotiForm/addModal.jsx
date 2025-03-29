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

const CreateNotificationModal = ({ open, onClose, onCreate }) => {
  const [notificationTypes, setNotificationTypes] = useState([
    { NotiTypeId: "11111111-1111-1111-1111-111111111111", NotiName: "Common" },
    { NotiTypeId: "22222222-2222-2222-2222-222222222222", NotiName: "Booking" },
    { NotiTypeId: "33333333-3333-3333-3333-333333333333", NotiName: "Other" },
  ]);

  const validationSchema = Yup.object().shape({
    NotiTypeId: Yup.string().required("Notification Type is required"),
    NotificationTitle: Yup.string().required("Title is required"),
    NotificationContent: Yup.string().required("Content is required"),
  });

  const initialValues = {
    NotiTypeId: notificationTypes[0].NotiTypeId,
    NotificationTitle: "",
    NotificationContent: "",
  };

  const handleSubmit = (values, { resetForm }) => {
    onCreate(values);
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
        <h2 className="text-lg font-semibold mb-4">Create Notification</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, handleChange }) => (
            <Form className="space-y-4">
              <FormControl fullWidth>
                <InputLabel id="notiTypeId-label" shrink>
                  Notification Type
                </InputLabel>
                <Select
                  labelId="notiTypeId-label"
                  id="NotiTypeId"
                  name="NotiTypeId"
                  value={values.NotiTypeId}
                  onChange={handleChange}
                  label="Notification Type" // ✅ Add label prop here
                  className="!text-black"
                >
                  {notificationTypes.map((type) => (
                    <MenuItem key={type.NotiTypeId} value={type.NotiTypeId}>
                      {type.NotiName}
                    </MenuItem>
                  ))}
                </Select>
                <ErrorMessage
                  name="NotiTypeId"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </FormControl>

              <Field
                as={TextField}
                label="Notification Title"
                name="NotificationTitle"
                fullWidth
                margin="normal"
                error={touched.NotificationTitle && !!errors.NotificationTitle}
                helperText={
                  touched.NotificationTitle && errors.NotificationTitle
                }
                className="!text-black"
              />

              <Field
                as={TextField}
                label="Notification Content"
                name="NotificationContent"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                error={
                  touched.NotificationContent && !!errors.NotificationContent
                }
                helperText={
                  touched.NotificationContent && errors.NotificationContent
                }
                className="!text-black"
              />

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

export default CreateNotificationModal;
