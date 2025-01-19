import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import Swal from "sweetalert2";
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";

const EditProfileCustomer = () => {
  const { accountId } = useParams();
  const sidebarRef = useRef(null);

  const [selectedDate] = useState(null);
  const navigate = useNavigate();
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
      fetch(`http://localhost:5000/api/Account?AccountId=${accountId}`)
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
              const response = await fetch(`http://localhost:5000/api/Account/loadImage?filename=${data.accountImage}`);
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
        })
        .catch((error) => {
          console.error("Error fetching account data:", error);
          Swal.fire("Error", "Error loading account data.", "error");
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
    const today = new Date().toISOString().split("T")[0];
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

    const phonePattern = /^(03|05|07|08|09)\d{8}$/;
    if (!account.accountPhoneNumber.trim()) {
      errors.accountPhoneNumber = "Phone number is required";
      valid = false;
    } else if (!phonePattern.test(account.accountPhoneNumber)) {
      errors.accountPhoneNumber = "Please enter a valid phone number (starting with 03, 05, 07, 08, or 09 and 9 digits)";
      valid = false;
    }

    setErrorMessages(errors);
    return valid;
  };

  const handleEdit = async () => {
    if (!validateForm()) return;

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

    // Xử lý ảnh nếu có
    if (account.accountImage) {
      formData.append("AccountTempDTO.isPickImage", true);
      formData.append("UploadModel.ImageFile", account.accountImage);
    } else {
      formData.append("AccountTempDTO.isPickImage", false);
      formData.append("AccountTempDTO.AccountImage", account.accountImage || "");
    }

    const response = await fetch(`http://localhost:5000/api/Account`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from server:", errorData);
      Swal.fire("Error", errorData.message || "Something went wrong", "error");
      return;
    }

    const result = await response.json();
    if (result.flag) {
      Swal.fire("Success", "Profile updated successfully!", "success");
      navigate(-1);
    } else {
      Swal.fire("Error", result.message || "Something went wrong", "error");
    }
  };


  const convertToDate = (dateString) => {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return null;
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
      <div className=" overflow-y-auto w-full">
        <NavbarCustomer sidebarRef={sidebarRef} />
        <div className="p-6 bg-white shadow-md rounded-md max-w-full">
          <h2 className="mb-4 text-xl font-bold text-left">Edit Profile</h2>
          <div className="flex justify-center
 flex-wrap gap-8">
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
            <div className="w-full sm:w-2/3 bg-white shadow-md rounded-md p-6">
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
                  />

                  {errorMessages.accountName && (
                    <p className="text-red-500 text-sm mt-1">{errorMessages.accountName}</p>
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
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="block text-sm font-medium mb-1 font-bold">
                    Role
                  </label>
                  <select
                    id="role"
                    className="w-full p-3 border rounded-md"
                    value={account.roleId}
                    onChange={(e) => setAccount({ ...account, roleId: e.target.value })}
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
                  <DatePicker
                    selected={account.accountDob ? account.accountDob : null}
                    onChange={(date) => {
                      setAccount({ ...account, accountDob: date });
                    }}
                    dateFormat="dd/MM/yyyy"
                    customInput={<input className="w-full p-3 border rounded-md" />}
                  />
                  {errorMessages.accountDob && (
                    <p className="text-red-500 text-sm mt-1">{errorMessages.accountDob}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 font-bold">
                    Gender
                  </label>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={account.accountGender === "male"}
                      onChange={(e) => setAccount({ ...account, accountGender: e.target.value })}
                    />
                    <label className="ml-2 text-sm">Male</label>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={account.accountGender === "female"}
                      onChange={(e) => setAccount({ ...account, accountGender: e.target.value })}
                      className="ml-4"
                    />
                    <label className="ml-2 text-sm">Female</label>
                  </div>

                  {errorMessages.accountGender && (
                    <p className="text-red-500 text-sm mt-1">{errorMessages.accountGender}</p>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="block text-sm font-medium mb-1 font-bold">
                    Phone
                  </label>
                  <input
                    type="text"
                    id="phone"
                    className="w-full p-3 border rounded-md"
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
                  />
                  {errorMessages.accountPhoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errorMessages.accountPhoneNumber}</p>
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
                  />

                  {errorMessages.accountAddress && (
                    <p className="text-red-500 text-sm mt-1">{errorMessages.accountAddress}</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
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

export default EditProfileCustomer;
