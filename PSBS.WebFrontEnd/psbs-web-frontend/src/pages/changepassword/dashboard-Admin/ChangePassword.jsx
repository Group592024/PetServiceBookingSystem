import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const { accountId } = useParams(); // Get accountId from URL
  const navigate = useNavigate(); // Hook for navigation
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [accountName, setAccountName] = useState(''); // Store account name

  // States for showing/hiding passwords
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get accountName from localStorage on component mount
  useEffect(() => {
    const storedAccountName = localStorage.getItem('accountName');
    if (storedAccountName) {
      setAccountName(storedAccountName); // Set account name from localStorage
    } else {
      setAccountName('Admin'); // Default to Admin if not found
    }
  }, []);

  // Handle missing accountId
  useEffect(() => {
    if (!accountId) {
      setErrorMessage('Account ID not found in URL');
      console.log('Account ID is missing!');
    }
  }, [accountId]);

  // Handle password change logic
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Log the current input values before submission
    console.log("Current Password:", currentPassword);
    console.log("New Password:", newPassword);
    console.log("Confirm Password:", confirmPassword);

    // Validate that accountId exists
    if (!accountId) {
      setErrorMessage('Account ID is missing');
      console.log('Error: Account ID is missing');
      return;
    }

    // Validate that the new passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match');
      console.log('Error: New password and confirm password do not match');
      return;
    }

    const requestData = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    try {
      console.log("Sending request with data:", requestData);

      // Construct URL dynamically based on accountId
      const url = `http://localhost:5000/api/Account/ChangePassword${accountId}`;
      console.log("URL to be used:", url);

      // Send the request to the backend
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Password changed successfully. Response:", data);
        setSuccessMessage('Password changed successfully!');
        setErrorMessage('');
        
        // Reset form fields after success
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await response.json();
        console.log("Error response:", errorData);
        setErrorMessage(errorData.message || 'Failed to change password');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setErrorMessage('An error occurred. Please try again later.');
      setSuccessMessage('');
    }
  };

  // Go back to the previous page
  const handleBackToPreviousPage = () => {
    console.log("Navigating back to the previous page...");
    navigate(-1);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-300 p-4 h-full">
        <div className="mb-6 text-center font-bold text-lg bg-gray-400 py-2 rounded">Logo</div>
        {[
          "Report", "Account Management", "Service Management", "Room Management",
          "Camera Management", "Pet Management", "Medicine Management", "Voucher Management"
        ].map((item, index) => (
          <button
            key={index}
            className={`w-full py-2 mb-2 rounded ${item === "Account Management" ? "bg-black text-white" : "bg-gray-400"}`}
          >
            {item}
          </button>
        ))}
        <button className="w-full py-2 bg-gray-500 rounded">Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 h-full overflow-y-auto">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4" />
          <div className="flex items-center space-x-4 w-1/2 justify-end">
            <button className="px-4 py-2 bg-gray-300 rounded">Chat</button>
            <span>{accountName}</span> {/* Display account name */}
            <div className="w-8 h-8 rounded-full bg-gray-400"></div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="flex space-x-12">
          {/* Change Image */}
          <div className="w-1/3 bg-white shadow-md rounded-md p-6 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <span className="text-gray-400 text-4xl">&#128100;</span>
            </div>
            <button className="px-4 py-2 bg-teal-500 text-white rounded">Change Image</button>
          </div>

          {/* Change Password Form */}
          <div className="w-2/3 bg-white shadow-md rounded-md p-6">
            <form onSubmit={handleChangePassword}>
              {errorMessage && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}
              {successMessage && <p className="text-green-500 text-sm mb-2">{successMessage}</p>}

              {/* Current Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 font-bold">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="abc12345"
                    className="w-full p-3 border rounded-md"
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
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 font-bold">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full p-3 border rounded-md"
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
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 font-bold">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full p-3 border rounded-md"
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
  );
};

export default ChangePassword;
