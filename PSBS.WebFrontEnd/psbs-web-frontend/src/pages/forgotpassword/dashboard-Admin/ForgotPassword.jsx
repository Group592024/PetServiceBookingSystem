import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '' });
  const token = sessionStorage.getItem("token");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const validateEmail = () => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!regex.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }
    setErrors({ email: '' });
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateEmail()) {
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5050/api/Account/ForgotPassword?email=${encodeURIComponent(email)}`,
        {}, // Dữ liệu body (nếu không có thì để là {})
        {
          headers: {
            Authorization: `Bearer ${token}`, // Thêm token vào header
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.flag) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong, please try again.',
        });
      }
    } catch (error) {
      if (error.response) {
        console.error('API Error:', error.response.data);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response.data.message || 'An error occurred. Please try again.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred. Please try again later.',
        });
      }
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Forgot Password</h2>
          <p className="text-sm text-center text-gray-600 mb-4">
            Remember your password?
            <a href="/login" className="text-cyan-500 hover:underline">Login here</a>
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium">Email address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <button
              type="submit"
              className={`w-full bg-cyan-500 text-white py-2 rounded-lg hover:bg-blue-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
