import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState(''); // Lưu giá trị email
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [error, setError] = useState(''); // Trạng thái lỗi
  const [successMessage, setSuccessMessage] = useState(''); // Trạng thái thành công

  // Xử lý thay đổi email
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngừng hành động mặc định của form
    setLoading(true); // Bắt đầu loading
    setError(''); // Xóa lỗi cũ
    setSuccessMessage(''); // Xóa thông báo thành công

    // Kiểm tra email đã nhập
    if (!email) {
      setError('Please enter a valid email.');
      setLoading(false);
      return;
    }

    try {
      // Gửi email trong yêu cầu GET
      const response = await axios.post(
        `http://localhost:5000/api/Account/ForgotPassword?email=${encodeURIComponent(email)}`
      );

      // Kiểm tra phản hồi từ server
      if (response.data && response.data.flag) {
        setSuccessMessage(response.data.message); // Hiển thị thông báo thành công
      } else {
        setError('Something went wrong, please try again.');
      }
    } catch (error) {
      // Xử lý lỗi từ API
      if (error.response) {
        console.error('API Error:', error.response.data);
        setError(error.response.data.message || 'An error occurred. Please try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="flex w-2/3 bg-white shadow-lg">
        {/* Left Section (Logo) */}
        <div className="w-1/2 bg-gray-300 flex items-center justify-center">
          <h1 className="text-4xl font-bold">LOGO</h1>
        </div>

        {/* Right Section (Forgot Password Form) */}
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
            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium">Email address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange} // Cập nhật giá trị email khi người dùng nhập
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Lỗi */}
            {error && <div className="text-red-500 text-sm">{error}</div>}

            {/* Thông báo thành công */}
            {successMessage && <div className="text-green-500 text-sm">{successMessage}</div>}

            {/* Reset Password Button */}
            <button
              type="submit"
              className={`w-full bg-cyan-500 text-white py-2 rounded-lg hover:bg-blue-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading} // Vô hiệu hóa nút khi đang loading
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
