import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTickers, type Market, type Ticker } from "@api/api";
import useUpBitTickerSocket from "@hooks/useUpbitTickerSocket";
import type { MarketTab } from "@pages/market/MarketPage";
import type { NameType, SortedKey, SortOrder } from "@pages/market/components/sidebar/type";
import MarketRow from "../MarketRow";
import MarketTabs from "../MarketTabs/MarketTabs";
import MarketHeaderRow from "../MarketHeaderRow";
import MarketSearch from "../MarketSearch";
import { Container, RowList } from "./MarketSidebar.styles";

interface Props {
    markets: Market[] | null;
    onSelectedMarket: (market:Market) => void;
    tickerMap: Record<string, Ticker>;
    setTickerMap: Dispatch<SetStateAction<Record<string, Ticker>>>;
}

interface TickerMessage {
    code: string;
    trade_price: number;
    signed_change_rate: number;
    signed_change_price: number;
    high_price: number;
    low_price: number;
    acc_trade_volume_24h: number;
    acc_trade_price_24h: number;
    prev_closing_price: number;
    highest_52_week_price: number;
    highest_52_week_date: string;
    lowest_52_week_price: number;
    lowest_52_week_date: string;
    acc_bid_volume: number;
    acc_ask_volume: number;
}

function MarketSidebar({markets,  onSelectedMarket, tickerMap, setTickerMap} : Props) {

    const [sortKey, setSortKey] = useState<SortedKey>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);

    const [nameType, setNameType] = useState<NameType>("korean");
    const [search, setSearch] = useState<string>("");
    const [activeTab, setActiveTab] = useState<MarketTab>("KRW");
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
                ...(tabMarkets.map((market) => market.market) ?? []),
                "KRW-BTC",
                "KRW-USDT"
            ])
        );
    }, [tabMarkets]);

    const {data: tickers} = useQuery({
        queryKey: ["tickers", activeTab],
        queryFn: () => fetchTickers(marketCodes),
        enabled: marketCodes.length > 0
    });

    useEffect(() => {
        if (!tickers) return;
        setTickerMap((prev) => {
            const next = { ...prev };
            tickers.forEach((ticker) => {
                next[ticker.market] = ticker;
            });
            return next;
        });
    }, [tickers]);

    const handleTickerMessage = useCallback((data: TickerMessage) => {

        const prevPrice = prevPriceRef.current[data.code];
        const nextPrice = data.trade_price;

        setTickerMap((prev) => {
            return {
                ...prev,
                [data.code]: {
                    market: data.code,
                    trade_price: nextPrice,
                    signed_change_rate: data.signed_change_rate,
                    signed_change_price: data.signed_change_price,
                    high_price: data.high_price,
                    low_price: data.low_price,
                    acc_trade_volume_24h: data.acc_trade_volume_24h,
                    acc_trade_price_24h: data.acc_trade_price_24h,
                    prev_closing_price: data.prev_closing_price,
                    highest_52_week_price: data.highest_52_week_price,
                    highest_52_week_date: data.highest_52_week_date,
                    lowest_52_week_price: data.lowest_52_week_price,
                    lowest_52_week_date: data.lowest_52_week_date,
                    acc_bid_volume: data.acc_bid_volume,
                    acc_ask_volume: data.acc_ask_volume
                },
            };
        });

        if (prevPrice !== undefined && prevPrice !== nextPrice) {
            setFlashMap((prevFlash) => ({
                ...prevFlash,
                [data.code]: Date.now(),
            }));
        }

        prevPriceRef.current[data.code] = nextPrice;
    }, []);

    useUpBitTickerSocket(marketCodes, handleTickerMessage);

    const sortedMarkets = useMemo(() => {
        return [...filteredMarkets].sort((a,b) => {
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
    },[filteredMarkets, tickerMap, sortKey, sortOrder]);

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
                        onClick={() => onSelectedMarket(market)}
                        key={market.market}
                        market={market}
                        ticker={tickerMap[market.market]}
                        btcPrice={btcPrice}
                        usdtPrice={usdtPrice}
                        nameType={nameType}
                        flashKey={flashMap[market.market]}
                    />
                ))}
            </RowList>
        </Container>
    )
}

export default MarketSidebar;