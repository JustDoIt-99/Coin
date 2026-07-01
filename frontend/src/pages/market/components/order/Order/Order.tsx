import {useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import OrderTab from "@pages/market/components/order/OrderTab";
import OrderForm from "@pages/market/components/order/OrderForm";
import OrderHistory from "@pages/market/components/order/OrderHistory";
import {
    Container,
    PositionSummary,
    SummaryGrid,
    SummaryHeader,
    SummaryItem,
    SummaryLabel,
    SummaryMarket,
    SummaryValue
} from "@pages/market/components/order/Order/Order.styles";
import {fetchAssets, type Ticker} from "@api/api";
import {useAuth} from "@auth/useAuth";
import useTradeSocket from "@hooks/useTradeSocket";

interface Props {
    marketCode: string;
    ticker?: Ticker;
    selectedOrderBookPrice?: OrderBookPriceSelection;
}

interface OrderBookPriceSelection {
    price: number;
    sequence: number;
}

function Order({marketCode, ticker, selectedOrderBookPrice}: Props) {

    const [activeTab, setActiveTab] = useState<"buy" | "sell" | "history">("buy");
    const [realtimePrice, setRealtimePrice] = useState<{marketCode: string; price: number} | null>(null);
    const {isAuthenticated} = useAuth();
    const queryClient = useQueryClient();
    const {data: assets = []} = useQuery({
        queryKey: ["assets"],
        queryFn: fetchAssets,
        enabled: isAuthenticated,
    });
    const [baseAssetCode = "KRW", targetAssetCode = "BTC"] = marketCode.split("-");
    const availableBaseBalance = assets.find((asset) => asset.assetCode === baseAssetCode)?.balance ?? 0;
    const targetAsset = assets.find((asset) => asset.assetCode === targetAssetCode);
    const availableTargetBalance = targetAsset?.balance ?? 0;
    const averageBuyPrice = targetAsset?.averageBuyPrice ?? 0;
    const currentPrice = realtimePrice?.marketCode === marketCode
        ? realtimePrice.price
        : ticker?.trade_price ?? 0;
    const valuationAmount = availableTargetBalance * currentPrice;
    const buyAmount = availableTargetBalance * averageBuyPrice;
    const profitAmount = valuationAmount - buyAmount;
    const profitRate = buyAmount > 0 ? (profitAmount / buyAmount) * 100 : 0;
    const profitTone = profitAmount > 0 ? "profit" : profitAmount < 0 ? "loss" : "neutral";
    const hasPosition = availableTargetBalance > 0;

    useTradeSocket(marketCode, (trade) => {
        setRealtimePrice({
            marketCode,
            price: trade.trade_price,
        });
    });

    const invalidateAssetQueries = () => {
        void queryClient.invalidateQueries({queryKey: ["assets"]});
        void queryClient.invalidateQueries({queryKey: ["portfolio-summary"]});
    };

    return (
        <Container>
            <OrderTab activeTab={activeTab} setActiveTab={setActiveTab}/>
            {activeTab !== "history" && (
                <OrderForm
                    marketCode={marketCode}
                    tradeType={activeTab}
                    isAuthenticated={isAuthenticated}
                    availableBaseBalance={availableBaseBalance}
                    availableTargetBalance={availableTargetBalance}
                    ticker={ticker}
                    selectedOrderBookPrice={selectedOrderBookPrice}
                    onOrderCompleted={invalidateAssetQueries}
                />
            )}
            {activeTab === "history" && (
                <OrderHistory
                    marketCode={marketCode}
                    onOrderCancelled={invalidateAssetQueries}
                />
            )}
            <PositionSummary>
                <SummaryHeader>
                    <span>내 보유 현황</span>
                    <SummaryMarket>{targetAssetCode}</SummaryMarket>
                </SummaryHeader>
                <SummaryGrid>
                    <SummaryItem>
                        <SummaryLabel>보유수량</SummaryLabel>
                        <SummaryValue>{formatQuantity(availableTargetBalance)} {targetAssetCode}</SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                        <SummaryLabel>평균매수가</SummaryLabel>
                        <SummaryValue>{hasPosition ? `${formatKrw(averageBuyPrice)} ${baseAssetCode}` : "-"}</SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                        <SummaryLabel>현재가</SummaryLabel>
                        <SummaryValue>{currentPrice > 0 ? `${formatKrw(currentPrice)} ${baseAssetCode}` : "-"}</SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                        <SummaryLabel>평가금액</SummaryLabel>
                        <SummaryValue>{hasPosition ? `${formatKrw(valuationAmount)} ${baseAssetCode}` : "-"}</SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                        <SummaryLabel>평가손익</SummaryLabel>
                        <SummaryValue tone={profitTone}>
                            {hasPosition ? `${formatSignedKrw(profitAmount)} ${baseAssetCode}` : "-"}
                        </SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                        <SummaryLabel>수익률</SummaryLabel>
                        <SummaryValue tone={profitTone}>
                            {hasPosition ? `${formatSignedRate(profitRate)}%` : "-"}
                        </SummaryValue>
                    </SummaryItem>
                </SummaryGrid>
            </PositionSummary>
        </Container>
    );
}

function formatKrw(value: number) {
    return Math.round(value).toLocaleString();
}

function formatSignedKrw(value: number) {
    const sign = value > 0 ? "+" : "";
    return `${sign}${formatKrw(value)}`;
}

function formatQuantity(value: number) {
    return value.toLocaleString(undefined, {
        maximumFractionDigits: 8,
    });
}

function formatSignedRate(value: number) {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}`;
}

export default Order;
