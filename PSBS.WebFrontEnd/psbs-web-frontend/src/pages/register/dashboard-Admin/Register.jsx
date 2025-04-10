import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCalendarAlt, FaMapMarkerAlt, FaPaw, FaEye, FaEyeSlash, FaVenusMars } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Register = () => {
  const [AccountEmail, setEmail] = useState('');
  const [AccountPassword, setPassword] = useState('');
  const [AccountName, setName] = useState('');
  const [AccountPhoneNumber, setPhoneNumber] = useState('');
  const [AccountGender, setGender] = useState('');
  const [AccountDob, setDob] = useState('');
  const [AccountAddress, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
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

      if (response.ok && result?.flag) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'Your account has been registered successfully!',
          confirmButtonColor: '#3B82F6',
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
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Left side - Brand (hidden on small screens) */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 flex-col items-center justify-center text-white">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <i className="bx bxs-cat text-white-500 text-6xl"></i>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-white">Pet</span>
              <span className="text-yellow-300">Ease</span>
            </h1>
            <p className="text-blue-100 mb-6">Your pet's happiness, our priority</p>
            <div className="w-16 h-1 bg-yellow-300 mx-auto mb-6"></div>
            <p className="text-sm text-blue-100 mb-8">
              Join our community of pet lovers and access premium pet services
            </p>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-white text-xl font-semibold mb-3">Why Register?</h3>
              <ul className="text-blue-100 text-sm space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Book pet services easily
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Track your pet's appointments
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Earn rewards and discounts
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Access exclusive pet care tips
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Mobile brand header (visible only on small screens) */}
        <div className="md:hidden bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-center">
          <i className="bx bxs-cat text-white-500 text-3xl"></i>
          <h1 className="text-2xl font-bold">
            <span className="text-white">Pet</span>
            <span className="text-yellow-300">Ease</span>
          </h1>
        </div>

        {/* Right side - Registration Form */}
        <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto max-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Create Account</h2>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
            >
              &times;
            </button>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div className="relative">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={AccountName}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email Field */}
                <div className="relative">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={AccountEmail}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="example@email.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone Number Field */}
                <div className="relative">
                  <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="phone"
                      value={AccountPhoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="0123456789"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Password Field */}
                <div className="relative">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={AccountPassword}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="••••••••"
                    />
                    <div
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ?
                        <FaEyeSlash className="text-gray-400 hover:text-gray-600" /> :
                        <FaEye className="text-gray-400 hover:text-gray-600" />
                      }
                    </div>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Gender Field */}
                <div className="relative">
                  <label htmlFor="gender" className="block text-gray-700 text-sm font-medium mb-1">Gender</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaVenusMars className="text-gray-400" />
                    </div>
                    <select
                      id="gender"
                      value={AccountGender}
                      onChange={(e) => setGender(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white`}
                    >
                      <option value="">Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>

                {/* Date of Birth Field */}
                <div className="relative">
                  <label htmlFor="dob" className="block text-gray-700 text-sm font-medium mb-1">Date of Birth</label>

                  {/* Hidden date input */}
                  <input
                    type="date"
                    id="dob"
                    value={AccountDob ? AccountDob.split('T')[0] : ''}
                    onChange={(e) => {
                      setDob(e.target.value);
                      setErrors({ ...errors, dob: '' });
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className="absolute left-0 w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    style={{ opacity: 0, zIndex: -1 }}
                  />

                  {/* Display formatted date */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      onClick={() => document.getElementById('dob').showPicker()}
                      value={AccountDob ? formatDateDisplay(AccountDob) : ''}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border 
                                ${errors.dob ? 'border-red-500' : 'border-gray-300'} 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer`}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>

                  {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                </div>

                {/* Address Field - Full width */}
                <div className="relative md:col-span-2">
                  <label htmlFor="address" className="block text-gray-700 text-sm font-medium mb-1">Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="address"
                      value={AccountAddress}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Your full address"
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                      required
                    />
                  </div>
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    I agree to the <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

