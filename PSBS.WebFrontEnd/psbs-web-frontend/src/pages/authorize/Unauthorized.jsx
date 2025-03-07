import React from "react";
import unauthorized from "../../assets/unauthorized.jpg";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  let url = "";

  const currentRole = localStorage.getItem("currentRole");
  if (currentRole === null) {
    url = "/login";
  } else if (currentRole === "admin" || currentRole === "staff") {
    url = "/dashboard";
  } else url = "/";

  return (
    <div className="flex justify-center m-10">
      <div className="flex justify-center p-5 rounded-lg bg-white w-1/2">
        <div>
          <p className="text-7xl font-extrabold text-customPrimary text-center my-5">
            403
          </p>
          <p className="text-3xl font-semibold text-center my-5">
            Forbidden Error
          </p>
          <div className="flex justify-center">
            <img
              src={unauthorized}
              alt="unauthorizedImage"
              className="w-1/4 my-5"
            />
          </div>
          <div className="flex justify-center ">
            <Link to={url}>
              <button className="p-3 rounded-lg bg-customLightPrimary">
                <p className="text-customPrimary text-xl font-semibold">
                  Back to home
                </p>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
