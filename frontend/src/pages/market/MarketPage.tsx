import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { fetchMarkets, type Market, type Ticker } from "@api/api";
import Loading from "@pages/layout/Loading";
import MarketSidebar from "@pages/market/components/sidebar/MarketSidebar";
import CoinDetail from "@pages/market/components/coindetail";
import {
    ChartArea,
    ChartIntervalSelect,
    ChartToolbar,
    ContentArea,
    OrderPanel,
    PageBackground,
    PageLayout,
    SidebarArea,
    TradingOrderPanel,
    TradingPanel,
} from "@pages/market/MarketPage.styles";
import CoinCandleChart from "@pages/market/components/chart/CoinCandleChart";
import OrderBook from "@pages/market/components/orderbook/OrderBook/OrderBook";
import Order from "@pages/market/components/order/Order";
import type {CandleInterval} from "@api/api";

export type MarketTab = "KRW" | "BTC" | "USDT";
type ActivePanel = "chart" | "orderbook" | "order" | null;

const candleIntervals: {label: string; value: CandleInterval}[] = [
    {label: "1분", value: {type: "minute", unit: 1}},
    {label: "3분", value: {type: "minute", unit: 3}},
    {label: "5분", value: {type: "minute", unit: 5}},
    {label: "10분", value: {type: "minute", unit: 10}},
    {label: "15분", value: {type: "minute", unit: 15}},
    {label: "30분", value: {type: "minute", unit: 30}},
    {label: "1시간", value: {type: "minute", unit: 60}},
    {label: "4시간", value: {type: "minute", unit: 240}},
    {label: "일", value: {type: "day"}},
    {label: "주", value: {type: "week"}},
    {label: "월", value: {type: "month"}},
];

function MarketPage() {

    const {isLoading, data: markets, isError,} = useQuery({
        queryKey: ["markets"],
        queryFn: fetchMarkets,
    });

    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [tickerMap, setTickerMap] = useState<Record<string, Ticker>>({});
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    const [candleInterval, setCandleInterval] = useState<CandleInterval>({type: "minute", unit: 15});

    const marketCode = selectedMarket?.market ?? "KRW-BTC";
    const ticker = tickerMap[marketCode];

    if (isLoading) return <Loading/>;
    if (isError) return <div>데이터를 불러오지 못했습니다.</div>;

    return (
        <PageBackground onMouseDown={() => setActivePanel(null)}>
            <PageLayout>
                <ContentArea>
                    <CoinDetail market={selectedMarket} ticker={ticker}/>
                    <ChartArea onMouseDown={(e) => {
                        e.stopPropagation();
                        setActivePanel("chart");
                    }}>
                        <ChartToolbar>
                            <ChartIntervalSelect
                                value={getCandleIntervalKey(candleInterval)}
                                onChange={(event) => {
                                    const nextInterval = candleIntervals.find(
                                        (interval) => getCandleIntervalKey(interval.value) === event.target.value
                                    );

                                    if (nextInterval) {
                                        setCandleInterval(nextInterval.value);
                                    }
                                }}
                            >
                                {candleIntervals.map((interval) => (
                                    <option
                                        key={getCandleIntervalKey(interval.value)}
                                        value={getCandleIntervalKey(interval.value)}
                                    >
                                        {interval.label}
                                    </option>
                                ))}
                            </ChartIntervalSelect>
                        </ChartToolbar>
                        <CoinCandleChart marketCode={marketCode} interval={candleInterval} currentPrice={ticker?.trade_price}
                                         active={activePanel === "chart"}/>
                    </ChartArea>
                    <TradingOrderPanel>
                        <TradingPanel
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                setActivePanel("orderbook");
                            }}
                        >
                            <OrderBook marketCode={marketCode} prevClosingPrice={ticker?.prev_closing_price}
                                       ticker={ticker} active={activePanel === "orderbook"}/>
                        </TradingPanel>
                        <OrderPanel
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                setActivePanel("order");
                            }}
                        >
                            <Order ticker={ticker}/>
                        </OrderPanel>
                    </TradingOrderPanel>
                </ContentArea>
                <SidebarArea>
                    <MarketSidebar
                        markets={markets ?? []}
                        onSelectedMarket={(market) => setSelectedMarket(market)}
                        tickerMap={tickerMap}
                        setTickerMap={setTickerMap}
                    />
                </SidebarArea>
            </PageLayout>
        </PageBackground>
    );

}

function getCandleIntervalKey(interval: CandleInterval) {
    return `${interval.type}-${interval.unit ?? "default"}`;
}

export default  MarketPage;
