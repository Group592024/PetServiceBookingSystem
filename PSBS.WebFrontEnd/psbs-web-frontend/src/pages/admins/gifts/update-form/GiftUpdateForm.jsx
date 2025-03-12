import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

function GiftUpdatePage() {
  const sidebarRef = useRef(null);
  const { giftId } = useParams(); // Extract giftId from the URL
  const [gift, setGift] = useState({
    giftName: "",
    giftPoint: 0,
    giftCode: "",
    giftDescription: "",
    giftImage: "",
    quantity: 0,
    // giftStatus: false,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(""); // State for image preview
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  useEffect(() => {
    const fetchGiftDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/Gifts/${giftId}`,
          config
        );

        if (response.data.flag) {
          // setGift(response.data.data);
          setGift({
            ...response.data.data,
            giftStatus: response.data.data.giftStatus, // Ensure giftStatus is correctly assigned
          });
          setImagePreview(
            `http://localhost:5050${response.data.data.giftImage}`
          ); // Set the image preview URL
          toast.success(
            response.data.message || "Gift data fetched successfully!"
          );
        } else {
          toast.error(response.data.message || "Gift not found");
        }
      } catch (error) {
        console.error("Error fetching gift details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGiftDetail();
  }, [giftId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setGift((prevGift) => ({
      ...prevGift,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setErrors({ image: "Image size should be less than 5MB" });
      } else {
        setErrors({});
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result); // Update image preview
          setGift((prevGift) => ({
            ...prevGift,
            giftImage: file, // Store image as Data URL
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate Gift Name
    if (!gift.giftName.trim()) {
      newErrors.giftName = "Gift name is required.";
    }

    // Validate Gift Point
    if (gift.giftPoint <= 0) {
      newErrors.giftPoint = "Gift point should be greater than 0.";
    }

    // Validate Gift Description
    if (!gift.giftDescription.trim()) {
      newErrors.giftDescription = "Gift description is required.";
    }

    if (gift.quantity <= 0) {
      newErrors.quantity = "Quantity should be greater than 0.";
    }

    // Validate image size
    if (gift.giftImage && gift.giftImage.size > 5000000) {
      newErrors.image = "Image size should be less than 5MB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateGift = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return; // Do not proceed if there are validation errors
    }

    try {
      const formData = new FormData();
      formData.append("giftId", giftId);
      formData.append("giftName", gift.giftName);
      formData.append("giftPoint", gift.giftPoint);
      formData.append("giftCode", gift.giftCode);
      formData.append("giftDescription", gift.giftDescription);
      formData.append("quantity", gift.quantity);
      formData.append("giftStatus", gift.giftStatus);
      // Check if the giftImage is a valid file before appending to FormData
      // if (gift.giftImage && typeof gift.giftImage === 'string') {
      //   formData.append("giftImage", gift.giftImage);
      // } else {
      //   formData.append("giftImage", gift.giftImage);
      // }

      if (imagePreview && typeof imagePreview === "string") {
        formData.append("giftImage", imagePreview);
      } else {
        formData.append("giftImage", "");
      }

      const fileInput = document.getElementById("fileInput");
      if (fileInput.files[0]) {
        formData.append("imageFile", fileInput.files[0]);
      }

      const response = await axios.put(
        `http://localhost:5050/Gifts`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.flag) {
        toast.success(response.data.message || "Gift updated successfully!");
        navigate("/gifts");
      } else {
        toast.error(response.data.message || "Failed to update gift");
      }
    } catch (error) {
      console.error("Error updating gift:", error);
      toast.error("Error updating gift.");
    }
  };

  const handleBackToList = () => {
    navigate("/gifts");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
          <div className="flex w-full sm:w-11/12 lg:w-10/12 bg-white rounded-lg shadow-lg p-6">
            {/* Left Side (Image) */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRight: "1px solid #e0e0e0", // Border between the image and form
                padding: 2,
              }}
            >
              {/* Gift Image */}
              {imagePreview ? (
                <img
                  src={imagePreview} // Display the preview image
                  alt="Gift"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px", // Limit the image height
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Typography variant="body2">No Image</Typography>
              )}
            </Box>

            {/* Right Side (Form Fields) */}
            <Box
              sx={{
                flex: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 2,
              }}
            >
              <Typography variant="h4" gutterBottom>
                Update Gift
              </Typography>

              <form onSubmit={handleUpdateGift}>
                <TextField
                  fullWidth
                  label="Gift Name"
                  name="giftName"
                  value={gift.giftName}
                  onChange={handleInputChange}
                  error={!!errors.giftName}
                  helperText={errors.giftName}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Gift Code"
                  name="giftCode"
                  value={gift.giftCode}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Gift Point"
                  name="giftPoint"
                  type="number"
                  value={gift.giftPoint}
                  onChange={handleInputChange}
                  error={!!errors.giftPoint}
                  helperText={errors.giftPoint}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={gift.quantity}
                  onChange={handleInputChange}
                  error={!!errors.quantity}
                  helperText={errors.quantity}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  select
                  label="Gift Status"
                  name="giftStatus"
                  value={gift.giftStatus}
                  onChange={(e) =>
                    setGift({ ...gift, giftStatus: e.target.value === "true" })
                  }
                  error={!!errors.giftStatus}
                  helperText={errors.giftStatus}
                  sx={{ mb: 2 }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value={false}>Active</option>
                  <option value={true}>Inactive</option>
                </TextField>

                <TextField
                  fullWidth
                  label="Gift Description"
                  name="giftDescription"
                  value={gift.giftDescription}
                  onChange={handleInputChange}
                  error={!!errors.giftDescription}
                  helperText={errors.giftDescription}
                  sx={{ mb: 2 }}
                />

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
                    variant="contained"
                    color="primary"
                    type="submit"
                    sx={{ mt: 2 }}
                  >
                    Update Gift
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleBackToList}
                    sx={{ mt: 2 }}
                  >
                    Back to List
                  </Button>
                </div>
              </form>
            </Box>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default GiftUpdatePage;
