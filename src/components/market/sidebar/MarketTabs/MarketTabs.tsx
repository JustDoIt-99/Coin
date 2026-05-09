import type {MarketTab} from "@page/MarketPage.tsx";
import {TabButton, Tabs} from "./MarketTabs.styles.ts";

interface Props {
    activeTab: MarketTab;
    setActiveTab: (tab: MarketTab) => void;
}

const tabs: MarketTab[] = ["KRW", "BTC", "USDT"];

function MarketTabs({activeTab, setActiveTab}: Props) {
    return (
        <Tabs>
            {tabs.map((tab) => (
                <TabButton
                    key={tab}
                    isActive={activeTab == tab}
                    onClick={() => setActiveTab(tab)}
                >
                    {tab == "KRW" ? "원화" : tab}
                </TabButton>
            ))}
        </Tabs>
    );
}

export default MarketTabs;