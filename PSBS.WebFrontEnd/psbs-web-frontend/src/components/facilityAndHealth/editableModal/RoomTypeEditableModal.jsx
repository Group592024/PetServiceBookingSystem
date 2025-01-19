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

  useEffect(() => {
    if (open && initialData) {
      setFormValues({
        ...initialData,
        price: parseFloat(initialData.price),   
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

    const price = parseFloat(formValues.price);

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const submittedData = {
        ...formValues,
        price: parseFloat(formValues.price),   
      };
      
      onSubmit(submittedData);
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
                    value={formValues[field.name] || ""}
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
