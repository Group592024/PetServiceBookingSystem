import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft, FaPaw, FaSpinner } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '' });
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) validateEmail(e.target.value);
  };

  const validateEmail = (emailValue = email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailValue) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!regex.test(emailValue)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }
    setErrors({ email: '' });
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5050/api/Account/ForgotPassword?email=${encodeURIComponent(email)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.flag) {
        setEmailSent(true);
        Swal.fire({
          icon: 'success',
          title: 'Email Sent',
          text: 'Password reset instructions have been sent to your email',
          confirmButtonColor: '#3B82F6',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong, please try again.',
          confirmButtonColor: '#3B82F6',
        });
      }
    } catch (error) {
      if (error.response) {
        console.error('API Error:', error.response.data);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response.data.message || 'An error occurred. Please try again.',
          confirmButtonColor: '#3B82F6',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred. Please try again later.',
          confirmButtonColor: '#3B82F6',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Left side - Brand */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 flex flex-col items-center justify-center text-white">
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

            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-white text-xl font-semibold mb-3">Password Recovery</h3>
              <p className="text-blue-100 text-sm mb-4">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              <ul className="text-blue-100 text-sm space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">1.</span> Enter your registered email
                </li>
                <li className="flex items-center">
                  <span className="mr-2">2.</span> Check your inbox for reset link
                </li>
                <li className="flex items-center">
                  <span className="mr-2">3.</span> Create a new secure password
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Right side - Form */}
        <div className="md:w-1/2 p-8">
          <div className="flex justify-between items-center mb-8">
            <Link
              to="/login"
              className="text-gray-500 hover:text-blue-600 transition-colors flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Login
            </Link>
            <Link
              to="/"
              className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
            >
              &times;
            </Link>
          </div>

          {!emailSent ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Your Password?</h2>
              <p className="text-gray-600 mb-6">
                Don't worry, we'll help you recover it.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={() => validateEmail()}
                      className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Enter your registered email"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-green-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Check Your Email</h3>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to:
              </p>
              <p className="text-blue-600 font-medium mb-6">{email}</p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Try another email
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
