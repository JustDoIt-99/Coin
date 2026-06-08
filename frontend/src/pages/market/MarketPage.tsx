import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { fetchMarkets, type Market, type Ticker } from "../../api/api";
import Loading from "../layout/Loading";
import MarketSidebar from "./components/sidebar/MarketSidebar";
import CoinDetail from "./components/coindetail";
import {
    ChartArea,
    ContentArea,
    OrderPanel,
    PageBackground,
    PageLayout,
    SidebarArea,
    TradingOrderPanel,
    TradingPanel,
} from "./MarketPage.styles";
import CoinCandleChart from "./components/chart/CoinCandleChart";
import OrderBook from "./components/orderbook/OrderBook/OrderBook";
import Order from "./components/order/Order";

export type MarketTab = "KRW" | "BTC" | "USDT";
type ActivePanel = "chart" | "orderbook" | "order" | null;

function MarketPage() {

    const {isLoading, data: markets, isError,} = useQuery({
        queryKey: ["markets"],
        queryFn: fetchMarkets,
    });

    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [tickerMap, setTickerMap] = useState<Record<string, Ticker>>({});
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);

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
                        <CoinCandleChart marketCode={marketCode} unit={15} currentPrice={ticker?.trade_price}
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

export default  MarketPage;