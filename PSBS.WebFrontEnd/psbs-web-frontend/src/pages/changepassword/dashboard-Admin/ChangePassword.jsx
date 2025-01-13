import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import Swal from 'sweetalert2'; 

const ChangePassword = () => {
  const sidebarRef = useRef(null);
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountName, setAccountName] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const storedAccountName = localStorage.getItem('accountName');
    if (storedAccountName) {
      setAccountName(storedAccountName);
    } else {
      setAccountName('Admin');
    }
  }, []);

  useEffect(() => {
    if (!accountId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Account ID not found in URL',
      });
    }
  }, [accountId]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'All fields are required.',
      });
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'New password must be at least 6 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'New password and confirm password do not match.',
      });
      return;
    }

    if (!accountId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Account ID is missing',
      });
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
      <Sidebar ref={sidebarRef}/> 
      <div className="content overflow-y-auto">
        <Navbar sidebarRef={sidebarRef}/>
        <div className="p-6 bg-white shadow-md rounded-md max-w-full">
          <h2 className="mb-4 text-xl font-bold">Change Password</h2>

          <div className="flex flex-wrap gap-8">
            <div className="w-full sm:w-1/3 bg-white shadow-md rounded-md p-6">
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
