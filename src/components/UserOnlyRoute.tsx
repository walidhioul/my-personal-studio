import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const UserOnlyRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default UserOnlyRoute;