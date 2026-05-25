import { Outlet } from "react-router-dom";
import Header from "@components/layout/header";

function Layout() {
    return (
        <>
            <Header />
            <Outlet />
        </>
    );
}

export default Layout;