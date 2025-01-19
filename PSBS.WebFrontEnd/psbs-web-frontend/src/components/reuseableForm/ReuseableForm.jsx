import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const EditableDiv = ({ onSubmit, fields, title, initialData, view }) => {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    if (initialData) {
      const formattedData = { ...initialData };
      fields.forEach((field) => {
        if (field.type === "Date" && initialData[field.name]) {
          const date = new Date(initialData[field.name]);
          formattedData[field.name] = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
        }
      });
      setFormValues(formattedData);
    } else {
      setFormValues(
        fields.reduce((acc, field) => {
          acc[field.name] = field.type === "bool" ? false : "";
          return acc;
        }, {})
      );
    }
  }, [initialData, fields]);

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
      if (
        !value &&
        field.type !== "bool" &&
        field.type !== "Date" &&
        !field.pass
      ) {
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
    }
  };

  // Function to navigate back to the previous page
  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full">
      <Typography
        variant="h6"
        component="h2"
        className="text-lg font-semibold mb-4"
      >
        {title}
      </Typography>
      <Grid container spacing={2}>
        {fields.map(
          (field) =>
            !field.pass && (
              <Grid item xs={12} sm={6} key={field.name}>
                {field.type === "bool" ? (
                  <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel htmlFor={field.name}>{field.label}</InputLabel>
                    <Select
                      id={field.name}
                      name={field.name}
                      value={
                        formValues[field.name] !== undefined
                          ? formValues[field.name]
                          : false
                      }
                      onChange={handleChange}
                      label={field.label}
                      readOnly={field.disabled || view}
                    >
                      <MenuItem value={true}>True</MenuItem>
                      <MenuItem value={false}>False</MenuItem>
                    </Select>
                  </FormControl>
                ) : field.type === "Date" ? (
                  <TextField
                    fullWidth
                    margin="normal"
                    label={field.label}
                    name={field.name}
                    type="date"
                    value={formValues[field.name] || ""}
                    onChange={handleChange}
                    error={!!errors[field.name]}
                    helperText={errors[field.name]}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      readOnly: view || field.disabled,
                    }}
                    className="mb-4"
                  />
                ) : field.type === "integer" ? (
                  <TextField
                    fullWidth
                    margin="normal"
                    label={field.label}
                    name={field.name}
                    value={
                      formValues[field.name] !== undefined &&
                      formValues[field.name] !== null
                        ? formValues[field.name]
                        : ""
                    }
                    onChange={handleChange}
                    error={!!errors[field.name]}
                    helperText={errors[field.name]}
                    InputProps={{
                      readOnly: view || field.disabled,
                    }}
                    className="mb-4"
                  />
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
              </Grid>
            )
        )}
      </Grid>

      <div className="flex justify-around mt-4">
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleGoBack} // Trigger the navigate back
        >
          Back
        </Button>
        {!view && (
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default EditableDiv;
