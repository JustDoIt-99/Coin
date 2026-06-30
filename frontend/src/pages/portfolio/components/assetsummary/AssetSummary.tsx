import {
    SummarySection,
    SummaryLeft,
    SummaryRight,
    SummaryGrid,
    SummaryRow,
    SummaryValue,
    CoinWeight,
    CoinName,
    LegendItem,
    ColorDot,
    LegendList,
    ChartBox,
    DonutBox,
    DetailSection,
    DetailHeader,
    DetailTitle,
    DetailCount,
    AssetTable,
    AssetCodeCell,
    AssetCode,
    AssetMarket,
    TrendText,
    EmptyDetail,
} from "./AssetSummary.styles";
import {useAuth} from "@auth/useAuth.ts";
import {useQuery} from "@tanstack/react-query";
import {fetchTickers, getPortfolioAssetSummary} from "@api/api.ts";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {PieChart, Pie, ResponsiveContainer, Tooltip} from "recharts";
import useTickerSocket from "@hooks/useTickerSocket";
import {ASSET_UPDATED_EVENT} from "@hooks/useAssetSyncSocket";
import type {TickerMessage} from "@pages/market/components/sidebar/MarketSidebar/MarketSidebar";

type Trend = "up" | "down";

type SummaryItem = {
    label: string;
    value: number;
    unit: "KRW" | "%";
    trend?: Trend;
};

const COIN_COLORS = ["#f7931a", "#627eea", "#3c3c3d", "#00c6ff", "#e84142", "#9c27b0"];
const PRICE_RENDER_INTERVAL_MS = 1000;

function AssetSummary() {
    const {accessToken} = useAuth();

    const [tickerMap, setTickerMap] = useState<Record<string, number>>({});
    const lastTickerUpdateAtRef = useRef<Record<string, number>>({});
    const pendingTickerRef = useRef<Record<string, TickerMessage>>({});
    const timeoutRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const {data, isLoading, error, refetch} = useQuery({
        queryKey: ["portfolio-summary"],
        queryFn: getPortfolioAssetSummary,
        enabled: !!accessToken,
    });

    useEffect(() => {
        const handleAssetUpdated = () => {
            void refetch();
        };

        window.addEventListener(ASSET_UPDATED_EVENT, handleAssetUpdated);

        return () => {
            window.removeEventListener(ASSET_UPDATED_EVENT, handleAssetUpdated);
        };
    }, [refetch]);

    const holdingMarketCodes = useMemo(() => {
        return new Set(
            data?.assets
                .filter((asset) => asset.assetCode !== "KRW")
                .map((asset) => `KRW-${asset.assetCode}`) ?? []
        );
    }, [data]);

    const holdingMarketCodeList = useMemo(() => {
        return Array.from(holdingMarketCodes).sort();
    }, [holdingMarketCodes]);

    const {data: tickers} = useQuery({
        queryKey: ["portfolio-tickers", holdingMarketCodeList],
        queryFn: () => fetchTickers(holdingMarketCodeList),
        enabled: holdingMarketCodeList.length > 0,
    });

    useEffect(() => {
        if (!tickers) return;

        setTickerMap((prev) => {
            const next = {...prev};

            tickers.forEach((ticker) => {
                next[ticker.market] = ticker.trade_price;
            });

            return next;
        });
    }, [tickers]);

    const applyTickerPrice = useCallback((ticker: TickerMessage) => {
        setTickerMap((prev) => {
            if (prev[ticker.code] === ticker.trade_price) return prev;

            return {
                ...prev,
                [ticker.code]: ticker.trade_price,
            };
        });
    }, []);

    const handleTickerMessage = useCallback((ticker: TickerMessage) => {
        if (!holdingMarketCodes.has(ticker.code)) return;

        const now = Date.now();
        const lastUpdatedAt = lastTickerUpdateAtRef.current[ticker.code] ?? 0;
        const elapsed = now - lastUpdatedAt;

        if (elapsed >= PRICE_RENDER_INTERVAL_MS) {
            if (timeoutRefs.current[ticker.code]) {
                clearTimeout(timeoutRefs.current[ticker.code]);
                delete timeoutRefs.current[ticker.code];
                delete pendingTickerRef.current[ticker.code];
            }

            lastTickerUpdateAtRef.current[ticker.code] = now;
            applyTickerPrice(ticker);
            return;
        }

        pendingTickerRef.current[ticker.code] = ticker;

        if (timeoutRefs.current[ticker.code]) return;

        timeoutRefs.current[ticker.code] = setTimeout(() => {
            const pendingTicker = pendingTickerRef.current[ticker.code];

            delete timeoutRefs.current[ticker.code];
            delete pendingTickerRef.current[ticker.code];

            if (!pendingTicker) return;

            lastTickerUpdateAtRef.current[ticker.code] = Date.now();
            applyTickerPrice(pendingTicker);
        }, PRICE_RENDER_INTERVAL_MS - elapsed);
    }, [applyTickerPrice, holdingMarketCodes]);

    useEffect(() => {
        return () => {
            Object.values(timeoutRefs.current).forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
            timeoutRefs.current = {};
            pendingTickerRef.current = {};
        };
    }, []);

    useTickerSocket(handleTickerMessage);

    const summary = useMemo(() => {
        if (!data) return null;

        const coinAssets = data.assets.filter((asset) => asset.assetCode !== "KRW");

        const totalValuationAmount = coinAssets.reduce((sum, asset) => {
            const marketCode = `KRW-${asset.assetCode}`;
            const currentPrice = tickerMap[marketCode] ?? asset.currentPrice;
            return sum + asset.balance * currentPrice;
        }, 0);

        const totalBuyAmount = coinAssets.reduce((sum, asset) => {
            return sum + asset.balance * (asset.averageBuyPrice ?? 0);
        }, 0);

        const totalProfitAmount = totalValuationAmount - totalBuyAmount;
        const totalProfitRate =
            totalBuyAmount === 0 ? 0 : (totalProfitAmount / totalBuyAmount) * 100;

        return {
            ...data,
            totalValuationAmount,
            totalBuyAmount,
            totalProfitAmount,
            totalProfitRate,
            totalAssetAmount: data.cashBalance + totalValuationAmount,
        };
    }, [data, tickerMap]);

    const chartData = useMemo(() => {
        if (!data) return [];

        const coinAssets = data.assets.filter((asset) => asset.assetCode !== "KRW");

        const coinValues = coinAssets
            .map((asset, index) => {
                const marketCode = `KRW-${asset.assetCode}`;
                const currentPrice = tickerMap[marketCode] ?? asset.currentPrice;
                const valuationAmount = asset.balance * currentPrice;

                return {
                    name: asset.assetCode,
                    value: valuationAmount,
                    fill: COIN_COLORS[index % COIN_COLORS.length],
                };
            })
            .filter((asset) => asset.value > 0);

        return coinValues;
    }, [data, tickerMap]);

    const totalCoinValuationAmount = useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.value, 0);
    }, [chartData]);

    const assetRows = useMemo(() => {
        if (!summary || !data) return [];

        return data.assets
            .filter((asset) => asset.assetCode !== "KRW" && asset.balance > 0)
            .map((asset) => {
                const marketCode = `KRW-${asset.assetCode}`;
                const currentPrice = tickerMap[marketCode] ?? asset.currentPrice;
                const averageBuyPrice = asset.averageBuyPrice ?? 0;
                const valuationAmount = asset.balance * currentPrice;
                const buyAmount = asset.balance * averageBuyPrice;
                const profitAmount = valuationAmount - buyAmount;
                const profitRate = buyAmount === 0 ? 0 : (profitAmount / buyAmount) * 100;
                const weight = summary.totalAssetAmount === 0
                    ? 0
                    : (valuationAmount / summary.totalAssetAmount) * 100;

                return {
                    assetCode: asset.assetCode,
                    marketCode,
                    balance: asset.balance,
                    averageBuyPrice,
                    currentPrice,
                    valuationAmount,
                    profitAmount,
                    profitRate,
                    weight,
                };
            })
            .sort((a, b) => b.valuationAmount - a.valuationAmount);
    }, [data, summary, tickerMap]);

    if (isLoading) return <div>불러오는 중...</div>;
    if (error) return <div>보유자산 조회 실패</div>;

    const formatSignedValue = (value: number, unit: "KRW" | "%") => {
        const absValue = Math.abs(value);
        const sign = value > 0 ? "+" : value < 0 ? "-" : "";

        const formattedValue =
            unit === "%"
                ? absValue.toFixed(2)
                : Math.round(absValue).toLocaleString();

        return `${sign}${formattedValue}`;
    };

    const formatCurrency = (value: number) => {
        return Math.round(value).toLocaleString();
    };

    const summaryItems: SummaryItem[] = [
        {label: "보유 KRW", value: summary?.cashBalance ?? 0, unit: "KRW"},
        {label: "총 보유자산", value: summary?.totalAssetAmount ?? 0, unit: "KRW"},
        {label: "총 매수", value: summary?.totalBuyAmount ?? 0, unit: "KRW"},
        {
            label: "총 평가손익",
            value: summary?.totalProfitAmount ?? 0,
            unit: "KRW",
            trend:
                (summary?.totalProfitAmount ?? 0) > 0
                    ? "up"
                    : (summary?.totalProfitAmount ?? 0) < 0
                        ? "down"
                        : undefined,
        },
        {label: "총 평가", value: summary?.totalValuationAmount ?? 0, unit: "KRW"},
        {
            label: "총 평가수익률",
            value: summary?.totalProfitRate ?? 0,
            unit: "%",
            trend:
                (summary?.totalProfitRate ?? 0) > 0
                    ? "up"
                    : (summary?.totalProfitRate ?? 0) < 0
                        ? "down"
                        : undefined,
        },
        {label: "주문가능", value: summary?.availableOrderAmount ?? 0, unit: "KRW"},
    ];

    return (
        <>
            <SummarySection>
                <SummaryLeft>
                    <SummaryGrid>
                        {summaryItems.map((item) => (
                            <SummaryRow key={item.label}>
                                <span>{item.label}</span>
                                <SummaryValue $trend={item.trend}>
                                    {(item.label === "총 평가손익" || item.label === "총 평가수익률")
                                        ? formatSignedValue(Number(item.value), item.unit)
                                        : formatCurrency(Number(item.value))}
                                    <small>{item.unit}</small>
                                </SummaryValue>
                            </SummaryRow>
                        ))}
                    </SummaryGrid>
                </SummaryLeft>
                <SummaryRight>
                    {chartData.length > 0 ? (
                        <ChartBox>
                            <DonutBox>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={chartData.length > 1 ? 1 : 0}
                                            isAnimationActive={false}
                                        />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </DonutBox>

                            <LegendList>
                                {chartData.map((item) => (
                                    <LegendItem key={item.name}>
                                        <ColorDot $color={item.fill} />
                                        <CoinName>{item.name}</CoinName>
                                        <CoinWeight>
                                            {((item.value / totalCoinValuationAmount) * 100).toFixed(2)}%
                                        </CoinWeight>
                                    </LegendItem>
                                ))}
                            </LegendList>
                        </ChartBox>
                    ) : (
                        "보유자산 비중 그래프가 제공됩니다."
                    )}
                </SummaryRight>
            </SummarySection>

            <DetailSection>
                <DetailHeader>
                    <DetailTitle>보유 코인 상세</DetailTitle>
                    <DetailCount>{assetRows.length}개 자산</DetailCount>
                </DetailHeader>
                {assetRows.length > 0 ? (
                    <AssetTable>
                        <thead>
                        <tr>
                            <th>코인</th>
                            <th>보유수량</th>
                            <th>평균매수가</th>
                            <th>현재가</th>
                            <th>평가금액</th>
                            <th>평가손익</th>
                            <th>수익률</th>
                            <th>비중</th>
                        </tr>
                        </thead>
                        <tbody>
                        {assetRows.map((asset) => {
                            const trend = asset.profitAmount > 0
                                ? "up"
                                : asset.profitAmount < 0
                                    ? "down"
                                    : undefined;

                            return (
                                <tr key={asset.assetCode}>
                                    <td>
                                        <AssetCodeCell>
                                            <AssetCode>{asset.assetCode}</AssetCode>
                                            <AssetMarket>{asset.marketCode}</AssetMarket>
                                        </AssetCodeCell>
                                    </td>
                                    <td>{formatQuantity(asset.balance)}</td>
                                    <td>{formatCurrency(asset.averageBuyPrice)}</td>
                                    <td>{formatCurrency(asset.currentPrice)}</td>
                                    <td>{formatCurrency(asset.valuationAmount)}</td>
                                    <td>
                                        <TrendText $trend={trend}>
                                            {formatSignedValue(asset.profitAmount, "KRW")}
                                        </TrendText>
                                    </td>
                                    <td>
                                        <TrendText $trend={trend}>
                                            {formatSignedValue(asset.profitRate, "%")}%
                                        </TrendText>
                                    </td>
                                    <td>{asset.weight.toFixed(2)}%</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </AssetTable>
                ) : (
                    <EmptyDetail>보유 중인 코인이 없습니다.</EmptyDetail>
                )}
            </DetailSection>
        </>
    );
}

function formatQuantity(value: number) {
    return value.toLocaleString(undefined, {
        maximumFractionDigits: 8,
    });
}

export default AssetSummary;
