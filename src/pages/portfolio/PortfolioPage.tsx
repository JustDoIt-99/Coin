import {
    Page,
    TabBar,
    TabItem
} from "./PortfolioPage.styles";
import { useState } from "react";
import TradeHistory from "@pages/tradehistory";
import AssetSummary from "@pages/portfolio/components/assetsummary";

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

            {activeTab === "assets" && (
                <>
                    <AssetSummary/>
                </>
            )}

            {activeTab === "history" && <TradeHistory/>}
            {activeTab === "pending" && <div>미체결 UI 영역</div>}
            {activeTab === "deposit" && <div>입출금대기 UI 영역</div>}
        </Page>
    );
}

export default PortfolioPage;