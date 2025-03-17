import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Register = () => {
  const [AccountEmail, setEmail] = useState('');
  const [AccountPassword, setPassword] = useState('');
  const [AccountName, setName] = useState('');
  const [AccountPhoneNumber, setPhoneNumber] = useState('');
  const [AccountGender, setGender] = useState('');
  const [AccountDob, setDob] = useState('');
  const [AccountAddress, setAddress] = useState('');

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    dob: '',
    address: '',
  });
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    let valid = true;
    let errorMessages = { ...errors };
    if (!AccountName) {
      errorMessages.name = 'Name is required';
      valid = false;
    } else {
      errorMessages.name = '';
    }
    if (!AccountEmail) {
      errorMessages.email = 'Email is required';
      valid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(AccountEmail)) {
        errorMessages.email = 'Please enter a valid email address (e.g., username@gmail.com)';
        valid = false;
      } else {
        errorMessages.email = '';
      }
    }
    if (!AccountPhoneNumber) {
      errorMessages.phone = 'Phone number is required';
      valid = false;
    } else {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(AccountPhoneNumber)) {
        errorMessages.phone = 'Please enter a valid phone number';
        valid = false;
      } else {
        errorMessages.phone = '';
      }
    }
    if (!AccountPassword) {
      errorMessages.password = 'Password is required';
      valid = false;
    } else if (AccountPassword.length < 6) {
      errorMessages.password = 'Password must be at least 6 characters long';
      valid = false;
    } else {
      errorMessages.password = '';
    }
    if (!AccountGender) {
      errorMessages.gender = 'Gender is required';
      valid = false;
    } else {
      errorMessages.gender = '';
    }
    if (!AccountDob) {
      errorMessages.dob = 'Date of birth is required';
      valid = false;
    } else {
      const birthDate = new Date(AccountDob);
      const currentDate = new Date();
      if (birthDate > currentDate) {
        errorMessages.dob = 'Date of birth cannot be in the future';
        valid = false;
      } else {
        let age = currentDate.getFullYear() - birthDate.getFullYear();
        const monthDifference = currentDate.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age > 100) {
          errorMessages.dob = 'Age cannot be greater than 100 years';
          valid = false;
        } else {
          errorMessages.dob = '';
        }
      }
    }

    if (!AccountAddress) {
      errorMessages.address = 'Address is required';
      valid = false;
    } else {
      errorMessages.address = '';
    }

    setErrors(errorMessages);
    if (!valid) return;

    const formData = new FormData();
    formData.append('RegisterTempDTO.AccountName', AccountName);
    formData.append('RegisterTempDTO.AccountEmail', AccountEmail);
    formData.append('RegisterTempDTO.AccountPhoneNumber', AccountPhoneNumber);
    formData.append('RegisterTempDTO.AccountPassword', AccountPassword);
    formData.append('RegisterTempDTO.AccountGender', AccountGender);
    formData.append('RegisterTempDTO.AccountDob', AccountDob);
    formData.append('RegisterTempDTO.AccountAddress', AccountAddress);
    formData.append('RegisterTempDTO.AccountImage', 'default.jpg');

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch('http://localhost:5050/api/Account/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json().catch(() => null);
      } else {
        result = { message: await response.text() };
      }

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Backend error details:', result);

      if (response.ok && result?.flag) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'Your account has been registered successfully!',
        }).then(() => {
          navigate('/login');
        });
      } else {
        if (result && result.errors) {
          setErrors({
            name: result.errors.AccountName || '',
            email: result.errors.AccountEmail || '',
            phone: result.errors.AccountPhoneNumber || '',
            password: result.errors.AccountPassword || '',
            gender: result.errors.AccountGender || '',
            dob: result.errors.AccountDob || '',
            address: result.errors.AccountAddress || '',
          });
        } else {
          const message = result?.message || 'Registration failed. Please try again.';
          if (message.toLowerCase().includes('phone')) {
            setErrors(prev => ({ ...prev, phone: message }));
          } else if (message.toLowerCase().includes('email')) {
            setErrors(prev => ({ ...prev, email: message }));
          } else {
            setErrors(prev => ({ ...prev, email: message }));
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setErrors(prev => ({ ...prev, email: err.message || 'Please try again later.' }));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="flex w-2/3 bg-white shadow-lg">
        <div className="w-1/2 bg-blue-100 flex items-center justify-center">
          <div className="logo-name font-bold text-3xl">
            <i className="bx bxs-cat text-blue-500 text-5xl"></i>
            <span className="text-black text-3xl">Pet</span>
            <span className="text-blue-500 text-3xl">Ease</span>
          </div>
        </div>

        <div className="w-1/2 p-8">
          <div className="flex justify-end">
            <button className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Register</h2>
          <form onSubmit={handleRegister}>
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
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
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
              {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
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
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
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
