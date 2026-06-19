
import {Navigate, Outlet, useLocation} from "react-router-dom";
import Loading from "@pages/layout/Loading";
import {useAuth} from "@auth/useAuth";

function ProtectedRoute() {
    const {isAuthenticated, isLoading} = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <Loading/>
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{from: location}}
            />
        )
    }

    return <Outlet />
}

export default ProtectedRoute;
