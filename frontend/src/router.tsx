import { createBrowserRouter } from "react-router-dom";
import MarketPage from "./pages/market";
import Layout from "./pages/layout/Layout";
import LoginPage from "./pages/auth/login/LoginPage";
import SignupPage from "./pages/auth/signup/SignupPage";
import PortfolioPage from "./pages/portfolio/PortfolioPage";
import ProtectedRoute from "./auth/ProtectedRoute.tsx";

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
                path: "signup",
                element: <SignupPage/>
            },
            {
                element: <ProtectedRoute/>,
                children: [
                    {
                        path: "portfolio",
                        element: <PortfolioPage/>
                    }
                ]
            }
        ],
    }
]);