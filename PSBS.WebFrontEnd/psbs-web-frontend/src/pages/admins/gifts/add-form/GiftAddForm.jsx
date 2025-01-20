import React, { useState, useRef } from "react";
import { TextField, Button } from "@mui/material";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function GiftAddForm() {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [giftName, setGiftName] = useState("");
  const [giftDescription, setGiftDescription] = useState("");
  const [giftPoint, setGiftPoint] = useState("");
  const [giftCode, setGiftCode] = useState("");
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({
    giftName: "",
    giftDescription: "",
    giftPoint: "",
    giftCode: "",
    image: "",
  });

  const validateForm = () => {
    const newErrors = {
      giftName: giftName ? "" : "Gift Name is required.",
      giftDescription: giftDescription ? "" : "Gift Description is required.",
      giftPoint: giftPoint > 0 ? "" : "Gift Point must be greater than 0.",
      //   giftCode: giftCode ? "" : "Gift Code is required.",
      image: image ? "" : "Gift Image is required.",
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("giftName", giftName);
    formData.append("giftDescription", giftDescription);
    formData.append("giftPoint", giftPoint);
    formData.append("giftCode", giftCode);
    formData.append("imageFile", document.getElementById("fileInput").files[0]);

    try {
      const response = await fetch("http://localhost:5022/Gifts", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Gift added successfully!");
        handleCancel();
        navigate("/gifts");
      } else {
        toast.error("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while adding the gift.");
    }
  };

  const handleCancel = () => {
    setGiftName("");
    setGiftDescription("");
    setGiftPoint("");
    setGiftCode("");
    setImage(null);
    setErrors({
      giftName: "",
      giftDescription: "",
      giftPoint: "",
      giftCode: "",
      image: "",
    });
    navigate("/gifts");
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
        setErrors((prevErrors) => ({
          ...prevErrors,
          image: "Please select a valid image file.",
        }));
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
          {/* Conditionally Display Image Preview */}
          {image && (
            <div
              className="w-full sm:w-96 bg-white rounded-lg shadow-lg p-6 mr-8 flex flex-col justify-between"
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
          <div className="flex w-full sm:w-96 bg-white rounded-lg shadow-lg p-6">
            <div className="w-full flex flex-col justify-between">
              <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                Add Gift
              </h2>
              <form onSubmit={handleSubmit}>
                {/* Gift Name */}
                <div className="mb-4">
                  <TextField
                    label="Gift Name"
                    variant="outlined"
                    fullWidth
                    value={giftName}
                    onChange={(e) => {
                      setGiftName(e.target.value);
                      if (e.target.value) {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          giftName: "",
                        }));
                      }
                    }}
                    error={!!errors.giftName}
                    helperText={errors.giftName}
                  />
                </div>

                {/* Gift Description */}
                <div className="mb-4">
                  <TextField
                    label="Gift Description"
                    variant="outlined"
                    fullWidth
                    value={giftDescription}
                    onChange={(e) => {
                      setGiftDescription(e.target.value);
                      if (e.target.value) {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          giftDescription: "",
                        }));
                      }
                    }}
                    error={!!errors.giftDescription}
                    helperText={errors.giftDescription}
                  />
                </div>

                {/* Gift Point */}
                <div className="mb-4">
                  <TextField
                    label="Gift Point"
                    variant="outlined"
                    type="number"
                    fullWidth
                    value={giftPoint}
                    onChange={(e) => {
                      setGiftPoint(e.target.value);
                      if (e.target.value > 0) {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          giftPoint: "",
                        }));
                      }
                    }}
                    error={!!errors.giftPoint}
                    helperText={errors.giftPoint}
                  />
                </div>

                {/* Gift Code */}
                {/* <div className="mb-4">
                  <TextField
                    label="Gift Code"
                    variant="outlined"
                    fullWidth
                    value={giftCode}
                    onChange={(e) => {
                      setGiftCode(e.target.value);
                      if (e.target.value) {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          giftCode: "",
                        }));
                      }
                    }}
                    error={!!errors.giftCode}
                    helperText={errors.giftCode}
                  />
                </div> */}

                {/* Gift Code */}
                <div className="mb-4">
                  <TextField
                    label="Gift Code (Optional)"
                    variant="outlined"
                    fullWidth
                    value={giftCode}
                    onChange={(e) => setGiftCode(e.target.value)}
                    error={!!errors.giftCode}
                    helperText={errors.giftCode}
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
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default GiftAddForm;
