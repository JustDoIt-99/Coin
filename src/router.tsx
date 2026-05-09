import {createBrowserRouter} from "react-router-dom";
import MarketPage from "@pages/MarketPage.tsx";

export const router = createBrowserRouter([
    {
        path:"/",
        element: <MarketPage/>
    }
]);