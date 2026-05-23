import {useState} from "react";
import OrderTab from "@components/market/order/OrderTab/OrderTab.tsx";
import OrderForm from "@components/market/order/OrderForm/OrderForm.tsx";
import OrderHistory from "@components/market/order/OrderHistory/OrderHistory.tsx";
import {Container} from "@components/market/order/Order/Order.styles.ts";

function Order() {

    const [activeTab, setActiveTab] = useState<"buy" | "sell" | "history">("buy");

    return (
        <Container>
            <OrderTab activeTab={activeTab} setActiveTab={setActiveTab}/>
            {activeTab !== "history" && (<OrderForm tradeType={activeTab} />)}
            {activeTab === "history" && (<OrderHistory/>)}
        </Container>
    );
}

export default Order;