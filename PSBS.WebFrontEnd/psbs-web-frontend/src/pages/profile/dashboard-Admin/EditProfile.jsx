import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";

const EditProfile = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState({
    accountName: "",
    accountEmail: "",
    accountPhoneNumber: "",
    accountGender: "male",
    accountDob: "",
    accountAddress: "",
    accountRoleId: "user",
    accountImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (accountId) {
      fetch(`http://localhost:5000/api/Account?AccountId=${accountId}`)
        .then((response) => response.json())
        .then((data) => {
          setAccount(data);
          setImagePreview(data.accountImage ? `http://localhost:5000/uploads/${data.accountImage}` : null);
        })
        .catch((error) => console.error("Error fetching account data:", error));
    }
  }, [accountId]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setAccount({ ...account, accountImage: file });
    }
  };

  const handleEdit = () => {
    console.log("Edit functionality triggered.");
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
      <Sidebar /> {/* Sidebar */}

      <div className="content flex-1 overflow-y-auto">
        <Navbar /> {/* Navbar */}

        <div className="p-6 bg-white shadow-md rounded-md max-w-full">
          <h2 className="mb-4 text-xl font-bold text-left">Edit Profile</h2>

          <div className="flex flex-wrap gap-8">
            {/* Profile Image Section */}
            <div className="w-full sm:w-1/3 md:w-1/4 bg-white shadow-md rounded-md p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="rounded-full w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-12 h-12 text-gray-500"
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
              <label
                htmlFor="imageUpload"
                className="mt-4 bg-teal-600 text-white text-sm font-bold px-5 py-3 rounded-md hover:bg-cyan-700 cursor-pointer"
              >
                Upload Image
              </label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Profile Details Section */}
            <div className="w-full sm:w-2/3 md:w-2/4 bg-white shadow-md rounded-md p-6">
              <form>
                {/* Name */}
                <div className="mb-3">
                  <label htmlFor="name" className="block text-sm font-medium mb-1 font-bold">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-3 border rounded-md"
                    value={account.accountName || ""}
                    onChange={(e) => setAccount({ ...account, accountName: e.target.value })}
                  />
                </div>

                {/* Birthday */}
                <div className="mb-3">
                  <label htmlFor="birthday" className="block text-sm font-medium mb-1 font-bold">
                    Birthday
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    className="w-full p-3 border rounded-md"
                    value={account.accountDob?.split("T")[0] || ""}
                    onChange={(e) => setAccount({ ...account, accountDob: e.target.value })}
                  />
                </div>

                {/* Gender */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 font-bold">Gender</label>
                  <div className="flex gap-4">
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={account.accountGender === "male"}
                        onChange={() => setAccount({ ...account, accountGender: "male" })}
                      />{" "}
                      Male
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={account.accountGender === "female"}
                        onChange={() => setAccount({ ...account, accountGender: "female" })}
                      />{" "}
                      Female
                    </label>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="mb-3">
                  <label htmlFor="phone" className="block text-sm font-medium mb-1 font-bold">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    className="w-full p-3 border rounded-md"
                    value={account.accountPhoneNumber || ""}
                    onChange={(e) => setAccount({ ...account, accountPhoneNumber: e.target.value })}
                  />
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label htmlFor="address" className="block text-sm font-medium mb-1 font-bold">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    className="w-full p-3 border rounded-md"
                    value={account.accountAddress || ""}
                    onChange={(e) => setAccount({ ...account, accountAddress: e.target.value })}
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap justify-between space-x-4 gap-4">
                  <button
                    type="button"
                    className="bg-teal-600 text-white text-sm font-bold px-6 py-3 rounded-md hover:bg-cyan-700 w-full sm:w-auto"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-black px-6 py-3 font-medium rounded-md hover:bg-cyan-700 w-full sm:w-auto"
                    onClick={handleBack}
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

export default EditProfile;
