import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [AccountEmail, setEmail] = useState('');
  const [AccountPassword, setPassword] = useState('');
  const [AccountName, setName] = useState('');
  const [AccountPhoneNumber, setPhoneNumber] = useState('');
  const [AccountGender, setGender] = useState('');
  const [AccountDob, setDob] = useState('');
  const [AccountAddress, setAddress] = useState('');
  const [AccountImage, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

 
  const validatePhoneNumber = (phoneNumber) => {
    const regex = /^0\d{9}$/; 
    return regex.test(phoneNumber);
  };

  const validatePassword = (password) => {
    return password.length >= 6; 
  };

  const validateDob = (dob) => {
    const birthDate = new Date(dob);
    let age = new Date().getFullYear() - birthDate.getFullYear();  
    const month = new Date().getMonth();
    const day = new Date().getDate();
  
    if (month < birthDate.getMonth() || (month === birthDate.getMonth() && day < birthDate.getDate())) {
      age--; 
    }
  
    return age >= 10; 
  };  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');


    if (!AccountName || !AccountEmail || !AccountPhoneNumber || !AccountPassword || !AccountGender || !AccountDob || !AccountAddress) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!validateEmail(AccountEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validatePhoneNumber(AccountPhoneNumber)) {
      setError('Please enter a valid phone number (starting with 0 and 9 digits).');
      return;
    }

    if (!validatePassword(AccountPassword)) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!validateDob(AccountDob)) {
      setError('You must be at least 10 years old.');
      return;
    }

    const formData = new FormData();
    formData.append('RegisterTempDTO.AccountName', AccountName);
    formData.append('RegisterTempDTO.AccountEmail', AccountEmail);
    formData.append('RegisterTempDTO.AccountPhoneNumber', AccountPhoneNumber);
    formData.append('RegisterTempDTO.AccountPassword', AccountPassword);
    formData.append('RegisterTempDTO.AccountGender', AccountGender);
    formData.append('RegisterTempDTO.AccountDob', AccountDob);
    formData.append('RegisterTempDTO.AccountAddress', AccountAddress);

    const generateRandomName = () => {
      return `image_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.png`;
    };

    if (AccountImage) {
      const randomImageName = generateRandomName(); 
      formData.append('UploadModel.ImageFile', AccountImage);
      formData.append('RegisterTempDTO.AccountImage', randomImageName); 
    } else {
      formData.append('RegisterTempDTO.AccountImage', '');
    }

    try {
      const response = await fetch('http://localhost:5000/api/Account/register', {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
        },
        body: formData,
      });

      const result = await response.json();
      console.log('API Response:', result); 

      if (response.ok && result.flag) {
        setSuccess('Registration successful! Please log in.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="flex w-2/3 bg-white shadow-lg">
        <div className="w-1/2 bg-gray-300 flex items-center justify-center">
          <h1 className="text-4xl font-bold">LOGO</h1>
        </div>

        <div className="w-1/2 p-8">
          <div className="flex justify-end">
            <button className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Register</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label htmlFor="image" className="block text-gray-700 font-medium">Profile Image</label>
              <input
                type="file"
                id="image"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium">Name</label>
              <input
                type="text"
                id="name"
                value={AccountName}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium">Email</label>
              <input
                type="email"
                id="email"
                value={AccountEmail}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-700 font-medium">Phone Number</label>
              <input
                type="text"
                id="phone"
                value={AccountPhoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-medium">Password</label>
              <input
                type="password"
                id="password"
                value={AccountPassword}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="gender" className="block text-gray-700 font-medium">Gender</label>
              <select
                id="gender"
                value={AccountGender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="dob" className="block text-gray-700 font-medium">Date of Birth</label>
              <input
                type="date"
                id="dob"
                value={AccountDob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="address" className="block text-gray-700 font-medium">Address</label>
              <input
                type="text"
                id="address"
                value={AccountAddress}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your address"
                required
              />
            </div>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
            <button
              type="submit"
              className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
            >
              REGISTER
            </button>
          </form>
          <div className="text-center mt-4 text-sm">
            <p>
              Already have an account?{' '}
              <a href="/login" className="text-cyan-500 hover:underline">Login Here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
