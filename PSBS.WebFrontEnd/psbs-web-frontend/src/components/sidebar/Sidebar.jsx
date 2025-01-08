import React, { useEffect, forwardRef } from "react";
import './index.js';
const Sidebar = forwardRef((_, ref) => {
    useEffect(() => {
        const sideLinks = document.querySelectorAll(
          ".sidebar .side-menu li a:not(.logout)"
        );
    
        sideLinks.forEach((item) => {
          const li = item.parentElement;
          item.addEventListener("click", () => {
            sideLinks.forEach((i) => {
              i.parentElement.classList.remove("active");
            });
            li.classList.add("active");
          });
        });
    
        return () => {
          // Clean up event listeners
          sideLinks.forEach((item) => {
            item.removeEventListener("click", () => {});
          });
        };
      }, []);
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
            Service
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
          <a href="#" className="logout">
          <i className='bx bx-log-out-circle' ></i>
            Logout
          </a>
        </li>
      </ul>
    </div>
  );
});

export default Sidebar;
