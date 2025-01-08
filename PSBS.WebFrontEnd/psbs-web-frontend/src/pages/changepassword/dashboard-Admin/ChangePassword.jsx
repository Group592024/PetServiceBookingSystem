import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';  // Import useParams

const ChangePassword = () => {
  const { accountId } = useParams();  // Lấy accountId từ URL
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

    const requestData = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    try {
      // Đảm bảo URL chính xác, với accountId được chèn vào đúng chỗ
      const response = await fetch(`http://localhost:5000/api/Account/ChangePassword${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setSuccessMessage('Password changed successfully!');
        setErrorMessage('');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to change password');
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="bg-gray-100 w-full h-screen flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl p-6">
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-8">
            <div className="text-lg font-bold">LOGO</div>
            <button className="px-4 py-2 bg-gray-200 rounded">Home</button>
            <button className="px-4 py-2 bg-gray-200 rounded">Services</button>
            <button className="px-4 py-2 bg-gray-200 rounded">Rooms</button>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search"
              className="px-4 py-2 border rounded-md"
            />
            <button className="px-4 py-2 bg-black text-white rounded">Booking Now</button>
            <button className="px-4 py-2 bg-gray-200 rounded">Chat</button>
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">abc</div>
          </div>
        </nav>

        {/* Content */}
        <div className="flex">
          {/* Profile Image */}
          <div className="w-1/3 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <span className="text-gray-400 text-4xl">&#128100;</span>
            </div>
            <button className="px-4 py-2 bg-teal-500 text-white rounded">Change Image</button>
          </div>

          {/* Change Password Section */}
          <div className="w-2/3">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword}>
              {errorMessage && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}
              {successMessage && <p className="text-green-500 text-sm mb-2">{successMessage}</p>}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="abc12345"
                  className="w-full p-3 border rounded-md"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full p-3 border rounded-md"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full p-3 border rounded-md"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="px-6 py-2 bg-teal-500 text-white rounded">Change Password</button>
                <button type="button" className="px-6 py-2 bg-gray-300 rounded">Back To Profile</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
