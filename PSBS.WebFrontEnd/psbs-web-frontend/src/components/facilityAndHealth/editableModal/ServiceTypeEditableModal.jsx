import React, { useState, useEffect } from "react";
import { Modal, TextField, Button, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

const EditableModal = ({
  open,
  onClose,
  onSubmit,
  fields,
  title,
  initialData,
  view, // New parameter
}) => {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  useEffect(() => {
    if (open && initialData) {
      console.log("Initial createAt (UTC):", new Date(initialData.createAt).toISOString());
      console.log("Initial updateAt (UTC):", new Date(initialData.updateAt).toISOString());

      setFormValues({
        ...initialData,
      });
    } else if (open) {
      setFormValues(
        fields.reduce((acc, field) => {
          acc[field.name] = field.type === 'bool' ? false : '';
          return acc;
        }, {})
      );
    } else {
      setFormValues({});
      setErrors({});
    }
  }, [open, initialData, fields]);

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let tempErrors = {};
    fields.forEach((field) => {
      const value = formValues[field.name];
      if (!value && field.type !== 'bool' && !field.pass) {
        tempErrors[field.name] = `${field.label} is required`;
      } else if (field.type === 'integer' && !/^\d+$/.test(value)) {
        tempErrors[field.name] = `${field.label} must be a valid integer`;
      } else if (field.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
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
      const createAtDate = formValues.createAt ? new Date(formValues.createAt) : null;
      const updateAtDate = new Date();
  
      if (createAtDate && !isNaN(createAtDate)) {
        console.log("Submitted createAt (UTC):", createAtDate.toISOString());
      } else {
        console.error("Invalid createAt value");
      }
  
      console.log("Submitted updateAt (UTC):", updateAtDate.toISOString());
  
      const dataToSubmit = {
        ...formValues,
        updateAt: updateAtDate.toISOString(),
      };
  
      onSubmit(dataToSubmit);
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
            !field.pass && (
              <div key={field.name}>
                {field.type === 'bool' ? (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      name={field.name}
                      value={formValues[field.name] !== undefined ? formValues[field.name] : false}
                      onChange={handleChange}
                      readOnly={field.disabled || view}
                      style={{ color: formValues[field.name] ? 'red' : 'green' }}
                    >
                      <MenuItem value={true} style={{ color: 'red' }}>Stopping</MenuItem>
                      <MenuItem value={false} style={{ color: 'green' }}>Active</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    margin="normal"
                    label={field.label}
                    name={field.name}
                    value={field.name === 'createAt' || field.name === 'updateAt' 
                      ? formatDate(formValues[field.name]) 
                      : formValues[field.name] || ""}
                    onChange={handleChange}
                    error={!!errors[field.name]}
                    helperText={errors[field.name]}
                    InputProps={{
                      readOnly: view || field.disabled,
                    }}
                    className="mb-4"
                  />
                )}
              </div>
            )
          ))}
          <div className="flex justify-around mt-4">
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Close
            </Button>
            {!view && (
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditableModal;
