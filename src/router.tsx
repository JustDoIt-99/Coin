import {createBrowserRouter} from "react-router-dom";
import MarketPage from "./page/MarketPage.tsx";

export const router = createBrowserRouter([
    {
        path:"/",
        element: <MarketPage/>
    }
]);