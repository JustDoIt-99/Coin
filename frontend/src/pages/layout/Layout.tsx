import {useEffect, useRef} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {AUTH_EXPIRED_EVENT} from "@auth/authEvents";
import Header from "./header";

function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const isHandlingAuthExpired = useRef(false);

    useEffect(() => {
        const handleAuthExpired = () => {
            if (isHandlingAuthExpired.current) return;
            isHandlingAuthExpired.current = true;

            if (location.pathname !== "/login") {
                alert("로그인 시간이 만료되었습니다. 다시 로그인해주세요.");
                navigate("/login", {
                    replace: true,
                    state: {from: location},
                });
            }

            window.setTimeout(() => {
                isHandlingAuthExpired.current = false;
            }, 1000);
        };

        window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

        return () => {
            window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
        };
    }, [location, navigate]);

    return (
        <>
            <Header />
            <Outlet />
        </>
    );
}

export default Layout;
