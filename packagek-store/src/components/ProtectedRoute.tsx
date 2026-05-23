import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="text-center p-8">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
