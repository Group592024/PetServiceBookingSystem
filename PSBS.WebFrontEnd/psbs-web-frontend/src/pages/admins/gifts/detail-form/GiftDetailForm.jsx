import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

function GiftDetailPage() {
  const sidebarRef = useRef(null);
  const { giftId } = useParams(); // Extract giftId from the URL
  const [gift, setGift] = useState({
    giftName: "",
    giftPoint: 0,
    giftCode: "",
    giftDescription: "",
    giftImage: "",
  });
  const token = sessionStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGiftDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/Gifts/${giftId}`,config
        );

        if (response.data.flag) {
          setGift(response.data.data);
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

  const handleBackToList = () => {
    navigate("/gifts");
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center h-svh">
        <div role="status">
          <svg
            aria-hidden="true"
            class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    );
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
              {gift.giftImage ? (
                <img
                  src={`http://localhost:5022${gift.giftImage}`}
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
                justifyContent: "center",
                paddingLeft: 3,
              }}
            >
              <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Gift Detail
              </Typography>

              <form>
                {/* Gift Name */}
                <TextField
                  label="Gift Name"
                  variant="outlined"
                  fullWidth
                  value={gift.giftName}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 3 }}
                />

                {/* Gift Point */}
                <TextField
                  label="Gift Point"
                  variant="outlined"
                  fullWidth
                  value={gift.giftPoint}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 3 }}
                />

                {/* Gift Code */}
                <TextField
                  label="Gift Code"
                  variant="outlined"
                  fullWidth
                  value={gift.giftCode || "N/A"}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 3 }}
                />

                <TextField
                  label="Gift Quantity"
                  variant="outlined"
                  fullWidth
                  value={gift.quantity}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 3 }}
                />
                <TextField
                  label="Gift Status"
                  variant="outlined"
                  fullWidth
                  value={gift.giftStatus ? "Inactive" : "Active"}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 3 }}
                />

                {/* Gift Description */}
                <TextField
                  label="Gift Description"
                  variant="outlined"
                  fullWidth
                  value={gift.giftDescription}
                  InputProps={{
                    readOnly: true,
                  }}
                  multiline
                  rows={4}
                  sx={{ mb: 3 }}
                />

                {/* Back Button */}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    onClick={handleBackToList}
                    sx={{
                      backgroundColor: "primary.main",
                      "&:hover": { backgroundColor: "primary.dark" },
                    }}
                  >
                    Back
                  </Button>
                </Box>
              </form>
            </Box>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}

export default GiftDetailPage;
