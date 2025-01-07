import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [AccountEmail, setEmail] = useState('');
  const [AccountPassword, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      const response = await fetch('http://localhost:5000/api/Account/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ AccountEmail, AccountPassword }),
      });

      const result = await response.json();
      console.log(result);
      if (response.ok && result.flag) {
        // Save token to session storage
        sessionStorage.setItem('token', result.data);

        // Navigate to /account
        navigate('/account');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="flex w-2/3 bg-white shadow-lg">
        {/* Left Section (Logo) */}
        <div className="w-1/2 bg-gray-300 flex items-center justify-center">
          <h1 className="text-4xl font-bold">LOGO</h1>
        </div>

        {/* Right Section (Login Form) */}
        <div className="w-1/2 p-8">
          <div className="flex justify-end">
            <button className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Login</h2>
          <form onSubmit={handleLogin}>
            {/* Email Input */}
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
            {/* Password Input */}
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
            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            {/* Forgot Password */}
            <div className="text-right mb-4">
              <a href="#" className="text-cyan-500 hover:underline text-sm">Forgot Password?</a>
            </div>
            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
            >
              LOGIN
            </button>
          </form>
          {/* Register Link */}
          <div className="text-center mt-4 text-sm">
            <p>
              You don’t have an account?{' '}
              <a href="#" className="text-cyan-500 hover:underline">Register Now !!</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
