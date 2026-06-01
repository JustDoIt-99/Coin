import { createBrowserRouter } from "react-router-dom";
import Layout from "@pages/layout/Layout";
import MarketPage from "@pages/market";
import PortfolioPage from "@pages/portfolio/PortfolioPage.tsx";
import LoginPage from "@pages/login/LoginPage.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <MarketPage />,
            },
            {
              path: "login",
              element: <LoginPage />
            },
            {
                path: "portfolio",
                element: <PortfolioPage />,
            },
        ],
    }
]);