import React, { useEffect,forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './index.js';

const Sidebar = forwardRef((_, ref) => {
  const location = useLocation();

  useEffect(() => {
    const sideLinks = document.querySelectorAll('.sidebar .side-menu li a:not(.logout)');

    sideLinks.forEach((item) => {
      const li = item.parentElement;
      if (item.getAttribute('href') === location.pathname) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }

      item.addEventListener('click', () => {
        sideLinks.forEach((i) => {
          i.parentElement.classList.remove('active');
        });
        li.classList.add('active');
      });
    });

    return () => {
      sideLinks.forEach((item) => {
        item.removeEventListener('click', () => {});
      });
    };
  }, [location.pathname]);

  return (
    <div className='sidebar' ref={ref}>
      <a href='#' className='logo'>
        <i className='bx bxs-cat'></i>
        <div className='logo-name'>
          <span>Pet</span>Ease
        </div>
      </a>

      <ul className='side-menu'>
        <li>
          <Link to='/'>
            <i className='bx bxs-dashboard'></i>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to='/service'>
            <i className='bx bx-store-alt'></i>
            Service
          </Link>
        </li>
        <li>
          <Link to='/medicines'>
            <i className='bx bxs-capsule'></i>
            Medicines
          </Link>
        </li>
        <li>
          <Link to='/room'>
            <i className='bx bx-home-heart'></i>
            Room
          </Link>
        </li>
        <li>
          <Link to='/camera'>
            <i className='bx bxs-webcam'></i>
            Camera
          </Link>
        </li>
        <li>
          <Link to='/pet'>
            <i className='bx bxs-dog'></i>
            Pet
          </Link>
        </li>
        <li>
          <Link to='/gift'>
            <i className='bx bx-gift'></i>
            Gift
          </Link>
        </li>
        <li>
          <Link to='/voucher'>
            <i className='bx bx-wallet'></i>
            Voucher
          </Link>
        </li>
        <li>
          <Link to='/petType'>
            <i className='bx bxs-cat'></i>
            Pet Type
          </Link>
        </li>
      </ul>
      <ul className='side-menu'>
        <li>
          <a href='#' className='logout'>
            <i className='bx bx-log-out-circle'></i>
            Logout
          </a>
        </li>
      </ul>
    </div>
  );
});

export default Sidebar;
