import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('loggedInUser');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData && userData.role === 'UserAdmin') {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
        localStorage.removeItem('loggedInUser');
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedAdminRoute;