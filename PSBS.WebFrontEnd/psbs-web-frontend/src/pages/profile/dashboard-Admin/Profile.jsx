import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom'; // Thêm useParams để lấy accountId từ URL

const Profile = () => {
  const [account, setAccount] = useState(null);
  const { accountId } = useParams(); // Lấy accountId từ URL

  // Hàm gọi API để lấy thông tin tài khoản
  useEffect(() => {
    if (accountId) {
      fetch(`http://localhost:5000/api/Account?AccountId=${accountId}`)
        .then(response => response.json())
        .then(data => setAccount(data))
        .catch(error => console.error('Error fetching account data:', error));
    }
  }, [accountId]); // Sử dụng accountId trong dependency array

  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-gray-300 text-white px-10 py-4">
        <div className="flex justify-between items-center">
          {/* Left Section */}
          <div className="flex items-center space-x-10">
            <div className="bg-gray-600 text-white text-lg font-bold px-5 py-3 rounded-md">LOGO</div>
            <a href="#" className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold">Home</a>
            <a href="#" className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold">Services</a>
            <a href="#" className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold">Rooms</a>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold">
              Booking Now
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold">
              Chat
            </button>
            {/* User Info */}
            <div className="flex items-center space-x-2">
              <span className="text-black">{account.accountName}</span>
              <div className="bg-gray-400 w-8 h-8 rounded-full flex items-center justify-center text-white">
                👤
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto flex space-x-10 py-10">
        {/* Left Section (Profile Image) */}
        <div className="w-1/4 h-1/4 bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
          <div className="w-40 h-40 rounded-full bg-blue-200 flex items-center justify-center text-4xl">
            {/* Hiển thị hình ảnh nếu có */}
            <img
              src={`http://localhost:5000/uploads/${account.accountImage}`}
              alt="Profile"
              className="rounded-full w-full h-full object-cover"
            />
          </div>
          <button className="mt-6 bg-cyan-600 text-Black text-lg font-bold px-5 py-3 rounded-md hover:bg-blue-700">
            Change Image
          </button>
        </div>

        {/* Right Section (Profile Form) */}
        <div className="w-3/4 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>
          <form>
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-600 font-medium">Name</label>
              <input
                type="text"
                id="name"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={account.accountName}
              />
            </div>

            {/* Birthday */}
            <div className="mb-4">
              <label htmlFor="birthday" className="block text-gray-600 font-medium">Birthday</label>
              <input
                type="date"
                id="birthday"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={account.accountDob.split('T')[0]} // Lấy ngày từ định dạng ISO
              />
            </div>

            {/* Gender */}
            <div className="mb-4">
              <span className="block text-black-600 font-medium">Gender</span>
              <label className="mr-4">
                <input type="radio" name="gender" value="male" defaultChecked={account.accountGender === 'male'} /> Male
              </label>
              <label>
                <input type="radio" name="gender" value="female" defaultChecked={account.accountGender === 'female'} /> Female
              </label>
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-600 font-medium">Phone Number</label>
              <input
                type="text"
                id="phone"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={account.accountPhoneNumber}
              />
            </div>

            {/* Address */}
            <div className="mb-4">
              <label htmlFor="address" className="block text-gray-600 font-medium">Address</label>
              <input
                type="text"
                id="address"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={account.accountAddress}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-600 font-medium">Email</label>
              <input
                type="email"
                id="email"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={account.accountEmail} disabled
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              <Link to={`/editprofile/${accountId}`}>
                <button
                  type="button"
                  className="bg-cyan-600 text-Black text-lg font-bold px-5 py-3 rounded-md hover:bg-cyan-700"
                >
                  Edit
                </button>
              </Link >
              <Link to={`/changepassword/${accountId}`}>
                <button
                  type="button"
                  className="bg-gray-300 text-black px-6 py-2 font-medium rounded-md hover:bg-cyan-700"
                >
                  Change Password
                </button>
              </Link>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
