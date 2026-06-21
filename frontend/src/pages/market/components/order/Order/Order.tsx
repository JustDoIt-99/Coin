import {useState} from "react";
import OrderTab from "@pages/market/components/order/OrderTab";
import OrderForm from "@pages/market/components/order/OrderForm";
import OrderHistory from "@pages/market/components/order/OrderHistory";
import {Container} from "@pages/market/components/order/Order/Order.styles";
import type {Ticker} from "@api/api";

interface Props {
    marketCode: string;
    ticker?: Ticker;
}

function Order({marketCode, ticker}: Props) {

    const [activeTab, setActiveTab] = useState<"buy" | "sell" | "history">("buy");

    return (
        <Container>
            <OrderTab activeTab={activeTab} setActiveTab={setActiveTab}/>
            {activeTab !== "history" && (<OrderForm marketCode={marketCode} tradeType={activeTab} ticker={ticker}/>)}
            {activeTab === "history" && (<OrderHistory marketCode={marketCode}/>)}
        </Container>
    );
}

export default Order;
