import React, { useState, useRef } from "react";
import { TextField, Autocomplete, Button } from "@mui/material";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";

function MedicineAddForm() {
  const sidebarRef = useRef(null);
  const [medicineName, setMedicineName] = useState("");
  const [treatmentFor, setTreatmentFor] = useState(null);
  const [image, setImage] = useState(null);

  // Temporary data for the Autocomplete options
  const treatmentOptions = [
    { label: "Vaccine" },
    { label: "Deworming" },
    { label: "Pain Relief" },
    { label: "Antibiotic" },
    { label: "Cold Relief" },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Medicine Name:", medicineName);
    console.log("Treatment For:", treatmentFor);
    console.log("Image File:", image);
  };

  const handleCancel = () => {
    setMedicineName("");
    setTreatmentFor(null);
    setImage(null); // Reset image preview
    document.getElementById("fileInput").value = ""; // Reset file input value
  };

  // Handle image file change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(URL.createObjectURL(file)); // Create image URL for preview
    } else {
      alert("Please select a valid image file");
    }
  };

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <div className="flex justify-center items-center min-h-screen bg-dark-grey-100 p-4">
          <div className="flex w-full sm:w-96 bg-white rounded-lg shadow-lg p-6">
            {/* Form Card */}
            <div className="w-full flex flex-col justify-between">
              <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                Add Medicine
              </h2>
              <form onSubmit={handleSubmit}>
                {/* Medicine Name TextField */}
                <div className="mb-4">
                  <TextField
                    label="Medicine Name"
                    variant="outlined"
                    fullWidth
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Treatment For Autocomplete */}
                <div className="mb-6">
                  <Autocomplete
                    value={treatmentFor}
                    onChange={(event, newValue) => setTreatmentFor(newValue)}
                    options={treatmentOptions}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Treatment For"
                        variant="outlined"
                        className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                    fullWidth
                  />
                </div>

                {/* Image File Upload */}
                <div className="mb-6">
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                  />
                  {image && (
                    <p className="text-sm text-gray-500 mt-2">
                      Selected File: {image.name}
                    </p>
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
            <div className="w-full sm:w-96 bg-white rounded-lg shadow-lg p-6 ml-8 flex flex-col justify-between" style={{ height: '396px' }}>
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
