import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";

const GiftDetailPage = () => {
  const { giftId } = useParams(); // Get the gift ID from the URL
  const navigate = useNavigate();
  const [gift, setGift] = useState(null); // State to store gift details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch gift details by ID
    const fetchGift = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5022/Gifts/detail/${giftId}`
        );
        if (response.data.flag) {
          setGift(response.data.data); // Set gift details
        } else {
          setError(response.data.message); // Handle API error response
        }
      } catch (err) {
        setError("An error occurred while fetching gift details.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchGift();
  }, [giftId]);

  if (loading) {
    return (
      <div className="text-center text-gray-600">Loading gift details...</div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <NavbarCustomer />
      <div className="p-6 flex justify-center">
        <div className="flex flex-col md:flex-row bg-gray-200 p-6 rounded-lg shadow-lg w-full md:w-3/4 lg:w-2/3">
          {/* Image */}
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 flex justify-center items-center h-full">
            <img
              src={`http://localhost:5022${gift.giftImage}`}
              alt={gift.giftName}
              className="max-w-full w-auto max-h-60 object-contain rounded-lg"
            />
          </div>

          {/* Details */}
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
              <p className="p-2 bg-gray-300 rounded">{gift.giftDescription}</p>
            </div>

            {/* Back Button */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600"
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
