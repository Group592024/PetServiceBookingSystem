import React, { useState, useEffect } from "react";
import { Modal, TextField, Button, Typography } from "@mui/material";

const detailModal = ({
  open,
  onClose,
  onSubmit,
  fields,
  title,
  initialData,
}) => {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && initialData) {
      setFormValues(initialData);
    } else if (open) {
      setFormValues(
        fields.reduce((acc, field) => {
          acc[field.name] = "";
          return acc;
        }, {})
      );
    } else {
      setFormValues({});
      setErrors({});
    }
  }, [open, initialData, fields]);

  const handleChange = (e) => {
    console.log("Form Value Changed:", e.target.name, e.target.value); // Track input changes
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };
  const validate = () => {
    let tempErrors = {};

    fields.forEach((field) => {
      const value = formValues[field.name];

      if (!value) {
        tempErrors[field.name] = `${field.label} is required`;
      } else if (field.type === "integer" && !/^\d+$/.test(value)) {
        tempErrors[field.name] = `${field.label} must be a valid integer`;
      } else if (field.type === "email" && !/\S+@\S+\.\S+/.test(value)) {
        tempErrors[field.name] = `${field.label} is not a valid email address`;
      }

      if (field.customValidation) {
        const customError = field.customValidation(value);
        if (customError) {
          tempErrors[field.name] = customError;
        }
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formValues);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <Typography
            id="modal-title"
            variant="h6"
            component="h2"
            className="text-lg font-semibold mb-4"
          >
            {title}
          </Typography>
          {fields.map((field) => (
            <TextField
              key={field.name}
              fullWidth
              margin="normal"
              label={field.label}
              name={field.name}
              value={formValues[field.name] || ""}
              onChange={handleChange}
              error={!!errors[field.name]}
              helperText={errors[field.name]}
              className="mb-4"
              disabled
            />
          ))}
          <div className="flex justify-around mt-4">
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Close
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default detailModal;
