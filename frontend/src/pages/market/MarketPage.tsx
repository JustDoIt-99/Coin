import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {ChevronDown, Plus, X} from "lucide-react";

import {fetchAssets, fetchMarkets, type Market, type Ticker} from "@api/api";
import Loading from "@pages/layout/Loading";
import MarketSidebar from "@pages/market/components/sidebar/MarketSidebar";
import CoinDetail from "@pages/market/components/coindetail";
import {
    ChartArea,
    ChartIntervalSelect,
    ChartToolbar,
    ContentArea,
    MovingAverageButton,
    MovingAverageChip,
    MovingAverageColor,
    MovingAverageControls,
    MovingAverageDropdown,
    MovingAverageForm,
    MovingAverageInput,
    MovingAverageRemoveButton,
    MovingAverageTrigger,
    OrderPanel,
    PageBackground,
    PageLayout,
    SidebarArea,
    TradingOrderPanel,
    TradingPanel,
} from "@pages/market/MarketPage.styles";
import CoinCandleChart, {type MovingAverageLine} from "@pages/market/components/chart/CoinCandleChart";
import OrderBook from "@pages/market/components/orderbook/OrderBook/OrderBook";
import Order from "@pages/market/components/order/Order";
import type {CandleInterval} from "@api/api";
import {useAuth} from "@auth/useAuth";

export type MarketTab = "KRW" | "BTC" | "USDT";
type ActivePanel = "chart" | "orderbook" | "order" | null;
interface OrderBookPriceSelection {
    price: number;
    sequence: number;
}

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

const movingAverageColors = ["#f59f00", "#22a06b", "#7c3aed", "#0f766e", "#db2777", "#64748b"];
const defaultMovingAverages: MovingAverageLine[] = [
    {period: 5, color: movingAverageColors[0]},
    {period: 20, color: movingAverageColors[1]},
    {period: 60, color: movingAverageColors[2]},
];

function MarketPage() {
    const {isAuthenticated} = useAuth();

    const {isLoading, data: markets, isError,} = useQuery({
        queryKey: ["markets"],
        queryFn: fetchMarkets,
    });

    const {data: assets = []} = useQuery({
        queryKey: ["assets"],
        queryFn: fetchAssets,
        enabled: isAuthenticated,
        refetchInterval: isAuthenticated ? 1000 : false,
    });

    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [tickerMap, setTickerMap] = useState<Record<string, Ticker>>({});
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    const [candleInterval, setCandleInterval] = useState<CandleInterval>({type: "minute", unit: 15});
    const [movingAverages, setMovingAverages] = useState<MovingAverageLine[]>(defaultMovingAverages);
    const [movingAverageInput, setMovingAverageInput] = useState("");
    const [isMovingAverageMenuOpen, setIsMovingAverageMenuOpen] = useState(false);
    const [selectedOrderBookPrice, setSelectedOrderBookPrice] = useState<OrderBookPriceSelection | undefined>();

    const marketCode = selectedMarket?.market ?? "KRW-BTC";
    const ticker = tickerMap[marketCode];
    const targetAssetCode = marketCode.split("-")[1];
    const targetAsset = assets.find((asset) => asset.assetCode === targetAssetCode);
    const averageBuyPrice = targetAsset && targetAsset.balance > 0
        ? targetAsset.averageBuyPrice
        : undefined;

    if (isLoading) return <Loading/>;
    if (isError) return <div>데이터를 불러오지 못했습니다.</div>;

    const addMovingAverage = () => {
        const period = Number(movingAverageInput);

        if (!Number.isInteger(period) || period <= 0 || period > 300) {
            setMovingAverageInput("");
            return;
        }

        if (movingAverages.some((movingAverage) => movingAverage.period === period)) {
            setMovingAverageInput("");
            return;
        }

        setMovingAverages((prev) => [
            ...prev,
            {
                period,
                color: movingAverageColors[prev.length % movingAverageColors.length],
            },
        ].sort((a, b) => a.period - b.period));
        setMovingAverageInput("");
    };

    const removeMovingAverage = (period: number) => {
        setMovingAverages((prev) => prev.filter((movingAverage) => movingAverage.period !== period));
    };

    return (
        <PageBackground onMouseDown={() => setActivePanel(null)}>
            <PageLayout>
                <ContentArea>
                    <CoinDetail market={selectedMarket} ticker={ticker}/>
                    <ChartArea onMouseDown={(e) => {
                        e.stopPropagation();
                        setActivePanel("chart");
                    }} onMouseEnter={() => setActivePanel("chart")}>
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
                            <MovingAverageControls>
                                <MovingAverageTrigger
                                    type="button"
                                    onClick={() => setIsMovingAverageMenuOpen((prev) => !prev)}
                                >
                                    이동평균 {movingAverages.length}
                                    <ChevronDown size={14}/>
                                </MovingAverageTrigger>
                                {isMovingAverageMenuOpen && (
                                    <MovingAverageDropdown>
                                        {movingAverages.map((movingAverage) => (
                                            <MovingAverageChip key={movingAverage.period}>
                                                <MovingAverageColor color={movingAverage.color}/>
                                                MA{movingAverage.period}
                                                <MovingAverageRemoveButton
                                                    type="button"
                                                    title={`MA${movingAverage.period} 제거`}
                                                    onClick={() => removeMovingAverage(movingAverage.period)}
                                                >
                                                    <X size={12}/>
                                                </MovingAverageRemoveButton>
                                            </MovingAverageChip>
                                        ))}
                                        <MovingAverageForm
                                            onSubmit={(event) => {
                                                event.preventDefault();
                                                addMovingAverage();
                                            }}
                                        >
                                            <MovingAverageInput
                                                type="number"
                                                min={1}
                                                max={300}
                                                value={movingAverageInput}
                                                aria-label="이동 평균 기간"
                                                placeholder="MA"
                                                onChange={(event) => setMovingAverageInput(event.target.value)}
                                            />
                                            <MovingAverageButton type="submit" title="이동 평균 추가">
                                                <Plus size={14}/>
                                            </MovingAverageButton>
                                        </MovingAverageForm>
                                    </MovingAverageDropdown>
                                )}
                            </MovingAverageControls>
                        </ChartToolbar>
                        <CoinCandleChart
                            marketCode={marketCode}
                            interval={candleInterval}
                            movingAverages={movingAverages}
                            currentPrice={ticker?.trade_price}
                            currentPriceTimestamp={ticker?.timestamp}
                            averageBuyPrice={averageBuyPrice}
                            active={activePanel === "chart"}
                        />
                    </ChartArea>
                    <TradingOrderPanel>
                        <TradingPanel
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                setActivePanel("orderbook");
                            }}
                        >
                            <OrderBook
                                marketCode={marketCode}
                                prevClosingPrice={ticker?.prev_closing_price}
                                ticker={ticker}
                                active={activePanel === "orderbook"}
                                onSelectPrice={(price) => {
                                    setSelectedOrderBookPrice((prev) => ({
                                        price,
                                        sequence: (prev?.sequence ?? 0) + 1,
                                    }));
                                }}
                            />
                        </TradingPanel>
                        <OrderPanel
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                setActivePanel("order");
                            }}
                        >
                            <Order
                                marketCode={marketCode}
                                ticker={ticker}
                                selectedOrderBookPrice={selectedOrderBookPrice}
                            />
                        </OrderPanel>
                    </TradingOrderPanel>
                </ContentArea>
                <SidebarArea>
                    <MarketSidebar
                        markets={markets ?? []}
                        onSelectedMarket={(market) => {
                            setSelectedMarket(market);
                            setSelectedOrderBookPrice(undefined);
                        }}
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
