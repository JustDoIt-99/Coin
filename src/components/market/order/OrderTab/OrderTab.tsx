import * as React from "react";
import {TabButton, TabContainer} from "@components/market/order/OrderTab/OrderTab.styles.ts";

interface Props {
    activeTab: "buy" | "sell" | "history";
    setActiveTab: React.Dispatch<
        React.SetStateAction<"buy" | "sell" | "history">
    >;
}

const tabs = [
    {key: "buy", label: "매수"},
    {key: "sell", label: "매도"},
    {key: "history", label: "거래내역"}
] as const;


function OrderTab({activeTab, setActiveTab}: Props) {
    return(
        <TabContainer>
            {tabs.map((tab) => (
                <TabButton
                    key={tab.key}
                    active={activeTab === tab.key}
                    tabType={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                >
                    {tab.label}
                </TabButton>
            ))}
        </TabContainer>
    )
}

export default OrderTab;