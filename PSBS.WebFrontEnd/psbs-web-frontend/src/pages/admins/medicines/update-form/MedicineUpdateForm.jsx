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
  const [errors, setErrors] = useState({ medicineName: "", treatmentFor: "" }); // Error state for validation
  const { medicineId } = useParams();
  console.log("Medicine ID:", medicineId);

  const fetchData = async () => {
    try {
      const treatmentsResponse = await fetch(
        "http://localhost:5003/api/Treatment/available"
      );
      const treatmentsResult = await treatmentsResponse.json();

      if (treatmentsResponse.ok && treatmentsResult.flag) {
        const treatments = treatmentsResult.data;
        setTreatmentOptions(
          treatments.map((t) => ({
            id: t.treatmentId,
            label: t.treatmentName,
          }))
        );

        const medicineResponse = await fetch(
          `http://localhost:5003/Medicines/all-data/${medicineId}`
        );
        const medicineResult = await medicineResponse.json();

        if (medicineResponse.ok && medicineResult.flag) {
          const medicine = medicineResult.data;
          setMedicineName(medicine.medicineName);

          const selectedTreatment = treatments.find(
            (treatment) => treatment.treatmentId === medicine.treatmentId
          );

          if (selectedTreatment) {
            setTreatmentFor({
              id: selectedTreatment.treatmentId,
              label: selectedTreatment.treatmentName,
            });
          } else {
            console.error("Treatment ID not found in available treatments.");
          }

          if (medicine.medicineImage) {
            setImage(`http://localhost:5003${medicine.medicineImage}`);
          }
        } else {
          console.error(
            "Failed to fetch medicine details:",
            medicineResult.message || "Unknown error"
          );
        }
      } else {
        console.error(
          "Failed to fetch treatments:",
          treatmentsResult.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [medicineId]);

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
    formData.append("medicineId", medicineId);
    formData.append("medicineName", medicineName);
    formData.append("treatmentId", treatmentFor.id);

    if (image && typeof image === "string") {
      formData.append("medicineImage", image);
    } else {
      formData.append("medicineImage", "");
    }

    const fileInput = document.getElementById("fileInput");
    if (fileInput.files[0]) {
      formData.append("imageFile", fileInput.files[0]);
    }

    try {
      const response = await fetch("http://localhost:5003/Medicines", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
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
      setImage(file);
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, image: "Please select a valid image file." }));
        setImage(null);
    }
  };

  const handleCancel = () => {
    navigate("/medicines");
  };

  const handleInputChange = (event) => {
    setMedicineName(event.target.value);
    if (event.target.value) {
      setErrors({ ...errors, medicineName: "" }); 
    }
  };

  const handleTreatmentChange = (event, newValue) => {
    setTreatmentFor(newValue);
    if (newValue && newValue.id) {
      setErrors({ ...errors, treatmentFor: "" }); 
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
                Update Medicine
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <TextField
                    label="Medicine Name"
                    variant="outlined"
                    fullWidth
                    value={medicineName}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    error={!!errors.medicineName}
                    helperText={errors.medicineName}
                  />
                </div>

                <div className="mb-6">
                  <Autocomplete
                    value={treatmentFor}
                    onChange={handleTreatmentChange}
                    options={treatmentOptions}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Treatment For"
                        variant="outlined"
                        className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        error={!!errors.treatmentFor}
                        helperText={errors.treatmentFor}
                      />
                    )}
                    fullWidth
                  />
                </div>

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
