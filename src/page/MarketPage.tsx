import {useQuery} from "@tanstack/react-query";
import {fetchMarkets, fetchTickers, type Ticker} from "../api/api.ts";
import Loading from "../components/Loading.tsx";
import MarketSidebar from "../components/market/sidebar/MarketSidebar.tsx";
import {useMemo, useState} from "react";

export type MarketTab = "KRW"|"BTC"|"USDT";

function MarketPage() {

    const [activeTab, setActiveTab] = useState<MarketTab>("KRW");

    const {isLoading, data:markets, isError} = useQuery({
        queryKey:["markets"],
        queryFn:fetchMarkets
    });

    const filteredMarkets = markets?.filter((market) => market.market.startsWith(activeTab)) ?? [];

    const marketCodes = Array.from(
        new Set([
            ...(filteredMarkets?.map((market) => market.market) ?? []),
            "KRW-BTC",
            "KRW-USDT"
        ])
    );

    const {data: tickers} = useQuery({
        queryKey: ["tickers", activeTab],
        queryFn: () => fetchTickers(marketCodes),
        enabled: !isLoading && filteredMarkets.length > 0
    });

    const tickerMap = useMemo(() => {
        return tickers?.reduce((acc,ticker) => {
            acc[ticker.market] = ticker;
            return acc;
        }, {} as Record<string, Ticker>);
    },[tickers]);

    if (isLoading) return <Loading/>;
    if (isError) return <div>데이터를 불러오지 못했습니다.</div>

    return (
        <>
            <MarketSidebar
                markets={filteredMarkets ?? []}
                tickers={tickerMap ?? {}}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </>
    )
}

export default MarketPage;