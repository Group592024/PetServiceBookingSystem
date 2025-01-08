import React, { useRef } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";

const PointRuleList = () => {
const sidebarRef = useRef(null);
  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
            Da 21
        </main>
      </div>
    </div>
  );
};

export default PointRuleList;
