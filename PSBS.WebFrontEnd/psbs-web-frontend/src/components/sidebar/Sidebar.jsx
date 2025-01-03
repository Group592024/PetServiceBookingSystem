import React from "react";
import 'boxicons'
import PetsIcon from '@mui/icons-material/Pets';
const Sidebar = () => {
  return <div className="sidebar ">
    <a href="#" className="logo">
    <box-icon type='solid' name='cat'></box-icon>
    <div className="logo-name"><span>Pet</span>Ease</div>
    </a>
    <ul className="side">
        <li><a href="#"><box-icon type='solid' name='dashboard'></box-icon></a>Dashboard</li>
        <li><a href="#"><box-icon name='store'></box-icon></a>Service</li>
        <li><a href="#"><box-icon name='home-heart'></box-icon></a>Room</li>
        <li><a href="#"><box-icon name='webcam' type='solid' ></box-icon></a>Camera</li>
        <li><a href="#"></a> <PetsIcon />Pet</li>
        <li><a href="#"><box-icon name='gift' ></box-icon></a>Gift</li>
        <li><a href="#"><box-icon name='money'></box-icon></a>Voucher</li>
    </ul>
    <ul className="side-menu">
        <li>
            <a href="#" class="logout">
            <box-icon name='log-out-circle' ></box-icon>
            </a>
        </li>
    </ul>
    
  </div>;
};

export default Sidebar;
