import {
    Page,
    TabBar,
    TabItem
} from "./PortfolioPage.styles";
import { useState } from "react";
import TradeHistory from "@pages/tradehistory";
import AssetSummary from "@pages/portfolio/components/assetsummary";
import PendingOrder from "@pages/pendingOrder";
import Deposit from "@pages/deposit";

type PortfolioTab = "assets" | "history" | "pending" | "deposit";

const tabs: { label: string; value: PortfolioTab }[] = [
    { label: "보유자산", value: "assets" },
    { label: "거래내역", value: "history" },
    { label: "미체결", value: "pending" },
    { label: "입출금대기", value: "deposit" },
];

function PortfolioPage() {
    const [activeTab, setActiveTab] = useState<PortfolioTab>("assets");

    return (
        <Page>
            <TabBar>
                {tabs.map((tab) => (
                    <TabItem
                        key={tab.value}
                        $active={activeTab === tab.value}
                        onClick={() => setActiveTab(tab.value)}
                    >
                        {tab.label}
                    </TabItem>
                ))}
            </TabBar>

            {activeTab === "assets" && <AssetSummary />}
            {activeTab === "history" && <TradeHistory/>}
            {activeTab === "pending" && <PendingOrder/>}
            {activeTab === "deposit" && <Deposit/>}
        </Page>
    );
}

export default PortfolioPage;