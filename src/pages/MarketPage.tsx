import {useQuery} from "@tanstack/react-query";
import {fetchMarkets, type Market, type Ticker} from "@api/api.ts";
import Loading from "@components/Loading.tsx";
import MarketSidebar from "@components/market/sidebar/MarketSidebar";
import CoinDetail from "@components/market/coindetail";
import {
    ChartArea,
    ContentArea,
    OrderPanel,
    PageBackground,
    PageLayout,
    SidebarArea, TradingOrderPanel,
    TradingPanel
} from "@pages/MarketPage.styles.ts";
import {useState} from "react";
import CoinCandleChart from "@components/market/chart/CoinCandleChart.tsx";
import OrderBook from "@components/market/orderbook/OrderBook/OrderBook.tsx";
import Order from "@components/market/order/Order";

export type MarketTab = "KRW" | "BTC" | "USDT";

function MarketPage() {

    const { isLoading, data: markets, isError,} = useQuery({
        queryKey: ["markets"],
        queryFn: fetchMarkets,
    });

    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [tickerMap, setTickerMap] = useState<Record<string,Ticker>>({});

    const marketCode = selectedMarket?.market ?? "KRW-BTC";
    const ticker = tickerMap[marketCode];

    if (isLoading) return <Loading />;
    if (isError) return <div>데이터를 불러오지 못했습니다.</div>;

    return (
        <PageBackground>
            <PageLayout>
                <ContentArea>
                    <CoinDetail market={selectedMarket} ticker={ selectedMarket ? tickerMap[selectedMarket.market] : tickerMap["KRW-BTC"]}/>
                    <ChartArea>
                        <CoinCandleChart marketCode={marketCode} unit={15} currentPrice={ticker?.trade_price}/>
                    </ChartArea>
                    <TradingOrderPanel>
                        <TradingPanel>
                            <OrderBook marketCode={marketCode} prevClosingPrice={ticker?.prev_closing_price} ticker={ticker}/>
                        </TradingPanel>
                        <OrderPanel>
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

export default MarketPage;