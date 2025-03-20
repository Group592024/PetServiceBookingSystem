import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";
import { motion, AnimatePresence } from "framer-motion";

const GiftDetailPage = () => {
  const { giftId } = useParams();
  const navigate = useNavigate();
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const accountId = sessionStorage.getItem("accountId");
  const token = sessionStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  useEffect(() => {
    const fetchGift = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/Gifts/detail/${giftId}`,
          config
        );
        if (response.data.flag) {
          setGift(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("An error occurred while fetching gift details.");
      } finally {
        setLoading(false);
      }
    };

    fetchGift();
  }, [giftId]);

  const handleRedeem = async () => {
    const confirmResult = await Swal.fire({
      title: "Confirm Redemption",
      text: `Are you sure you want to use ${gift.giftPoint} points to redeem this gift?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Redeem",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (confirmResult.isConfirmed) {
      try {
        const redeemPointsResponse = await axios.post(
          `http://localhost:5050/api/Account/redeem-points/${accountId}`,
          {
            giftId: giftId,
            requiredPoints: gift.giftPoint,
          },  config,
        );

        if (redeemPointsResponse.data.flag) {
          Swal.fire({
            title: "Success",
            text: redeemPointsResponse.data.message,
            icon: "success",
          }).then(() => {
            navigate("/customer/gifts");
          });
        } else {
          Swal.fire({
            title: "Points Check Failed",
            text: redeemPointsResponse.data.message,
            icon: "warning",
          });
        }
      } catch (error) {
        Swal.fire({
          title: error.response?.data?.title || "Error",
          text: error.response?.data?.message || "Request failed",
          icon: "error",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
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
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <NavbarCustomer />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="md:w-1/2 p-8 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center"
                >
                  <div className="relative group">
                    <img
                      src={`http://localhost:5022${gift.giftImage}`}
                      alt={gift.giftName}
                      className="w-full h-80 object-contain rounded-lg transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  </div>
                </motion.div>

                {/* Content Section */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="md:w-1/2 p-8"
                >
                  <div className="space-y-6">
                    {/* Gift Name */}
                    <div>
                      <h2 className="text-sm font-semibold text-purple-600 mb-1">Gift Name</h2>
                      <p className="text-2xl font-bold text-gray-800">{gift.giftName}</p>
                    </div>

                    {/* Points */}
                    <div>
                      <h2 className="text-sm font-semibold text-purple-600 mb-1">Required Points</h2>
                      <div className="inline-flex items-center px-4 py-2 bg-purple-50 rounded-full">
                        <span className="text-xl font-bold text-purple-600">{gift.giftPoint}</span>
                        <span className="ml-2 text-sm text-gray-500">points</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h2 className="text-sm font-semibold text-purple-600 mb-1">Description</h2>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {gift.giftDescription || "No description available"}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRedeem}
                        className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300 shadow-md hover:shadow-lg"
                      >
                        Redeem Gift
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(-1)}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
                      >
                        Back to List
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GiftDetailPage;
