import React, { useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import './index.js';

const Sidebar = forwardRef((_, ref) => {
  const navigate = useNavigate(); // Khởi tạo navigate từ react-router-dom

  const handleLogout = () => {
    // Hiển thị thông báo với nút Yes và No
    Swal.fire({
      title: "Are you sure? You want to log out?",
      text: "You are about to log out from your account. Make sure you have saved your progress.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#4CD630FF", // Màu xanh cho Yes
      cancelButtonColor: "#d33", // Màu đỏ cho No
    }).then((result) => {
      if (result.isConfirmed) {
        // Xóa JWT token từ localStorage hoặc sessionStorage
        localStorage.removeItem("jwtToken");
        sessionStorage.removeItem("jwtToken");

        // Xóa thêm dữ liệu người dùng nếu lưu trữ
        localStorage.removeItem("userData");
        sessionStorage.removeItem("userData");

        // Hiển thị thông báo thành công
        Swal.fire({
          title: "Logged out",
          text: "You have been logged out successfully!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          // Sau khi đăng xuất, chuyển hướng người dùng về trang login và thay thế lịch sử
          navigate("/login", { replace: true });
        });
      }
    });
  };

  return (
    <div className="sidebar" ref={ref}>
      <a href="#" className="logo">
        <i className='bx bxs-cat'></i>
        <div className="logo-name">
          <span>Pet</span>Ease
        </div>
      </a>

      <ul className="side-menu">
        <li className="active">
          <a href="#">
            <i className='bx bxs-dashboard' ></i>
            Dashboard
          </a>
        </li>
        <li>
          <a href="#">
            <i className='bx bx-store-alt' ></i>
            XXXXXXXXX
          </a>
        </li>
        <li>
          <a href="#">
            <i className='bx bx-home-heart' ></i>
            Room
          </a>
        </li>
        <li>
          <a href="#">
            <i className='bx bxs-webcam' ></i>
            Camera
          </a>
        </li>
        <li>
          <a href="#">
            <i className='bx bxs-dog' ></i>
            Pet
          </a>
        </li>
        <li>
          <a href="#">
            <i className='bx bx-gift' ></i>
            Gift
          </a>
        </li>
        <li>
          <a href="#">
            <i className='bx bx-wallet' ></i>
            Voucher
          </a>
        </li>
      </ul>

      <ul className="side-menu">
        <li>
          <a href="#" className="logout" onClick={handleLogout}>
            <i className='bx bx-log-out-circle' ></i>
            Logout
          </a>
        </li>
      </ul>
    </div>
  );
});

export default Sidebar;
