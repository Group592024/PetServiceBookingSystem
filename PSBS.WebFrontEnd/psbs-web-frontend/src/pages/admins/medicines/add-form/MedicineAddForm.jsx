import React, { useState, useRef, useEffect } from "react";
import { TextField, Autocomplete, Button } from "@mui/material";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function MedicineAddForm() {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState("");
  const [treatmentFor, setTreatmentFor] = useState(null);
  const [image, setImage] = useState(null);
  const [treatmentOptions, setTreatmentOptions] = useState([]); // Added state for treatmentOptions

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await fetch("http://localhost:5003/api/Treatment/available");
        const result = await response.json();
        console.log(result);

        if (response.ok && result.flag) {
          // Prepend the "None" option
          setTreatmentFor({ id: null, label: "None" });
          setTreatmentOptions([
            { id: null, label: "None" },
            ...result.data.map((t) => ({
              id: t.treatmentId,
              label: t.treatmentName,
            })),
          ]);
        } else {
          console.error("Failed to adding treatments:", result.message || "Unknown error");
        }
      } catch (error) {
        console.error("Error adding treatments:", error);
      }
    };

    fetchTreatments();
  }, []);
  

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!medicineName || !treatmentFor || treatmentFor.id === null || !image) {
      toast.warning("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("medicineName", medicineName);
    formData.append("treatmentId", treatmentFor.id);
    formData.append("imageFile", document.getElementById("fileInput").files[0]);

    try {
      const response = await fetch("http://localhost:5003/Medicines", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Medicine added successfully!");
        handleCancel();
        navigate("/medicines"); 
      } else {
        toast.error("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while adding the medicine.");
    }
  };

  const handleCancel = () => {
    setMedicineName("");
    setTreatmentFor({ id: null, label: "None" }); 
    setImage(null); // Reset image preview
    document.getElementById("fileInput").value = ""; // Reset file input value
    toast.warning("Reset the form.");
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
      <ToastContainer/>
    </div>
  );
}

export default MedicineAddForm;
