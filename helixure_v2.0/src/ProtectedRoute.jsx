import { Navigate } from "react-router-dom";
import { useUserAuth } from "./context/AuthContext";
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUserAuth();

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return user ? children : <Navigate to="/signup" />;
};

export default ProtectedRoute;
