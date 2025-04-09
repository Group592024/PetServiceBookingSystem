import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaBirthdayCake,
  FaVenusMars,
  FaPhone,
  FaMapMarkerAlt,
  FaCoins,
  FaPencilAlt,
  FaLock,
  FaSpinner,
  FaClock
} from "react-icons/fa";

const ProfileCustomer = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const token = sessionStorage.getItem("token");
  const { accountId } = useParams();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (accountId) {
      setLoading(true);
      const token = sessionStorage.getItem('token');

      fetch(`http://localhost:5050/api/Account?AccountId=${accountId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then((response) => response.json())
        .then(async (data) => {
          setAccount(data);

          if (data.accountImage) {
            try {
              const response = await fetch(
                `http://localhost:5050/api/Account/loadImage?filename=${data.accountImage}`,
                {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              const imageData = await response.json();

              if (imageData.flag) {
                const imgContent = imageData.data.fileContents;
                const imgContentType = imageData.data.contentType;
                setImagePreview(`data:${imgContentType};base64,${imgContent}`);
              } else {
                console.error("Error loading image:", imageData.message);
              }
            } catch (error) {
              console.error("Error fetching image:", error);
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching account data:", error);
          setLoading(false);
        });
    }
  }, [accountId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't load your profile information.</p>
          <Link to="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const getActiveDuration = (createdAt) => {
    const start = new Date(createdAt);
    const now = new Date();

    const diffInMs = now - start;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffInDays / 365);
    const months = Math.floor((diffInDays % 365) / 30);
    const days = diffInDays % 30;

    let parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (days > 0 && years === 0) parts.push(`${days}d`);

    return parts.join(' ') || '0d';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarCustomer sidebarRef={sidebarRef} />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-2xl p-8 text-white">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="opacity-80">Manage your personal information and account settings</p>
          </div>

          <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Left Column - Profile Image & Quick Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="md:w-1/3 p-8 bg-gray-300 border-r border-gray-100"
              >
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-48 h-48 rounded-full bg-white p-2 shadow-lg mb-6 overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="rounded-full w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
                          <FaUser size={60} className="text-blue-500" />
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/editprofilecustomer/${accountId}`}
                      className="absolute bottom-6 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaPencilAlt size={16} />
                    </Link>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{account.accountName}</h2>
                  <p className="text-gray-500 mb-6">{account.accountEmail}</p>

                  <div className="w-full bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-700">Loyalty Points</h3>
                      <span className="flex items-center text-xs text-gray-500 mt-1">
                        <FaClock className="mr-1 text-gray-400" />
                        Active: <span className="ml-1 font-medium text-gray-700">
                          {account.createdAt ? getActiveDuration(account.createdAt) : "N/A"}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center">
                      <FaCoins className="text-yellow-500 text-2xl mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-gray-800">
                          {account.accountLoyaltyPoint ? account.accountLoyaltyPoint.toLocaleString() : "0"}
                        </div>
                        <div className="text-xs text-gray-500">Available points</div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full space-y-3">
                    <Link
                      to={`/editprofilecustomer/${accountId}`}
                      className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaPencilAlt className="mr-2" />
                      Edit Profile
                    </Link>

                    <Link
                      to={`/changepasswordcustomer/${accountId}`}
                      className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FaLock className="mr-2" />
                      Change Password
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Profile Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="md:w-2/3 p-8"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Personal Information
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">Full Name</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FaUser className="text-gray-400 mr-3" />
                      <span className="text-gray-800">{account.accountName || "Not provided"}</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">Email Address</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FaEnvelope className="text-gray-400 mr-3" />
                      <span className="text-gray-800">{account.accountEmail || "Not provided"}</span>
                    </div>
                  </div>

                  {/* Birthday */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FaBirthdayCake className="text-gray-400 mr-3" />
                      <span className="text-gray-800">
                        {account.accountDob ? formatDate(account.accountDob) : "Not provided"}
                      </span>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">Gender</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FaVenusMars className="text-gray-400 mr-3" />
                      <span className="text-gray-800">
                        {account.accountGender ?
                          account.accountGender.charAt(0).toUpperCase() + account.accountGender.slice(1) :
                          "Not provided"}
                      </span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FaPhone className="text-gray-400 mr-3" />
                      <span className="text-gray-800">{account.accountPhoneNumber || "Not provided"}</span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Address</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FaMapMarkerAlt className="text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-800">{account.accountAddress || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                {/* Account Activity Section */}
                <div className="mt-10">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                    Account Activity
                  </h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="text-green-500 text-lg font-semibold mb-1">Account Status</div>
                      <div className="text-gray-700">Active</div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="text-purple-500 text-lg font-semibold mb-1">Member Since</div>
                      <div className="text-gray-700">
                        {account.createdAt ? formatDate(account.createdAt) : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Privacy Notice</h4>
                  <p className="text-xs text-gray-600">
                    Your personal information is protected by our privacy policy. We never share your data with third parties without your consent.
                    To learn more about how we handle your data, please visit our Privacy Policy page.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileCustomer;
