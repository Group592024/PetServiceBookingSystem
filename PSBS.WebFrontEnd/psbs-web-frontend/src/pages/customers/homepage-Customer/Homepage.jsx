import React from "react";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";

const Homepage = () => {
  return (
    <div>
      <NavbarCustomer />

      <div className="content">
        <h1 className="text-3xl font-bold underline text-blue-500 hover:text-red-500">
          Hello world!
        </h1>
      </div>
    </div>
  );
};

export default Homepage;
