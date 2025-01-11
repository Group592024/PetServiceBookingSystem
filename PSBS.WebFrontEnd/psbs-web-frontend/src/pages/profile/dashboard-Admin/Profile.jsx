import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";

const Profile = () => {
  const [account, setAccount] = useState(null);
  const { accountId } = useParams();

  useEffect(() => {
    if (accountId) {
      fetch(`http://localhost:5000/api/Account?AccountId=${accountId}`)
        .then(response => response.json())
        .then(data => setAccount(data))
        .catch(error => console.error('Error fetching account data:', error));
    }
  }, [accountId]);

  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
      <Sidebar /> {/* Sidebar */}

      <div className="content flex-1 overflow-y-auto">
        <Navbar /> {/* Navbar */}

        <div className="p-6 bg-white shadow-md rounded-md max-w-full">
          <h2 className="mb-4 text-xl font-bold text-left">Profile</h2>

          <div className="flex flex-wrap gap-8">
            {/* Profile Image Section */}
            <div className="w-full sm:w-1/3 md:w-1/4 bg-white shadow-md rounded-md p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <img
                  src={`http://localhost:5000/uploads/${account.accountImage}`}
                  alt="Profile"
                  className="rounded-full w-full h-full object-cover"
                />
              </div>
              <button className="mt-4 bg-teal-600 text-white text-sm font-bold px-5 py-3 rounded-md hover:bg-blue-700">
                Change Image
              </button>
            </div>

            {/* Profile Details Section */}
            <div className="w-full sm:w-2/3 md:w-2/4 bg-white shadow-md rounded-md p-6">
              <form>
                {/* Name */}
                <div className="mb-3">
                  <label htmlFor="name" className="block text-sm font-medium mb-1 font-bold">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-3 border rounded-md"
                    value={account.accountName}
                    disabled
                  />
                </div>

                {/* Birthday */}
                <div className="mb-3">
                  <label htmlFor="birthday" className="block text-sm font-medium mb-1 font-bold">Birthday</label>
                  <input
                    type="date"
                    id="birthday"
                    className="w-full p-3 border rounded-md"
                    value={account.accountDob.split('T')[0]} // get date ISO
                    disabled
                  />
                </div>

                {/* Gender */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 font-bold">Gender</label>
                  <div className="flex gap-4">
                    <label>
                      <input type="radio" name="gender" value="male" defaultChecked={account.accountGender === 'male'} disabled /> Male
                    </label>
                    <label>
                      <input type="radio" name="gender" value="female" defaultChecked={account.accountGender === 'female'} disabled /> Female
                    </label>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="mb-3">
                  <label htmlFor="phone" className="block text-sm font-medium mb-1 font-bold">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    className="w-full p-3 border rounded-md"
                    value={account.accountPhoneNumber}
                    disabled
                  />
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label htmlFor="address" className="block text-sm font-medium mb-1 font-bold">Address</label>
                  <input
                    type="text"
                    id="address"
                    className="w-full p-3 border rounded-md"
                    value={account.accountAddress}
                    disabled
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="block text-sm font-medium mb-1 font-bold">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-3 border rounded-md"
                    value={account.accountEmail} disabled
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap justify-between gap-4">
                  <Link to={`/editprofile/${accountId}`}>
                    <button
                      type="button"
                      className="bg-teal-600 text-white text-sm font-bold px-6 py-3 rounded-md hover:bg-cyan-700 w-full sm:w-auto"
                    >
                      Edit
                    </button>
                  </Link>
                  <Link to={`/changepassword/${accountId}`}>
                    <button
                      type="button"
                      className="bg-gray-300 text-black px-6 py-3 font-medium rounded-md hover:bg-cyan-700 w-full sm:w-auto"
                    >
                      Change Password
                    </button>
                  </Link>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
