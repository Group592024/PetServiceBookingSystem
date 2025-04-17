import React, { useState, useRef, useEffect } from "react";
import { TextField, Autocomplete, Button } from "@mui/material";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function MedicineAddForm() {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState("");
  const [treatmentFor, setTreatmentFor] = useState(null);
  const [image, setImage] = useState(null);
  const [treatmentOptions, setTreatmentOptions] = useState([]);

  const [errors, setErrors] = useState({
    medicineName: "",
    treatmentFor: "",
    image: "",
  });

  const getToken = () => {
    return sessionStorage.getItem('token');
  };

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/Treatment/available", {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        const result = await response.json();
        if (response.ok && result.flag) {
          setTreatmentFor({ id: null, label: "None" });
          setTreatmentOptions([
            { id: null, label: "None" },
            ...result.data.map((t) => ({
              id: t.treatmentId,
              label: t.treatmentName,
            })),
          ]);
        } else {
          console.error("Failed to fetch treatments:", result.message || "Unknown error");
          Swal.fire({
            title: 'Warning',
            text: result.message || 'Failed to load treatments!',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        console.error("Error fetching treatments:", error);
        Swal.fire({
          title: 'Warning',
          text: 'Failed to load treatments!',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      }
    };

    fetchTreatments();
  }, []);

  const validateForm = () => {
    const newErrors = {
      medicineName: medicineName ? "" : "Medicine Name is required.",
      treatmentFor:
        treatmentFor && treatmentFor.id !== null
          ? ""
          : "Please select a valid treatment.",
      image: image ? "" : "Image is required.",
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("medicineName", medicineName);
    formData.append("treatmentId", treatmentFor.id);
    formData.append("imageFile", document.getElementById("fileInput").files[0]);
    formData.append("medicineStatus", false);

    try {
      const response = await fetch("http://localhost:5050/Medicines", {
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          title: 'Success',
          text: data.message || 'Medicine added successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        handleCancel();
        navigate("/medicines");
      } else {
        Swal.fire({
          title: 'Warning',
          text: data.message || 'An error occurred while adding the medicine!',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        title: 'Warning',
        text: 'An error occurred while adding the medicine!',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleCancel = () => {
    setMedicineName("");
    setTreatmentFor({ id: null, label: "None" });
    setImage(null);
    setErrors({
      medicineName: "",
      treatmentFor: "",
      image: "",
    });
    navigate("/medicines");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result); // Set the Base64 URL for preview
          setErrors((prevErrors) => ({ ...prevErrors, image: "" }));
        };
        reader.readAsDataURL(file);
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, image: "Please select a valid image file." }));
        setImage(null);
      }
    }
  };

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <div className="flex justify-center items-center min-h-screen bg-dark-grey-100 p-4">
          <div className="flex w-full sm:w-96 bg-white rounded-lg shadow-lg p-6">
            <div className="w-full flex flex-col justify-between">
              <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                Add Medicine
              </h2>
              <form onSubmit={handleSubmit}>
                {/* Medicine Name */}
                <div className="mb-4">
                  <TextField
                    label="Medicine Name"
                    variant="outlined"
                    fullWidth
                    value={medicineName}
                    onChange={(e) => {
                      setMedicineName(e.target.value);
                      if (e.target.value) {
                        setErrors((prevErrors) => ({ ...prevErrors, medicineName: "" }));
                      }
                    }}
                    error={!!errors.medicineName}
                    helperText={errors.medicineName}
                  />
                </div>

                {/* Treatment For */}
                <div className="mb-6">
                  <Autocomplete
                    value={treatmentFor}
                    onChange={(event, newValue) => {
                      setTreatmentFor(newValue);
                      if (newValue && newValue.id !== null) {
                        setErrors((prevErrors) => ({ ...prevErrors, treatmentFor: "" }));
                      }
                    }}
                    options={treatmentOptions}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Treatment For"
                        variant="outlined"
                        error={!!errors.treatmentFor}
                        helperText={errors.treatmentFor}
                      />
                    )}
                    fullWidth
                  />
                </div>

                {/* Image Upload */}
                <div className="mb-6">
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                  {errors.image && (
                    <p className="text-sm text-red-500 mt-2">{errors.image}</p>
                  )}
                </div>

                {/* Submit and Cancel Buttons */}
                <div className="flex justify-around">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className="py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-300"
                  >
                    Submit
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outlined"
                    color="secondary"
                    className="py-2 px-4 text-gray-700 border-gray-300 hover:bg-gray-200 rounded-lg focus:ring-4 focus:outline-none focus:ring-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Conditionally Display Image Preview */}
          {image && (
            <div
              className="w-full sm:w-96 bg-white rounded-lg shadow-lg p-6 ml-8 flex flex-col justify-between"
              style={{ height: "396px" }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Image Preview
              </h3>
              <img
                src={image}
                alt="Preview"
                className="w-full h-64 object-contain rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicineAddForm;
