import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import Swal from 'sweetalert2';
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";

const ChangePasswordCustomer = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountName, setAccountName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});  

  useEffect(() => {
    const storedAccountName = localStorage.getItem('accountName');
    if (storedAccountName) {
      setAccountName(storedAccountName);
    } else {
      setAccountName('Admin');
    }
  }, []);

  useEffect(() => {
    if (accountId) {
      fetch(`http://localhost:5000/api/Account?AccountId=${accountId}`)
        .then((response) => response.json())
        .then(async (data) => {
          setAccountName(data.accountName || 'Admin');
          if (data.accountImage) {
            try {
              const response = await fetch(
                `http://localhost:5000/api/Account/loadImage?filename=${data.accountImage}`
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
        })
        .catch((error) => console.error("Error fetching account data:", error));
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Account ID not found in URL',
      });
    }
  }, [accountId]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
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

    const requestData = { currentPassword, newPassword, confirmPassword };
    try {
      const url = `http://localhost:5000/api/Account/ChangePassword${accountId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    }
  };

  const handleBackToPreviousPage = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
      <div className="content overflow-y-auto w-full">
        <NavbarCustomer/>
        <div className="p-6 bg-white shadow-md rounded-md max-w-full">
          <h2 className="mb-4 text-xl font-bold">Change Password</h2>

          <div className="flex flex-wrap gap-8">
            <div className="w-full sm:w-1/3 md:w-1/4 bg-white shadow-md rounded-md p-6 flex flex-col items-center">
              <div className="w-[15rem] h-[15rem] rounded-full bg-gray-200 flex items-center justify-center mb-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="rounded-full w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-[15rem] h-[15rem] text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5.121 17.804A9.003 9.003 0 0112 3v0a9.003 9.003 0 016.879 14.804M12 7v4m0 4h.01"
                    />
                  </svg>
                )}
              </div>
              <div className="mt-4 text-sm font-bold">{accountName}</div>
            </div>
            <div className="w-full sm:w-2/3 bg-white shadow-md rounded-md p-6">
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 font-bold">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      className="w-full p-3 border rounded-md pr-12"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-500"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 font-bold">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className="w-full p-3 border rounded-md pr-12"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-500"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 font-bold">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      className="w-full p-3 border rounded-md pr-12"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>
                <div className="flex justify-between">
                <button
                type="submit"
                className="px-6 py-2 bg-teal-500 text-white rounded"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={handleBackToPreviousPage}
                className="px-6 py-2 bg-gray-300 rounded"
              >
                Back
              </button>
            </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordCustomer;
