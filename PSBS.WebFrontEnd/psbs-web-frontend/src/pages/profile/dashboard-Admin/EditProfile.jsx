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
  const [errors, setErrors] = useState({
    accountName: "",
    accountEmail: "",
    accountPhoneNumber: "",
    accountDob: "",
    accountGender: "",
    accountAddress: "",
  });

  useEffect(() => {
    if (accountId) {
      fetch(`http://localhost:5000/api/Account?AccountId=${accountId}`)
        .then((response) => response.json())
        .then(async (data) => {
          setAccount(data);

          if (data.accountImage) {
            try {
              const response = await fetch(`http://localhost:5000/api/Account/loadImage?filename=${data.accountImage}`);
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
    }
  }, [accountId]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setAccount({ ...account, accountImage: file });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    // Validate Name
    if (!account.accountName.trim()) {
      newErrors.accountName = "Name is required";
      valid = false;
    } else {
      newErrors.accountName = "";
    }

    // Validate Email
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!account.accountEmail.trim()) {
      newErrors.accountEmail = "Email is required";
      valid = false;
    } else if (!emailPattern.test(account.accountEmail)) {
      newErrors.accountEmail = "Please enter a valid email address";
      valid = false;
    } else {
      newErrors.accountEmail = "";
    }

    // Validate Phone Number (Example: Vietnamese phone number)
    const phonePattern = /^0[1-9][0-9]{8}$/;
    if (!account.accountPhoneNumber.trim()) {
      newErrors.accountPhoneNumber = "Phone number is required";
      valid = false;
    } else if (!phonePattern.test(account.accountPhoneNumber)) {
      newErrors.accountPhoneNumber = "Please enter a valid phone number";
      valid = false;
    } else {
      newErrors.accountPhoneNumber = "";
    }

    // Validate Birthday
    if (!account.accountDob.trim()) {
      newErrors.accountDob = "Birthday is required";
      valid = false;
    } else {
      newErrors.accountDob = "";
    }

    // Validate Gender
    if (!account.accountGender) {
      newErrors.accountGender = "Gender is required";
      valid = false;
    } else {
      newErrors.accountGender = "";
    }

    // Validate Address
    if (!account.accountAddress.trim()) {
      newErrors.accountAddress = "Address is required";
      valid = false;
    } else {
      newErrors.accountAddress = "";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleEdit = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("AccountTempDTO.AccountId", accountId);
    formData.append("AccountTempDTO.AccountName", account.accountName);
    formData.append("AccountTempDTO.AccountEmail", account.accountEmail);
    formData.append("AccountTempDTO.AccountPhoneNumber", account.accountPhoneNumber);
    formData.append("AccountTempDTO.AccountGender", account.accountGender);
    formData.append("AccountTempDTO.AccountDob", account.accountDob);
    formData.append("AccountTempDTO.AccountAddress", account.accountAddress);
    formData.append("AccountTempDTO.RoleId", account.accountRoleId);
    formData.append("AccountTempDTO.isPickImage", account.accountImage ? true : false);

    if (account.accountImage) {
      formData.append("UploadModel.ImageFile", account.accountImage);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/Account`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      if (result.flag) {
        alert("Profile updated successfully!");
        navigate(-1); 
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile!");
    }
  };

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
      <Sidebar />

      <div className="content flex-1 overflow-y-auto">
        <Navbar />

        <div className="p-6 bg-white shadow-md rounded-md max-w-full">
          <h2 className="mb-4 text-xl font-bold text-left">Edit Profile</h2>

          <div className="flex flex-wrap gap-8">
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
            <div className="w-full sm:w-2/3 md:w-2/4 bg-white shadow-md rounded-md p-6">
              <form>
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
                  {errors.accountName && (
                    <p className="text-red-500 text-sm">{errors.accountName}</p>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="block text-sm font-medium mb-1 font-bold">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-3 border rounded-md"
                    value={account.accountEmail || ""}
                    onChange={(e) => setAccount({ ...account, accountEmail: e.target.value })}
                  />
                  {errors.accountEmail && (
                    <p className="text-red-500 text-sm">{errors.accountEmail}</p>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="block text-sm font-medium mb-1 font-bold">
                    Role
                  </label>
                  <select
                    id="role"
                    className="w-full p-3 border rounded-md"
                    value={account.accountRoleId || "user"}
                    onChange={(e) => setAccount({ ...account, accountRoleId: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
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
                  {errors.accountDob && (
                    <p className="text-red-500 text-sm">{errors.accountDob}</p>
                  )}
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
                  {errors.accountGender && (
                    <p className="text-red-500 text-sm">{errors.accountGender}</p>
                  )}
                </div>
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
                  {errors.accountPhoneNumber && (
                    <p className="text-red-500 text-sm">{errors.accountPhoneNumber}</p>
                  )}
                </div>

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
                  {errors.accountAddress && (
                    <p className="text-red-500 text-sm">{errors.accountAddress}</p>
                  )}
                </div>

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
