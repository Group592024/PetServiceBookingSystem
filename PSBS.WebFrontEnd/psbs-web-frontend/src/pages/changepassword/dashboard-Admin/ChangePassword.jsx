import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";

const ChangePassword = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [accountName, setAccountName] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For image change

  // Fetch accountName from localStorage
  useEffect(() => {
    const storedAccountName = localStorage.getItem('accountName');
    if (storedAccountName) {
      setAccountName(storedAccountName);
    } else {
      setAccountName('Admin');
    }
  }, []);

  // Handle missing accountId
  useEffect(() => {
    if (!accountId) {
      setErrorMessage('Account ID not found in URL');
    }
  }, [accountId]);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!accountId) {
      setErrorMessage('Account ID is missing');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match');
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
        const data = await response.json();
        setSuccessMessage('Password changed successfully!');
        setErrorMessage('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleBackToPreviousPage = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
      <Sidebar /> {/* Sidebar */}

      <div className="content flex-1 overflow-y-auto">
        <Navbar /> {/* Navbar */}

        <div className="p-6 bg-white shadow-md rounded-md max-w-full">
          <h2 className="mb-4 text-xl font-bold">Change Password</h2>

          <div className="flex flex-wrap gap-8">
            {/* Change Image Section (Thu nhỏ) */}
            <div className="w-full sm:w-1/4 bg-white shadow-md rounded-md p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                {selectedImage ? (
                  <img src={selectedImage} alt="Selected" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-gray-400 text-3xl">&#128100;</span>
                )}
              </div>
              <input
                type="file"
                onChange={handleImageChange}
                className="px-4 py-2 bg-teal-500 text-white rounded"
              />
            </div>

            {/* Change Password Form */}
            <div className="w-full sm:w-1/3 bg-white shadow-md rounded-md p-6">
              <form onSubmit={handleChangePassword}>
                {errorMessage && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}
                {successMessage && <p className="text-green-500 text-sm mb-2">{successMessage}</p>}

                {/* Current Password */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 font-bold">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      className="w-full p-3 border rounded-md pr-12" // thêm padding bên phải cho nút
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
                </div>

                {/* New Password */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 font-bold">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className="w-full p-3 border rounded-md pr-12" // thêm padding bên phải cho nút
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
                </div>

                {/* Confirm New Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 font-bold">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      className="w-full p-3 border rounded-md pr-12" // thêm padding bên phải cho nút
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
                </div>

                <div className="flex space-x-4">
                  <button type="submit" className="px-6 py-2 bg-teal-500 text-white rounded">Change Password</button>
                  <button type="button" onClick={handleBackToPreviousPage} className="px-6 py-2 bg-gray-300 rounded">Back</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
