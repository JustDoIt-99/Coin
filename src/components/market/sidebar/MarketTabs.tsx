import type {MarketTab} from "../../../page/MarketPage.tsx";
import styled from "@emotion/styled";

const Tabs = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    height: 48px;
    border-right: 1px solid #dfe3ea;
    border-bottom: 1px solid #dfe3ea;
`;

const TabButton = styled.button<{ isActive: boolean }>`
    border: none;
    background: #fff;
    cursor: pointer;
    font-weight: 700;
    color: ${({isActive}) => (isActive ? "#0062df" : "#333")};
    border-bottom: ${({isActive}) =>
            isActive ? "3px solid #0062df" : "3px solid transparent"};
`;

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