import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaBirthdayCake,
  FaVenusMars,
  FaPhone,
  FaMapMarkerAlt,
  FaUpload,
  FaSave,
  FaArrowLeft,
  FaSpinner
} from "react-icons/fa";

const EditProfileCustomer = () => {
  const { accountId } = useParams();
  const sidebarRef = useRef(null);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [account, setAccount] = useState({
    accountName: "",
    accountEmail: "",
    accountPhoneNumber: "",
    accountGender: "male",
    accountDob: "",
    accountAddress: "",
    roleId: "user",
    accountImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessages, setErrorMessages] = useState({
    accountDob: "",
    accountName: "",
    accountEmail: "",
    accountPhoneNumber: "",
    accountAddress: "",
    accountGender: "",
  });

  useEffect(() => {
    if (accountId) {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      fetch(`http://localhost:5050/api/Account?AccountId=${accountId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then((response) => response.json())
        .then(async (data) => {
          console.log("Dữ liệu nhận được từ API:", data);

          setAccount(data);
          if (data.accountDob) {
            const dob = new Date(data.accountDob);
            setAccount((prevState) => ({
              ...prevState,
              accountDob: dob,
            }));
          }
          if (data.accountImage) {
            try {
              const response = await fetch(`http://localhost:5050/api/Account/loadImage?filename=${data.accountImage}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              const imageData = await response.json();
              if (imageData.flag) {
                const imgContent = imageData.data.fileContents;
                const imgContentType = imageData.data.contentType;
                setImagePreview(`data:${imgContentType};base64,${imgContent}`);
              }
            } catch (error) {
              console.error("Error fetching image:", error);
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching account data:", error);
          Swal.fire("Error", "Error loading account data.", "error");
          setLoading(false);
        });
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
    const errors = { ...errorMessages };

    if (!account.accountDob) {
      errors.accountDob = "Birthday is required";
      valid = false;
    } else {
      const birthDate = new Date(account.accountDob);
      const currentDate = new Date();
      if (birthDate > currentDate) {
        errors.accountDob = "Birthday cannot be in the future";
        valid = false;
      } else {
        let age = currentDate.getFullYear() - birthDate.getFullYear();
        const monthDifference = currentDate.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age > 100) {
          errors.accountDob = "Age cannot be greater than 100 years";
          valid = false;
        } else {
          errors.accountDob = "";
        }
      }
    }

    if (!account.accountName.trim()) {
      errors.accountName = "Name is required";
      valid = false;
    }

    if (!account.accountAddress.trim()) {
      errors.accountAddress = "Address is required";
      valid = false;
    }

    if (!account.accountGender) {
      errors.accountGender = "Gender is required";
      valid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!account.accountEmail.trim()) {
      errors.accountEmail = "Email is required";
      valid = false;
    } else if (!emailPattern.test(account.accountEmail)) {
      errors.accountEmail = "Please enter a valid email address (e.g., username@gmail.com)";
      valid = false;
    }

    const phonePattern = /^(0)\d{9}$/;
    if (!account.accountPhoneNumber.trim()) {
      errors.accountPhoneNumber = "Phone number is required";
      valid = false;
    } else if (!phonePattern.test(account.accountPhoneNumber)) {
      errors.accountPhoneNumber = "Phone number must start with 0 and have 10 digits";
      valid = false;
    }

    setErrorMessages(errors);
    return valid;
  };

  const handleEdit = async () => {
    if (!validateForm()) return;

    Swal.fire({
      title: 'Saving changes...',
      html: 'Please wait while we update your profile',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    let formattedDob = account.accountDob ? format(account.accountDob, 'yyyy-MM-dd') : '';

    const formData = new FormData();
    formData.append("AccountTempDTO.AccountId", accountId);
    formData.append("AccountTempDTO.AccountName", account.accountName);
    formData.append("AccountTempDTO.AccountEmail", account.accountEmail);
    formData.append("AccountTempDTO.AccountPhoneNumber", account.accountPhoneNumber);
    formData.append("AccountTempDTO.AccountGender", account.accountGender);
    formData.append("AccountTempDTO.AccountDob", formattedDob);
    formData.append("AccountTempDTO.AccountAddress", account.accountAddress);
    formData.append("AccountTempDTO.roleId", account.roleId);

    if (account.accountImage instanceof File) {
      formData.append("AccountTempDTO.isPickImage", true);
      formData.append("UploadModel.ImageFile", account.accountImage);
    } else {
      formData.append("AccountTempDTO.isPickImage", false);
      formData.append("AccountTempDTO.AccountImage", account.accountImage || "");
    }

    try {
      const response = await fetch(`http://localhost:5050/api/Account`, {
        method: "PUT",
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      console.log("Server Response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from server:", errorData);
        Swal.fire("Error", errorData.message || "Something went wrong", "error");
        return;
      }

      const result = await response.json();
      if (result.flag) {
        Swal.fire({
          title: "Success!",
          text: "Your profile has been updated successfully",
          icon: "success",
          confirmButtonColor: "#0d9488"
        }).then(() => {
          navigate(-1);
        });
      } else {
        Swal.fire("Error", result.message || "Something went wrong", "error");
      }
    } catch (error) {
      console.error("Error updating account data:", error);
      Swal.fire("Error", "Failed to update profile.", "error");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarCustomer sidebarRef={sidebarRef} />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-2xl p-8 text-white">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Edit Profile</h1>
                <p className="opacity-80">Update your personal information</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Left Column - Profile Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="md:w-1/3 p-8 bg-gray-50 border-r border-gray-100"
              >
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-48 h-48 rounded-full bg-white p-2 shadow-lg mb-6 overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile Preview"
                          className="rounded-full w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
                          <FaUser size={60} className="text-blue-500" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300">
                        <label
                          htmlFor="imageUpload"
                          className="opacity-0 group-hover:opacity-100 cursor-pointer bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
                        >
                          <FaUpload size={20} />
                        </label>
                      </div>
                    </div>

                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{account.accountName || "Your Name"}</h2>
                    <p className="text-gray-500">{account.accountEmail || "your.email@example.com"}</p>
                  </div>

                  <div className="w-full bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Profile Image Guidelines</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Use a clear, recent photo of yourself
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Square images work best
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Maximum file size: 5MB
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Supported formats: JPG, PNG, GIF
                      </li>
                    </ul>
                  </div>

                  <label
                    htmlFor="imageUpload"
                    className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <FaUpload className="mr-2" />
                    Upload New Image
                  </label>
                </div>
              </motion.div>

              {/* Right Column - Profile Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="md:w-2/3 p-8"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Personal Information
                </h3>

                <form className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="mr-2 text-blue-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className={`w-full p-3 border ${errorMessages.accountName ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      value={account.accountName || ""}
                      onChange={(e) => {
                        const newAccountName = e.target.value;
                        setAccount({ ...account, accountName: newAccountName });
                        if (newAccountName.trim()) {
                          setErrorMessages((prevState) => ({
                            ...prevState,
                            accountName: "",
                          }));
                        } else {
                          setErrorMessages((prevState) => ({
                            ...prevState,
                            accountName: "Name is required",
                          }));
                        }
                      }}
                      placeholder="Enter your full name"
                    />
                    {errorMessages.accountName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errorMessages.accountName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="mr-2 text-blue-500" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      value={account.accountEmail || ""}
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                  </div>

                  {/* Birthday */}
                  <div>
                    <label htmlFor="birthday" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FaBirthdayCake className="mr-2 text-blue-500" />
                      Date of Birth
                    </label>
                    <DatePicker
                      selected={account.accountDob ? new Date(account.accountDob) : null}
                      onChange={(date) => {
                        setAccount({ ...account, accountDob: date });
                        setErrorMessages((prevState) => ({
                          ...prevState,
                          accountDob: "",
                        }));
                      }}
                      dateFormat="dd/MM/yyyy"
                      showYearDropdown
                      yearDropdownItemNumber={100}
                      scrollableYearDropdown
                      className={`w-full p-3 border ${errorMessages.accountDob ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      placeholderText="Select your date of birth"
                    />
                    {errorMessages.accountDob && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errorMessages.accountDob}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FaVenusMars className="mr-2 text-blue-500" />
                      Gender
                    </label>
                    <div className="flex space-x-4">
                      <div className={`flex-1 p-3 border ${account.accountGender === 'male' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'} rounded-lg cursor-pointer hover:bg-gray-50 transition-colors`}
                        onClick={() => setAccount({ ...account, accountGender: 'male' })}>
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border ${account.accountGender === 'male' ? 'border-blue-500' : 'border-gray-400'} flex items-center justify-center mr-3`}>
                            {account.accountGender === 'male' && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                          </div>
                          <span className={account.accountGender === 'male' ? 'text-blue-700 font-medium' : 'text-gray-700'}>Male</span>
                        </div>
                      </div>

                      <div className={`flex-1 p-3 border ${account.accountGender === 'female' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'} rounded-lg cursor-pointer hover:bg-gray-50 transition-colors`}
                        onClick={() => setAccount({ ...account, accountGender: 'female' })}>
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border ${account.accountGender === 'female' ? 'border-blue-500' : 'border-gray-400'} flex items-center justify-center mr-3`}>
                            {account.accountGender === 'female' && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                          </div>
                          <span className={account.accountGender === 'female' ? 'text-blue-700 font-medium' : 'text-gray-700'}>Female</span>
                        </div>
                      </div>
                    </div>
                    {errorMessages.accountGender && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errorMessages.accountGender}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FaPhone className="mr-2 text-blue-500" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      className={`w-full p-3 border ${errorMessages.accountPhoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      value={account.accountPhoneNumber || ""}
                      onChange={(e) => {
                        const newPhoneNumber = e.target.value;
                        setAccount({ ...account, accountPhoneNumber: newPhoneNumber });
                        if (newPhoneNumber.trim()) {
                          setErrorMessages((prevState) => ({
                            ...prevState,
                            accountPhoneNumber: "",
                          }));
                        } else {
                          setErrorMessages((prevState) => ({
                            ...prevState,
                            accountPhoneNumber: "Phone number is required",
                          }));
                        }
                      }}
                      placeholder="Enter your phone number"
                    />
                    {errorMessages.accountPhoneNumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errorMessages.accountPhoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="mr-2 text-blue-500" />
                      Address
                    </label>
                    <textarea
                      id="address"
                      rows="3"
                      className={`w-full p-3 border ${errorMessages.accountAddress ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      value={account.accountAddress || ""}
                      onChange={(e) => {
                        const newAddress = e.target.value;
                        setAccount({ ...account, accountAddress: newAddress });
                        if (newAddress.trim()) {
                          setErrorMessages((prevState) => ({
                            ...prevState,
                            accountAddress: "",
                          }));
                        } else {
                          setErrorMessages((prevState) => ({
                            ...prevState,
                            accountAddress: "Address is required",
                          }));
                        }
                      }}
                      placeholder="Enter your full address"
                    ></textarea>
                    {errorMessages.accountAddress && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errorMessages.accountAddress}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all shadow-md flex items-center justify-center"
                    >
                      <FaSave className="mr-2" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center"
                    >
                      <FaArrowLeft className="mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfileCustomer;
