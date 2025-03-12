import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";

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

  if (loading)
    return (
      <div className="text-center text-gray-600">Loading gift details...</div>
    );
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <NavbarCustomer />
      <div className="p-6 flex justify-center">
        <div className="flex flex-col md:flex-row bg-gray-200 p-6 rounded-lg shadow-lg w-full md:w-3/4 lg:w-2/3">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 flex justify-center items-center h-full">
            <img
              src={`http://localhost:5022${gift.giftImage}`}
              alt={gift.giftName}
              className="max-w-full w-auto max-h-60 object-contain rounded-lg"
            />
          </div>

          <div className="flex-grow bg-gray-400 p-4 rounded-lg">
            <div className="mb-4">
              <h2 className="text-lg font-bold mb-2">Gift Name</h2>
              <p className="p-2 bg-gray-300 rounded">{gift.giftName}</p>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-bold mb-2">Gift Point</h2>
              <p className="p-2 bg-gray-300 rounded">{gift.giftPoint}</p>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-bold mb-2">Gift Code</h2>
              <p className="p-2 bg-gray-300 rounded">
                {gift.giftCode || "N/A"}
              </p>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-bold mb-2">Gift Description</h2>
              <p className="p-2 bg-gray-300 rounded">
                {gift.giftDescription || "N/A"}
              </p>
            </div>

            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={handleRedeem}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition duration-300"
              >
                Redeem
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition duration-300"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftDetailPage;
