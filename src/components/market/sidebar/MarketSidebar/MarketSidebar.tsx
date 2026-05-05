import {fetchTickers, type Market, type Ticker} from "@api/api.ts";
import MarketRow from "../MarketRow";
import type {MarketTab} from "@page/MarketPage.tsx";
import MarketTabs from "../MarketTabs/MarketTabs.tsx";
import MarketHeaderRow from "../MarketHeaderRow";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import MarketSearch from "../MarketSearch";
import {useQuery} from "@tanstack/react-query";
import useUpBitTickerSocket from "@hooks/useUpbitTickerSocket.ts";
import {RowList, Container} from "./MarketSidebar.styles.ts";
import type {NameType, SortedKey, SortOrder} from "@components/market/sidebar/type.ts";

interface Props {
    markets: Market[];
}

function MarketSidebar({markets} : Props) {

    const [sortKey, setSortKey] = useState<SortedKey>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);

    const [nameType, setNameType] = useState<NameType>("korean");
    const [search, setSearch] = useState<string>("");
    const [activeTab, setActiveTab] = useState<MarketTab>("KRW");
    const [tickerMap, setTickerMap] = useState<Record<string,Ticker>>({});
    const [flashMap, setFlashMap] = useState<Record<string, number>>({});

    const prevPriceRef = useRef<Record<string, number>>({});


    const tabMarkets = useMemo(() => {
       return markets?.filter((market) => market.market.startsWith(activeTab)) ?? [];
    },[markets, activeTab]);

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

    const filteredMarkets = useMemo(() => {
        return tabMarkets.filter((market) => {
            return (
                market.korean_name.toLowerCase().includes(search) ||
                market.english_name.toLowerCase().includes(search) ||
                market.market.toLowerCase().includes(search)
            );
        })
    }, [tabMarkets,  search]);

    const marketCodes = useMemo(() => {
        return Array.from(
            new Set([
                ...(filteredMarkets?.map((market) => market.market) ?? []),
                "KRW-BTC",
                "KRW-USDT"
            ])
        );
    }, [filteredMarkets]);

    const {data: tickers} = useQuery({
        queryKey: ["tickers", activeTab],
        queryFn: () => fetchTickers(marketCodes),
        enabled: filteredMarkets.length > 0
    });

    const tickerMap = useMemo(() => {
        return tickers?.reduce((acc,ticker) => {
            acc[ticker.market] = ticker;
            return acc;
        }, {} as Record<string, Ticker>) ?? {};
    },[tickers]);

    const sortedMarkets = [...filteredMarkets].sort((a,b) => {
        if (!sortKey || !sortOrder) return 0;

        const aTicker = tickerMap[a.market];
        const bTicker = tickerMap[b.market];

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

    const btcPrice = tickerMap["KRW-BTC"]?.trade_price;
    const usdtPrice = tickerMap["KRW-USDT"]?.trade_price;

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
                        ticker={tickerMap[market.market]}
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