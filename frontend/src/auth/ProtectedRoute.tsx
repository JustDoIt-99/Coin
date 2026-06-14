
import {Navigate, Outlet, useLocation} from "react-router-dom";
import Loading from "@pages/layout/Loading.tsx";
import {useAuth} from "./useAuth.ts";

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