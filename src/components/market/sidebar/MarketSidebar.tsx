import styled from "@emotion/styled";
import type {Market, Ticker} from "../../../api/api.ts";
import MarketRow from "./MarketRow.tsx";
import type {MarketTab} from "../../../page/MarketPage.tsx";
import MarketTabs from "./MarketTabs.tsx";
import MarketHeaderRow from "./MarketHeaderRow.tsx";
import {useDeferredValue, useState} from "react";
import MarketSearch from "./MarketSearch.tsx";

const Container = styled.aside`
    width: 420px;
    height: 100vh;
    background: #fff;
    border-left: 1px solid #dfe3ea;
    display: flex;
    flex-direction: column;
`;

const RowList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

interface Props {
    markets: Market[];
    activeTab: MarketTab;
    setActiveTab: (tab: MarketTab) => void;
    tickers: Record<string, Ticker>;
}

export type NameType = "korean" | "english";
export type SortedKey = "price" | "change" | "volume" | null;
export type SortOrder = "asc" | "desc" | null;

function MarketSidebar({markets, activeTab, setActiveTab, tickers} : Props) {

    const btcPrice = tickers["KRW-BTC"]?.trade_price;
    const usdtPrice = tickers["KRW-USDT"]?.trade_price;

    const [sortKey, setSortKey] = useState<SortedKey>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);

    const [nameType, setNameType] = useState<NameType>("korean");
    const [search, setSearch] = useState<string>("");
    const deferredSearch = useDeferredValue(search);

    function handleSort(key: SortedKey) {
        if (sortKey !== key) {
            setSortKey(key);
            setSortOrder("desc");
            return;
        }

        if (sortOrder === "desc") {
            setSortOrder("asc");
        } else if (sortOrder === "asc") {
            setSortKey(null);
            setSortOrder(null);
        } else {
            setSortOrder("desc");
        }
    }

    const filteredMarkets = markets.filter((market) => {
        const keyword = deferredSearch.toLowerCase();

        return (
            market.korean_name.toLowerCase().includes(keyword) ||
            market.english_name.toLowerCase().includes(keyword) ||
            market.market.toLowerCase().includes(keyword)
        );
    })

    const sortedMarkets = [...filteredMarkets].sort((a,b) => {
        if (!sortKey || !sortOrder) return 0;

        const aTicker = tickers[a.market];
        const bTicker = tickers[b.market];

        const getValue = (t?: Ticker) => {
            if (!t) return 0;
            if (sortKey === "price") return t.trade_price;
            if (sortKey === "change") return t.signed_change_rate;
            if (sortKey === "volume") return t.acc_trade_price_24h;
            return 0;
        };

        const diff = getValue(aTicker) - getValue(bTicker);
        return sortOrder === "asc" ? diff : -diff;
    })

    return (
        <Container>
            <MarketSearch onSearch={setSearch}/>
            <MarketTabs activeTab={activeTab} setActiveTab={setActiveTab}/>
            <MarketHeaderRow
                nameType={nameType}
                setNameType={setNameType}
                sortKey={sortKey}
                sortOrder={sortOrder}
                handleSort={handleSort}
            />
            <RowList>
                {sortedMarkets?.map((market) => (
                    <MarketRow
                        key={market.market}
                        market={market}
                        ticker={tickers[market.market]}
                        btcPrice={btcPrice}
                        usdtPrice={usdtPrice}
                        nameType={nameType}
                    />
                ))}
            </RowList>
        </Container>
    )
}

export default MarketSidebar;