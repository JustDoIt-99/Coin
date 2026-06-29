import {Navigate, Outlet} from "react-router-dom";
import Loading from "@pages/layout/Loading";
import {useAuth} from "@auth/useAuth";

function AdminRoute() {
    const {isAuthenticated, isLoading, user} = useAuth();

    if (isLoading) {
        return <Loading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default AdminRoute;
