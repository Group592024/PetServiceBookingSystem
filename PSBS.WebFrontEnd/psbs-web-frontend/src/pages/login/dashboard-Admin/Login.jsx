import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const [AccountEmail, setEmail] = useState("");
  const [AccountPassword, setPassword] = useState("");
  const navigate = useNavigate();

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
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(AccountEmail)) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please enter a valid email address",
      });
      return false;
    }

    if (AccountPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Password must be at least 6 characters",
      });
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5050/api/Account/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ AccountEmail, AccountPassword }),
      });

      const result = await response.json();

      if (response.ok && result.flag) {
        sessionStorage.setItem("token", result.data);
        const decodedToken = parseJwt(result.data);

        // Store accountId from token
        const accountId = decodedToken["AccountId"];
        sessionStorage.setItem("accountId", accountId);

        const isAccountDeleted = decodedToken["AccountIsDeleted"] === "True";
        if (isAccountDeleted) {
          Swal.fire({
            icon: "error",
            title: "Account Deleted",
            text: "Your account has been deleted. Please contact support.",
          });
        } else {
          const role =
            decodedToken[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];
          localStorage.setItem("role", role);

          if (role === "user") {
            navigate("/");
          } else {
            navigate("/account");
          }
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: result.message || "Login failed. Please try again.",
        });
      }
    } catch (err) {
      console.error("Error occurred during login:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred. Please try again.",
      });
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
            <button className="text-gray-400 hover:text-gray-600 text-xl">
              &times;
            </button>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Login
          </h2>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium"
              >
                Email
              </label>
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
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium"
              >
                Password
              </label>
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

            <div className="text-right mb-4">
              <a
                href="/forgotpassword"
                className="text-cyan-500 hover:underline text-sm"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
            >
              LOGIN
            </button>
          </form>

          <div className="text-center mt-4 text-sm">
            <p>
              You don't have an account?{" "}
              <a href="/register" className="text-cyan-500 hover:underline">
                Register Now !!
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
