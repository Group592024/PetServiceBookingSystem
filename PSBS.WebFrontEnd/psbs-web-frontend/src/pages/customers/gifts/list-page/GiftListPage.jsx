import React, { useState, useEffect } from "react";
import NavbarCustomer from "../../../../components/navbar-customer/NavbarCustomer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const GiftListPage = () => {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredGifts, setFilteredGifts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchGifts = async () => {
    try {
      const response = await axios.get("http://localhost:5050/Gifts", config); 
      if (response.data.flag) {
        setGifts(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch gifts.");
      }
    } catch (err) {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  useEffect(() => {
    setFilteredGifts(
      gifts.filter(gift => gift.giftName && gift.giftName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, gifts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-svh text-center">
        <svg aria-hidden="true" className="w-12 h-12 text-blue-500 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#8B5CF6" />
        </svg>
        <p className="mt-4 text-gray-700 text-lg">Loading gifts, please wait...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <NavbarCustomer />
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Gift Collection
            </h1>
            <p className="mt-2 text-gray-600">
              Browse and redeem gifts with your reward points
            </p>
          </div>
          {/* Search Input */}
          <div className="relative w-full max-w-xs sm:max-w-md">
            <input
              type="text"
              placeholder="Search gifts by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/customer/vouchers')}
              className="flex items-center gap-2 px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <i className='bx bx-gift'></i>
              Voucher
            </button>
            <button
              onClick={() => navigate('/customer/redeemHistory')}
              className="flex items-center gap-2 px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 8v5h5v-2h-3V8z"></path>
                <path d="M21.292 8.497a8.957 8.957 0 0 0-1.928-2.862 9.004 9.004 0 0 0-4.55-2.452 9.09 9.09 0 0 0-3.626 0 8.965 8.965 0 0 0-4.552 2.453 9.048 9.048 0 0 0-1.928 2.86A8.963 8.963 0 0 0 4 12l.001.025H2L5 16l3-3.975H6.001L6 12a6.957 6.957 0 0 1 1.195-3.913 7.066 7.066 0 0 1 1.891-1.892 7.034 7.034 0 0 1 2.503-1.054 7.003 7.003 0 0 1 8.269 5.445 7.117 7.117 0 0 1 0 2.824 6.936 6.936 0 0 1-1.054 2.503c-.25.371-.537.72-.854 1.036a7.058 7.058 0 0 1-2.225 1.501 6.98 6.98 0 0 1-1.313.408 7.117 7.117 0 0 1-2.823 0 6.957 6.957 0 0 1-2.501-1.053 7.066 7.066 0 0 1-1.037-.855l-1.414 1.414A8.985 8.985 0 0 0 13 21a9.05 9.05 0 0 0 3.503-.707 9.009 9.009 0 0 0 3.959-3.26A8.968 8.968 0 0 0 22 12a8.928 8.928 0 0 0-.708-3.503z"></path>
              </svg>
              History
            </button>
          </div>
        </div>

        {/* Gift Grid */}
        {filteredGifts.length === 0 ? (
          <div className="text-center text-gray-600 text-lg font-semibold">
            No gifts found. Try searching with a different keyword.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGifts.map((gift) => (
              <div 
                key={gift.giftId} 
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/customer/gifts/detail/${gift.giftId}`)}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={`http://localhost:5050${gift.giftImage}`}
                    alt={gift.giftName}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <h2 className="absolute bottom-4 left-6 text-2xl font-bold text-white">{gift.giftName}</h2>
                  
                  {/* Gift code badge */}
                  {gift.giftCode && (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-white rounded-full p-2 shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Gift Info */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 line-clamp-3">{gift.giftDescription}</p>
                  
                  {/* Points Display */}
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-gray-600 font-medium">Required Points</span>
                    <span className="text-blue-600 font-bold bg-blue-50 px-4 py-1.5 rounded-full">
                      {gift.giftPoint}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {gifts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-auto shadow-sm">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 4v16" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Gifts Available</h3>
              <p className="text-gray-600 mb-6">Check back later for new gift options</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftListPage;
