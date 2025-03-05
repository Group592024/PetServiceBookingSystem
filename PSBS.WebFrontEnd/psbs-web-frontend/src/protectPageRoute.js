import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userToken = sessionStorage.getItem("token");
  const userRole = useMemo(() => {
    if (!userToken) {
      return null;
    }
    const decodedToken = jwtDecode(userToken);
    return decodedToken?.role;
  }, [userToken]);

  if (userRole === null) {
    return <Navigate to="/login" replace />;
  } else if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
