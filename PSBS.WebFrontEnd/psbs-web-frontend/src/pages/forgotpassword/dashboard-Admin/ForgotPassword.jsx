import React, { useState } from 'react';
import axios from 'axios';

/**
 * ForgotPassword component handles user email input and submits a reset password request.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const [successMessage, setSuccessMessage] = useState('');


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };


  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };


  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true); 
    setError(''); 
    setSuccessMessage(''); 

    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email.');
      setLoading(false);
      return;
    }

    try {
      // Send email request to reset password
      const response = await axios.post(
        `http://localhost:5000/api/Account/ForgotPassword?email=${encodeURIComponent(email)}`
      );

      if (response.data && response.data.flag) {
        setSuccessMessage(response.data.message); 
      } else {
        setError('Something went wrong, please try again.');
      }
    } catch (error) {
      if (error.response) {
        console.error('API Error:', error.response.data);
        setError(error.response.data.message || 'An error occurred. Please try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false); 
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
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {successMessage && <div className="text-green-500 text-sm">{successMessage}</div>}

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
