import { createBrowserRouter } from "react-router-dom";
import Layout from "@components/layout/Layout";
import MarketPage from "@pages/MarketPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <MarketPage />,
            },
        ],
    },
]);