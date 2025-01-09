import React, { useState, useRef, useEffect } from "react";
import { TextField, Autocomplete, Button } from "@mui/material";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

function MedicineUpdateForm() {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState("");
  const [treatmentFor, setTreatmentFor] = useState(null);
  const [image, setImage] = useState(null);
  const [treatmentOptions, setTreatmentOptions] = useState([]);
  const { medicineId } = useParams();
  console.log("Medicine ID:", medicineId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const treatmentsResponse = await fetch(
          "http://localhost:5003/api/Treatment/available"
        );
        const treatmentsResult = await treatmentsResponse.json();

        if (treatmentsResponse.ok && treatmentsResult.flag) {
          setTreatmentOptions(
            treatmentsResult.data.map((t) => ({
              id: t.treatmentId,
              label: t.treatmentName,
            }))
          );
        } else {
          console.error(
            "Failed to fetch treatments:",
            treatmentsResult.message || "Unknown error"
          );
        }

        const medicineResponse = await fetch(
          `http://localhost:5003/Medicines/${medicineId}`
        );
        const medicineResult = await medicineResponse.json();

        if (medicineResponse.ok && medicineResult.flag) {
          const medicine = medicineResult.data;
          setMedicineName(medicine.medicineName);
          setTreatmentFor({
            id: medicine.treatmentId, 
            label: medicine.treatmentName, 
          });

          if (medicine.medicineImage) {
            setImage(`http://localhost:5003${medicine.medicineImage}`);
          }
        } else {
          console.error(
            "Failed to fetch medicine details:",
            medicineResult.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [medicineId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Medicine Name:", medicineName);
    console.log("Treatment For:", treatmentFor);

    // Validate required fields
    if (!medicineName || !treatmentFor || !treatmentFor.id) {
      toast.warning("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("medicineId", medicineId); 
    formData.append("medicineName", medicineName);
    formData.append("treatmentId", treatmentFor.id); 

    if (image && typeof image === "string") {
      formData.append("medicineImage", image); 
    } else {
      // If a new image is selected, leave medicineImage empty
      formData.append("medicineImage", "");
    }

    // If user selects a new image file, append it as imageFile
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files[0]) {
      formData.append("imageFile", fileInput.files[0]);
    }

    // Log FormData entries for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    // Submit the request
    try {
      const response = await fetch("http://localhost:5003/Medicines", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        console.log("Updated Treatment For:", treatmentFor);

        const data = await response.json();
        toast.success(data.message || "Medicine updated successfully!");
        navigate("/medicines");
      } else {
        const errorData = await response.json();
        toast.error("Error: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while updating the medicine.");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file); // Store the actual file for upload
    } else {
      alert("Please select a valid image file");
    }
  };
  const handleCancel = () => {
    navigate("/medicines"); // Redirect to the medicine list page
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
                Update Medicine
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
                  {image && typeof image !== "string" && (
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
          {image && typeof image === "string" && (
            <div
              className="w-full sm:w-96 bg-white rounded-lg shadow-lg p-6 ml-8 flex flex-col justify-between"
              style={{ height: "396px" }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Medicine Image
              </h3>
              <img
                src={image}
                alt="Preview"
                className="w-full h-64 object-contain rounded-lg shadow-lg"
              />
            </div>
          )}
          {image && typeof image !== "string" && (
            <div
              className="w-full sm:w-96 bg-white rounded-lg shadow-lg p-6 ml-8 flex flex-col justify-between"
              style={{ height: "396px" }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                New Image Preview
              </h3>
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="w-full h-64 object-contain rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}

export default MedicineUpdateForm;
