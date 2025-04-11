import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import Swal from 'sweetalert2';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaSave, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";

const ChangePasswordCustomer = () => {
  const sidebarRef = useRef(null);
  const { accountId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountName, setAccountName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const storedAccountName = localStorage.getItem('accountName');
    if (storedAccountName) {
      setAccountName(storedAccountName);
    } else {
      setAccountName('Admin');
    }
  }, []);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!accountId) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Account ID not found in URL',
        });
        return;
      }

      const token = sessionStorage.getItem('token');
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: 'You need to login first.',
        });
        return;
      }

      try {
        const response = await fetch(`http://localhost:5050/api/Account?AccountId=${accountId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch account data');
        }

        const data = await response.json();
        setAccountName(data.accountName || 'Admin');

        if (data.accountImage) {
          try {
            const imageResponse = await fetch(
              `http://localhost:5050/api/Account/loadImage?filename=${data.accountImage}`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );

            const imageData = await imageResponse.json();

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
      } catch (error) {
        console.error("Error fetching account data:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load account data.',
        });
      }
    };

    fetchAccountData();
  }, [accountId]);

  // Check password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (newPassword.length >= 8) strength += 1;
    // Contains lowercase
    if (/[a-z]/.test(newPassword)) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(newPassword)) strength += 1;
    // Contains number
    if (/[0-9]/.test(newPassword)) strength += 1;
    // Contains special character
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;

    setPasswordStrength(strength);
  }, [newPassword]);

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return { text: "Very Weak", color: "bg-red-500" };
    if (passwordStrength === 1) return { text: "Weak", color: "bg-red-400" };
    if (passwordStrength === 2) return { text: "Fair", color: "bg-yellow-500" };
    if (passwordStrength === 3) return { text: "Good", color: "bg-yellow-400" };
    if (passwordStrength === 4) return { text: "Strong", color: "bg-green-400" };
    return { text: "Very Strong", color: "bg-green-500" };
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    const newErrors = {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      newErrors.general = 'All fields are required.';
    }

    if (newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters long.';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'New password and confirm password do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const token = sessionStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'You need to login first.',
      });
      setIsLoading(false);
      return;
    }

    const requestData = { currentPassword, newPassword, confirmPassword };

    try {
      const url = `http://localhost:5050/api/Account/ChangePassword${accountId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Password changed successfully!',
          confirmButtonColor: '#10B981',
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData.message || 'Failed to change password',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPreviousPage = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      <div className=" overflow-y-auto w-full">
        <NavbarCustomer sidebarRef={sidebarRef} />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center">
            <button
              onClick={handleBackToPreviousPage}
              className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* Profile Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="md:w-1/3 bg-gradient-to-br from-blue-500 to-blue-700 p-8 flex flex-col items-center justify-center text-white"
              >
                <div className="w-40 h-40 rounded-full bg-white/20 p-1 shadow-lg mb-6">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="rounded-full w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center">
                      <FaUser size={60} className="text-white/70" />
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold mb-2">{accountName}</h2>
                <div className="w-16 h-1 bg-white/30 rounded-full mb-4"></div>

                <div className="text-center text-blue-100 mt-4 space-y-4">
                  <p className="text-sm">
                    Changing your password regularly helps keep your account secure.
                  </p>

                  <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm mt-6">
                    <h3 className="font-semibold mb-2">Password Tips:</h3>
                    <ul className="text-xs space-y-1 text-left">
                      <li className="flex items-start">
                        <span className="mr-2">•</span> Use at least 6 characters
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span> Include uppercase & lowercase letters
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span> Add numbers and special characters
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span> Avoid using personal information
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Form Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="md:w-2/3 p-8"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Update Your Password</h3>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    {errors.general && <p className="mt-1 text-sm text-red-600">{errors.general}</p>}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}

                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">Password Strength:</span>
                          <span className={`text-xs font-medium ${passwordStrength < 2 ? 'text-red-500' :
                            passwordStrength < 4 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                            {getStrengthLabel().text}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getStrengthLabel().color} transition-all duration-300`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}

                    {/* Password Match Indicator */}
                    {newPassword && confirmPassword && (
                      <div className="mt-2">
                        {newPassword === confirmPassword ? (
                          <p className="text-xs text-green-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Passwords match
                          </p>
                        ) : (
                          <p className="text-xs text-red-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Passwords do not match
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Change Password
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleBackToPreviousPage}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {/* Security Tips */}
                <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Security Reminder</h4>
                  <p className="text-xs text-blue-700">
                    Never share your password with anyone. Our staff will never ask for your password.
                    Make sure to use a unique password that you don't use for other websites.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordCustomer;
