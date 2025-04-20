import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEnvelope, FaLock, FaPaw, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { useUserStore } from "../../../lib/userStore";
const Login = () => {
  const [AccountEmail, setEmail] = useState("");
  const [AccountPassword, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("rememberedEmail");
    const savedPassword = sessionStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const parseJwt = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  const validateForm = () => {
    if (!AccountEmail || !AccountPassword) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Email and password cannot be empty",
        confirmButtonColor: "#3B82F6",
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(AccountEmail)) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please enter a valid email address",
        confirmButtonColor: "#3B82F6",
      });
      return false;
    }
    if (AccountPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Password must be at least 6 characters",
        confirmButtonColor: "#3B82F6",
      });
      return false;
    }
    return true;
  };

  const handleRememberMe = () => {
    if (rememberMe) {
      sessionStorage.setItem("rememberedEmail", AccountEmail);
      sessionStorage.setItem("rememberedPassword", AccountPassword);
    } else {
      sessionStorage.removeItem("rememberedEmail");
      sessionStorage.removeItem("rememberedPassword");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:5050/api/Account/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ AccountEmail, AccountPassword }),
      });
      const result = await response.json();
      if (response.ok && result.flag) {
        handleRememberMe();

        sessionStorage.setItem("token", result.data);
        const decodedToken = parseJwt(result.data);
        const accountId = decodedToken["AccountId"];
        sessionStorage.setItem("accountId", accountId);
        const isAccountDeleted = decodedToken["AccountIsDeleted"] === "True";
        if (isAccountDeleted) {
          Swal.fire({
            icon: "error",
            title: "Account Baned",
            text: "Your account has been baned. Please contact shop to support.",
            confirmButtonColor: "#3B82F6",
          });
        } else {
          const role =
            decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];
          sessionStorage.setItem("role", role);
          useUserStore.setState({ currentUser: null, isLoading: false });
          Swal.fire({
            icon: "success",
            title: "Login Successful!",
            text: `Welcome back to PetEase`,
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            if (role === "user") {
              navigate("/");
            } else {
              navigate("/report");
            }
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: result.message || "Login failed. Please try again.",
          confirmButtonColor: "#3B82F6",
        });
      }
    } catch (err) {
      console.error("Error occurred during login:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred. Please try again.",
        confirmButtonColor: "#3B82F6",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden"
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
            <p className="text-sm text-blue-100">
              Providing the best services for your beloved pets
            </p>
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

        {/* Right side - Login Form */}
        <div className="w-full md:w-3/5 p-6 md:p-10">
          <div className="flex justify-end">
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
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Welcome Back</h2>
            <p className="text-gray-500 text-center mb-6 md:mb-8">Please sign in to your account</p>

            <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={AccountEmail}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Email address"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={AccountPassword}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Password"
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a
                  href="/forgotpassword"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="text-center mt-6 md:mt-8">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                  Create an account
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
