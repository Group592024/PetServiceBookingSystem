import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userToken = sessionStorage.getItem("token");
  console.log(userToken);
  const userRole = useMemo(() => {
    if (!userToken) {
      return null;
    }
    const decodedToken = jwtDecode(userToken);
    console.log(decodedToken);
    return (
      decodedToken?.role ||
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ]
    );
  }, [userToken]);

  console.log(userRole);

  if (userRole === null) {
    return <Navigate to="/login" replace />;
  } else if (!userRole || !allowedRoles.includes(userRole)) {
    localStorage.setItem("currentRole", userRole);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
