import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";

const Profile = () => {
  const [account, setAccount] = useState(null);
  const sidebarRef = useRef(null);
  const token = sessionStorage.getItem("token");
  const [imagePreview, setImagePreview] = useState(null);
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
      const token = sessionStorage.getItem("token");
  
      fetch(`http://localhost:5050/api/Account?AccountId=${accountId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
      })
        .then((response) => response.json())
        .then(async (data) => {
          setAccount(data);
  
          if (data.accountImage) {
            try {
              const response = await fetch(
                `http://localhost:5050/api/Account/loadImage?filename=${data.accountImage}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, 
                  },
                }
              );
              const imageData = await response.json();
  
              if (imageData.flag) {
                const imgContent = imageData.data.fileContents;
                const imgContentType = imageData.data.contentType;
                setImagePreview(
                  `data:${imgContentType};base64,${imgContent}`
                );
              } else {
                console.error("Error loading image:", imageData.message);
              }
            } catch (error) {
              console.error("Error fetching image:", error);
            }
          }
        })
        .catch((error) => console.error("Error fetching account data:", error));
    }
  }, [accountId]);
  

  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
      <Sidebar ref={sidebarRef} />
      <div className="content overflow-y-auto">
        <Navbar sidebarRef={sidebarRef} />

        <div className="p-6 bg-white shadow-md rounded-md max-w-full">
          <h2 className="mb-4 text-xl font-bold text-left">Profile</h2>

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
              <div className="mt-4 text-sm font-bold">
                {account.accountName}
              </div>
            </div>

            <div className="w-full sm:w-2/3 md:w-2/4 bg-white shadow-md rounded-md p-6">
              <form>
                <div className="mb-3">
                  <label htmlFor="accountName" className="block text-sm font-medium mb-1 font-bold">
                    Name
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    className="w-full p-3 border rounded-md"
                    value={account.accountName}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="block text-sm font-medium mb-1 font-bold">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-3 border rounded-md"
                    value={account.accountEmail}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="birthday" className="block text-sm font-medium mb-1 font-bold">
                    Birthday
                  </label>
                  <input
                    type="text"
                    id="birthday"
                    className="w-full p-3 border rounded-md"
                    value={account.accountDob ? formatDate(account.accountDob) : ""}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 font-bold">Gender</label>
                  <div className="flex gap-4">
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={account.accountGender === "male"}
                        disabled
                      />{" "}
                      Male
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={account.accountGender === "female"}
                        disabled
                      />{" "}
                      Female
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="block text-sm font-medium mb-1 font-bold">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    className="w-full p-3 border rounded-md"
                    value={account.accountPhoneNumber}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="block text-sm font-medium mb-1 font-bold">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    className="w-full p-3 border rounded-md"
                    value={account.accountAddress}
                    disabled
                  />
                </div>

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
