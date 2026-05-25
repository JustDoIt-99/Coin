import { Outlet } from "react-router-dom";
import Header from "@components/layout/header/Header.tsx";

function Layout() {
    return (
        <>
            <Header />
            <Outlet />
        </>
    );
}

export default Layout;